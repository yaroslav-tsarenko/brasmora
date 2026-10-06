import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendOrderConfirmationEmail, sendOrderInvoiceEmail } from "@/lib/email";
import { scheduleEmail } from "@/lib/email-jobs";
import { BRAND, SITE_URL } from "@/lib/brand";
import { fetchPaymentStatus, getPayByLinkConfig } from "@/lib/paybylink";
import { ORDER_VIEW_INCLUDE, orderTotals, orderView, toNumber, type StoredAddress } from "@/lib/orders";
import { markDiscountUsed, WELCOME_CODE_PREFIX, type ResolvedDiscount } from "@/lib/discounts";

type LoadedOrder = NonNullable<Awaited<ReturnType<typeof loadOrder>>>;

function loadOrder(where: { id: string } | { paymentId: string }) {
  return prisma.order.findFirst({ where, include: ORDER_VIEW_INCLUDE });
}

function respond(order: LoadedOrder, verification: "confirmed" | "pending" | "failed" | "review" | "unavailable") {
  return NextResponse.json({ verification, order: orderView(order) });
}

async function fulfil(order: LoadedOrder) {
  for (const item of order.items) {
    await prisma.product.updateMany({
      where: { id: item.productId, trackInventory: true, quantity: { gte: item.quantity } },
      data: { quantity: { decrement: item.quantity } },
    });
  }

  if (order.discountCode && order.discountPercent) {
    const discount: ResolvedDiscount = {
      type: order.discountCode.startsWith(`${WELCOME_CODE_PREFIX}-`) ? "welcome" : "newsletter",
      percent: toNumber(order.discountPercent),
      code: order.discountCode,
      source: "auto",
    };
    await markDiscountUsed(discount, order.userId).catch((error) => console.error("Discount update failed:", error));
  }

  const totals = orderTotals(order);
  const shipping = (order.shippingAddress ?? {}) as StoredAddress;
  const hubToken = process.env.HOROLSKA_HUB_TOKEN;
  if (hubToken) {
    const payload = {
      site_name: BRAND.name,
      site_url: `${SITE_URL}/`,
      order_id: order.id,
      admin_url: "",
      billing: {
        first_name: shipping.firstName || "",
        last_name: shipping.lastName || "",
        email: order.customerEmail || "",
        phone: order.customerPhone || "",
        address_1: shipping.address1 || "",
        address_2: shipping.address2 || "",
        city: shipping.city || "",
        state: shipping.province || "",
        postcode: shipping.postalCode || "",
        country: shipping.country || "",
      },
      items: order.items.map((item, index) => ({
        name: item.productName,
        qty: item.quantity,
        price: totals.lines[index].unit,
        total: totals.lines[index].total,
      })),
      total: totals.total,
      currency: order.currency,
    };
    fetch("https://hub.horolska.lv/api/v1/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${hubToken}` },
      body: JSON.stringify(payload),
    })
      .then(async (res) => {
        if (!res.ok) console.error("Order hub webhook failed:", res.status, await res.text());
      })
      .catch((err) => console.error("Order hub webhook error:", err));
  }

  const emailPayload = {
    orderId: order.id,
    orderNumber: order.orderNumber,
    customerName: order.customerName,
    customerEmail: order.customerEmail,
    items: order.items,
    subtotal: order.subtotal,
    taxAmount: order.taxAmount,
    shippingCost: order.shippingCost,
    discountAmount: order.discountAmount,
    discountPercent: order.discountPercent,
    total: order.total,
    currency: order.currency,
    exchangeRate: order.exchangeRate,
    shippingMethod: order.shippingMethod || "standard",
    shippingAddress: shipping,
    billingAddress: (order.billingAddress ?? null) as StoredAddress | null,
    paymentMethod: order.paymentMethod,
    createdAt: order.createdAt,
  };
  scheduleEmail(`order confirmation ${order.orderNumber}`, () => sendOrderConfirmationEmail(emailPayload));
  scheduleEmail(`order invoice ${order.orderNumber}`, () => sendOrderInvoiceEmail(emailPayload));
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const paymentLinkId = searchParams.get("paymentLinkId") || searchParams.get("id");
    const checkoutId = searchParams.get("checkoutId");

    if (!paymentLinkId || !checkoutId) {
      return NextResponse.json({ code: "MISSING_REFERENCE" }, { status: 400 });
    }

    const order = await loadOrder({ paymentId: paymentLinkId });
    if (!order) {
      return NextResponse.json({ code: "ORDER_NOT_FOUND" }, { status: 404 });
    }

    if (order.paymentStatus === "PAID") return respond(order, "confirmed");

    const config = getPayByLinkConfig();
    if (!config) return respond(order, "unavailable");

    let status;
    try {
      status = await fetchPaymentStatus(config, paymentLinkId, checkoutId);
    } catch (error) {
      console.error("Payment status check failed:", error);
      return respond(order, "pending");
    }

    if (status.outcome === "pending") return respond(order, "pending");

    if (status.outcome === "failed") {
      await prisma.order.updateMany({ where: { id: order.id, paymentStatus: "PENDING" }, data: { paymentStatus: "FAILED" } });
      const fresh = await loadOrder({ id: order.id });
      return respond(fresh ?? order, fresh?.paymentStatus === "PAID" ? "confirmed" : "failed");
    }

    const expected = toNumber(order.chargeTotal ?? order.total);
    const amountMatches = status.amount !== null && Math.abs(status.amount - expected) < 0.01;
    const currencyMatches = (status.currency ?? "").toUpperCase() === order.currency.toUpperCase();
    if (!amountMatches || !currencyMatches) {
      const note = `Payment ${status.code} reported ${status.amount ?? "?"} ${status.currency ?? "?"}; expected ${expected.toFixed(2)} ${order.currency}. Held for review.`;
      console.error(`Order ${order.orderNumber}: ${note}`);
      if (!order.notes?.includes(note)) {
        await prisma.order.update({ where: { id: order.id }, data: { notes: [order.notes, note].filter(Boolean).join("\n") } });
      }
      return respond(order, "review");
    }

    const claimed = await prisma.order.updateMany({
      where: { id: order.id, paymentStatus: { not: "PAID" } },
      data: { paymentStatus: "PAID", status: "CONFIRMED", paidAt: new Date() },
    });
    const paid = await loadOrder({ id: order.id });
    if (!paid) return NextResponse.json({ code: "ORDER_NOT_FOUND" }, { status: 404 });
    if (claimed.count === 1) await fulfil(paid);
    return respond(paid, "confirmed");
  } catch (error) {
    console.error("Error verifying order payment:", error);
    return NextResponse.json({ code: "SERVER_ERROR" }, { status: 500 });
  }
}
