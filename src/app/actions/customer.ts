"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createCustomer(formData: FormData) {
  const name = formData.get("name") as string;
  const company = formData.get("company") as string;
  const phone = formData.get("phone") as string;
  const whatsapp = formData.get("whatsapp") as string;
  const email = formData.get("email") as string;
  const gstin = formData.get("gstin") as string;
  const type = formData.get("type") as "B2B" | "B2C";
  const billingAddress = formData.get("billingAddress") as string;

  try {
    const customer = await prisma.customer.create({
      data: {
        name,
        company,
        phone,
        whatsapp,
        email,
        gstin,
        type,
        billingAddress,
      },
    });

    revalidatePath("/customers");
    return { success: true, customerId: customer.id };
  } catch (error) {
    console.error("Error creating customer:", error);
    return { success: false, error: "Failed to create customer" };
  }
}

export async function updateCustomer(customerId: string, formData: FormData) {
  const name = formData.get("name") as string;
  const company = formData.get("company") as string;
  const phone = formData.get("phone") as string;
  const whatsapp = formData.get("whatsapp") as string;
  const email = formData.get("email") as string;
  const gstin = formData.get("gstin") as string;
  const type = formData.get("type") as "B2B" | "B2C";
  const billingAddress = formData.get("billingAddress") as string;

  try {
    const customer = await prisma.customer.update({
      where: { id: customerId },
      data: {
        name,
        company,
        phone,
        whatsapp,
        email,
        gstin,
        type,
        billingAddress,
      },
    });

    revalidatePath("/customers");
    revalidatePath(`/customers/${customerId}`);
    return { success: true, customerId: customer.id };
  } catch (error) {
    console.error("Error updating customer:", error);
    return { success: false, error: "Failed to update customer" };
  }
}
