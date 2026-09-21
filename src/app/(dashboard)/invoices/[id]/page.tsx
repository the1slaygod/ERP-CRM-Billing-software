import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { InvoiceTemplate } from "@/components/billing/InvoiceTemplate";
import { InvoiceActions } from "./InvoiceActions";
import { getCompanySettings } from "@/app/actions/settings";

export default async function InvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: {
      customer: true,
      items: {
        include: { product: true }
      }
    }
  });

  if (!invoice) notFound();

  const companySettings = await getCompanySettings();

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20 print:pb-0">
      <div className="flex items-center justify-between print:hidden">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Invoice Details</h1>
          <p className="text-slate-500 mt-1">View, finalize, or print this invoice.</p>
        </div>
        <InvoiceActions invoiceId={invoice.id} status={invoice.status} />
      </div>

      <InvoiceTemplate invoice={invoice} companySettings={companySettings} />
    </div>
  );
}
