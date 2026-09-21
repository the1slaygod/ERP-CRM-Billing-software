"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { InvoiceItemInput } from "./billing"; // Reuse the type

export async function createQuotation(
  customerId: string, 
  items: InvoiceItemInput[], 
  subtotal: number, 
  discount: number, 
  taxableValue: number, 
  cgst: number, 
  sgst: number, 
  igst: number, 
  roundOff: number, 
  grandTotal: number
) {
  try {
    const quoteNumber = `QT-${Date.now().toString().slice(-6)}`;
    const validUntil = new Date();
    validUntil.setDate(validUntil.getDate() + 30); // Valid for 30 days

    const quotation = await prisma.$transaction(async (tx) => {
      const created = await tx.quotation.create({
        data: {
          number: quoteNumber,
          customerId,
          validUntil,
          subtotal,
          discount,
          taxableValue,
          cgst,
          sgst,
          igst,
          roundOff,
          grandTotal,
          status: "DRAFT",
          items: {
            create: items.map(item => ({
              productId: item.productId,
              quantity: item.quantity,
              unit: item.unit,
              rate: item.rate,
              discount: item.discount,
              taxableValue: item.taxableValue,
              cgst: item.cgst,
              sgst: item.sgst,
              igst: item.igst,
              total: item.total
            }))
          }
        }
      });

      // Log to timeline
      await tx.activity.create({
        data: {
          customerId,
          type: "SYSTEM",
          title: `Quotation ${quoteNumber} Generated`,
          description: `Total Estimate: ₹${grandTotal.toLocaleString()}`,
        }
      });

      return created;
    });

    revalidatePath("/quotations");
    revalidatePath(`/customers/${customerId}`);
    
    return { success: true, quotationId: quotation.id };
  } catch (error) {
    console.error("Error creating quotation:", error);
    return { success: false, error: "Failed to create quotation" };
  }
}

export async function updateQuotation(
  quotationId: string,
  customerId: string, 
  items: InvoiceItemInput[], 
  subtotal: number, 
  discount: number, 
  taxableValue: number, 
  cgst: number, 
  sgst: number, 
  igst: number, 
  roundOff: number, 
  grandTotal: number
) {
  try {
    await prisma.$transaction(async (tx) => {
      // Delete existing items
      await tx.quotationItem.deleteMany({
        where: { quotationId }
      });

      // Update quotation and create new items
      await tx.quotation.update({
        where: { id: quotationId },
        data: {
          customerId,
          subtotal,
          discount,
          taxableValue,
          cgst,
          sgst,
          igst,
          roundOff,
          grandTotal,
          items: {
            create: items.map(item => ({
              productId: item.productId,
              quantity: item.quantity,
              unit: item.unit,
              rate: item.rate,
              discount: item.discount,
              taxableValue: item.taxableValue,
              cgst: item.cgst,
              sgst: item.sgst,
              igst: item.igst,
              total: item.total
            }))
          }
        }
      });
    });

    revalidatePath("/quotations");
    revalidatePath(`/quotations/${quotationId}`);
    return { success: true };
  } catch (error) {
    console.error("Error updating quotation:", error);
    return { success: false, error: "Failed to update quotation" };
  }
}
