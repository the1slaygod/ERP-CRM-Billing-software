"use client";

import { CustomerForm } from "@/components/crm/CustomerForm";

export default function NewCustomerPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Add New Customer</h1>
      </div>

      <CustomerForm />
    </div>
  );
}
