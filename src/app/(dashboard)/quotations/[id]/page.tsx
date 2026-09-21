import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { QuotationTemplate } from "@/components/billing/QuotationTemplate";
import { QuotationActions } from "./QuotationActions";
import { getCompanySettings } from "@/app/actions/settings";

export default async function QuotationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const quotation = await prisma.quotation.findUnique({
    where: { id },
    include: {
      customer: true,
      items: {
        include: { product: true }
      }
    }
  });

  if (!quotation) notFound();

  const companySettings = await getCompanySettings();

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20 print:pb-0">
      <div className="flex items-center justify-between print:hidden">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Quotation #{quotation.number}</h1>
          <p className="text-sm text-slate-500 mt-1">
            Generated on {new Date(quotation.createdAt).toLocaleDateString()}
          </p>
        </div>
        
        <QuotationActions quotationId={quotation.id} status={quotation.status} />
      </div>

      <QuotationTemplate quotation={quotation} companySettings={companySettings} />
    </div>
  );
}
