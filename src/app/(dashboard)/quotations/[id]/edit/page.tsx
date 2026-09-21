import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { QuotationForm } from "@/components/billing/QuotationForm";

export default async function EditQuotationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const quotation = await prisma.quotation.findUnique({
    where: { id },
    include: { items: true }
  });

  if (!quotation) notFound();
  
  if (quotation.status === "ACCEPTED") {
    // Cannot edit an accepted quotation (it was converted to invoice)
    return (
      <div className="max-w-3xl mx-auto py-12 text-center space-y-4">
        <h1 className="text-2xl font-bold text-red-600">Quotation Locked</h1>
        <p className="text-slate-500">This quotation has already been accepted and converted into an invoice. It cannot be edited.</p>
      </div>
    );
  }

  const [customers, products] = await Promise.all([
    prisma.customer.findMany({
      select: { id: true, name: true, gstin: true, billingAddress: true },
      orderBy: { name: "asc" }
    }),
    prisma.product.findMany({
      select: { id: true, name: true, sku: true, sellingPrice: true, gstPercent: true, hsnSac: true, unit: true, category: true },
      orderBy: { name: "asc" }
    })
  ]);

  return <QuotationForm customers={customers} products={products} initialData={quotation} />;
}
