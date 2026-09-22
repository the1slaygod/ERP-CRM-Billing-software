"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getCompanySettings() {
  let settings = await prisma.companySettings.findFirst();
  
  if (!settings) {
    settings = await prisma.companySettings.create({
      data: {
        companyName: "Your Company Name",
      }
    });
  }
  
  return settings;
}

export async function updateCompanySettings(formData: FormData) {
  try {
    const id = formData.get("id") as string;
    const companyName = formData.get("companyName") as string;
    const logoBase64 = formData.get("logoBase64") as string | null;
    const address = formData.get("address") as string | null;
    const phone = formData.get("phone") as string | null;
    const email = formData.get("email") as string | null;
    const gstin = formData.get("gstin") as string | null;
    const pan = formData.get("pan") as string | null;
    const bankName = formData.get("bankName") as string | null;
    const accountNumber = formData.get("accountNumber") as string | null;
    const ifscCode = formData.get("ifscCode") as string | null;
    const upiId = formData.get("upiId") as string | null;
    const terms = formData.get("terms") as string | null;

    if (!id) {
      return { success: false, error: "Settings ID is missing" };
    }

    const dataToUpdate: any = {
      companyName,
      address,
      phone,
      email,
      gstin,
      pan,
      bankName,
      accountNumber,
      ifscCode,
      upiId,
      terms
    };

    if (logoBase64) {
      dataToUpdate.logoBase64 = logoBase64;
    }

    await prisma.companySettings.update({
      where: { id },
      data: dataToUpdate
    });

    revalidatePath("/settings/company");
    revalidatePath("/invoices");
    revalidatePath("/");
    
    return { success: true };
  } catch (error) {
    console.error("Failed to update company settings:", error);
    return { success: false, error: "Failed to update company settings" };
  }
}
