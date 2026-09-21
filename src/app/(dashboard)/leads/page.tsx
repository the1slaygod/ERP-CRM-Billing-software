import { prisma } from "@/lib/prisma";
import { LeadKanban } from "@/components/crm/LeadKanban";
import { Plus } from "lucide-react";
import { createLead } from "@/app/actions/lead";

export default async function LeadsPage() {
  const action = async (formData: FormData) => {
    "use server";
    await createLead(formData);
  };

  const leads = await prisma.lead.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      company: true,
      dealValue: true,
      status: true,
    }
  });

  return (
    <div className="space-y-6 flex flex-col h-[calc(100vh-6rem)]">
      <div className="flex items-center justify-between flex-shrink-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sales Pipeline</h1>
          <p className="text-slate-500 text-sm mt-1">Drag and drop leads to update their status.</p>
        </div>
        
        <form action={action} className="flex gap-2">
          <input 
            type="text" 
            name="name" 
            required
            placeholder="Lead Name" 
            className="rounded-md border-0 py-1.5 pl-3 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm"
          />
          <input 
            type="text" 
            name="company" 
            placeholder="Company" 
            className="rounded-md border-0 py-1.5 pl-3 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm w-32"
          />
          <button 
            type="submit"
            className="flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            <Plus className="h-4 w-4" />
            Quick Add
          </button>
        </form>
      </div>

      <div className="flex-1 min-h-0">
        <LeadKanban initialLeads={leads as any} />
      </div>
    </div>
  );
}
