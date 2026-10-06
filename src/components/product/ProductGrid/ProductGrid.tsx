"use client";

import { ShelfGrid, ShelfTile, type ShelfProduct } from "@/components/product/ShelfTile/ShelfTile";

interface ProductGridProps {
  products: ShelfProduct[];
  dense?: boolean;
  priorityCount?: number;
}

export function ProductGrid({ products, dense = false, priorityCount = 0 }: ProductGridProps) {
  return (
    <ShelfGrid dense={dense}>
      {products.map((product, index) => (
        <ShelfTile key={product.id} product={product} priority={index < priorityCount} />
      ))}
    </ShelfGrid>
  );
}
