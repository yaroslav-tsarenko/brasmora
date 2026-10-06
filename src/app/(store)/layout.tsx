import { NextIntlClientProvider } from "next-intl";
import { LocaleSync } from "@/providers/LocaleSync";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { AuthProvider } from "@/providers/AuthProvider";
import { CartProvider } from "@/providers/CartProvider";
import { CurrencyProvider } from "@/providers/CurrencyProvider";
import { ToastProvider } from "@/providers/ToastProvider";
import { Header } from "@/components/layout/Header/Header";
import { Footer } from "@/components/layout/Footer/Footer";

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <NextIntlClientProvider>
      <LocaleSync />
      <ThemeProvider>
        <AuthProvider>
          <CurrencyProvider>
            <CartProvider>
              <div className="flex flex-col min-h-screen">
                <Header />
                <main className="flex-1">{children}</main>
                <Footer />
              </div>
              <ToastProvider />
            </CartProvider>
          </CurrencyProvider>
        </AuthProvider>
      </ThemeProvider>
    </NextIntlClientProvider>
  );
}
