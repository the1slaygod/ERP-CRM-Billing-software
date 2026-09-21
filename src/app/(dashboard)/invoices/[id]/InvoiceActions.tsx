"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { finalizeInvoice } from "@/app/actions/billing";
import { Printer, Lock } from "lucide-react";

import { toast } from "sonner";

export function InvoiceActions({ invoiceId, status }: { invoiceId: string, status: string }) {
  const [isFinalizing, setIsFinalizing] = useState(false);
  const router = useRouter();

  const handleFinalize = async () => {
    if (!confirm("Are you sure you want to finalize this invoice? This will lock it, deduct inventory, and post to the customer ledger.")) return;
    
    setIsFinalizing(true);
    const result = await finalizeInvoice(invoiceId);
    if (result.success) {
      toast.success("Invoice Finalized");
      router.refresh();
    } else {
      toast.error(result.error || "Failed to finalize invoice");
      setIsFinalizing(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex items-center gap-3">
      <button 
        onClick={handlePrint}
        className="flex items-center gap-2 rounded-md bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50"
      >
        <Printer className="h-4 w-4" />
        Print / Download PDF
      </button>
      
      {status === "DRAFT" && (
        <button 
          onClick={handleFinalize}
          disabled={isFinalizing}
          className="flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50"
        >
          <Lock className="h-4 w-4" />
          {isFinalizing ? "Finalizing..." : "Finalize & Lock"}
        </button>
      )}
    </div>
  );
}
