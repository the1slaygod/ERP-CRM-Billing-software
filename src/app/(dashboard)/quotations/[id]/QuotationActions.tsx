"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Printer, Edit, Rocket } from "lucide-react";
import { convertQuotationToInvoice } from "@/app/actions/billing";
import Link from "next/link";

export function QuotationActions({ quotationId, status }: { quotationId: string, status: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handlePrint = () => {
    window.print();
  };

  const handleConvert = () => {
    if (!confirm("Are you sure you want to convert this Quotation into a Draft Invoice?")) return;

    startTransition(async () => {
      const result = await convertQuotationToInvoice(quotationId);
      if (result.success) {
        toast.success("Quotation converted to Invoice!");
        router.push(`/invoices/${result.invoiceId}`);
      } else {
        toast.error(result.error || "Failed to convert quotation");
      }
    });
  };

  return (
    <div className="flex gap-3 print:hidden">
      <Link 
        href={`/quotations/${quotationId}/edit`}
        className="flex items-center gap-2 rounded-md bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm border border-slate-300 hover:bg-slate-50"
      >
        <Edit className="w-4 h-4" /> Edit
      </Link>
      
      <button 
        onClick={handlePrint}
        className="flex items-center gap-2 rounded-md bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm border border-slate-300 hover:bg-slate-50"
      >
        <Printer className="w-4 h-4" /> Print PDF
      </button>

      {status !== "ACCEPTED" && (
        <button 
          onClick={handleConvert}
          disabled={isPending}
          className="flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-500 disabled:opacity-50"
        >
          <Rocket className="w-4 h-4" /> 
          {isPending ? "Converting..." : "Convert to Invoice"}
        </button>
      )}
    </div>
  );
}
