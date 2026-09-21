import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { CustomerForm } from "@/components/crm/CustomerForm";

export default async function EditCustomerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const customer = await prisma.customer.findUnique({
    where: { id },
  });

  if (!customer) {
    notFound();
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Edit Customer Profile</h1>
      </div>

      <CustomerForm initialData={customer} />
    </div>
  );
}
