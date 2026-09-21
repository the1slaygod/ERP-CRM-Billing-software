export function calculateItemTax(productCategory: string | null | undefined, defaultGst: number, rate: number): number {
  if (!productCategory) return defaultGst;
  
  const category = productCategory.toLowerCase();
  const isClothing = category.includes("clothing") || category.includes("apparel") || category.includes("garment");

  if (isClothing) {
    if (rate <= 1000) return 5;
    return 12;
  }

  return defaultGst;
}
