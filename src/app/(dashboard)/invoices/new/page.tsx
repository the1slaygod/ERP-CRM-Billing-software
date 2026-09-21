import { prisma } from "@/lib/prisma";
import { InvoiceForm } from "@/components/billing/InvoiceForm";

import { Suspense } from "react";

export default async function NewInvoicePage() {
  const customers = await prisma.customer.findMany({
    select: { id: true, name: true, gstin: true, billingAddress: true },
    orderBy: { name: "asc" }
  });

  const products = await prisma.product.findMany({
    select: { id: true, name: true, sku: true, sellingPrice: true, gstPercent: true, hsnSac: true, unit: true, category: true },
    orderBy: { name: "asc" }
  });

  return (
    <Suspense fallback={<div>Loading form...</div>}>
      <InvoiceForm customers={customers as any} products={products as any} />
    </Suspense>
  );
}
