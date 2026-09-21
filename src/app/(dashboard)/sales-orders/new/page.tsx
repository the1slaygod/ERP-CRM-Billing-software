import { prisma } from "@/lib/prisma";
import { SalesOrderForm } from "@/components/billing/SalesOrderForm";

export default async function NewSalesOrderPage() {
  const customers = await prisma.customer.findMany({
    select: { id: true, name: true, gstin: true, billingAddress: true },
    orderBy: { name: "asc" }
  });

  const products = await prisma.product.findMany({
    select: { id: true, name: true, sku: true, sellingPrice: true, gstPercent: true, hsnSac: true, unit: true },
    orderBy: { name: "asc" }
  });

  return (
    <SalesOrderForm customers={customers as any} products={products as any} />
  );
}
