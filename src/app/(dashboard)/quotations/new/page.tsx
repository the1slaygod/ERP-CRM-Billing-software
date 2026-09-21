import { prisma } from "@/lib/prisma";
import { QuotationForm } from "@/components/billing/QuotationForm";

export default async function NewQuotationPage() {
  const customers = await prisma.customer.findMany({
    select: { id: true, name: true, gstin: true, billingAddress: true },
    orderBy: { name: "asc" }
  });

  const products = await prisma.product.findMany({
    select: { id: true, name: true, sku: true, sellingPrice: true, gstPercent: true, hsnSac: true, unit: true, category: true },
    orderBy: { name: "asc" }
  });

  return (
    <QuotationForm customers={customers as any} products={products as any} />
  );
}
