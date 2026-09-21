"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export type InvoiceItemInput = {
  productId: string;
  quantity: number;
  unit: string;
  rate: number;
  discount: number;
  taxableValue: number;
  cgst: number;
  sgst: number;
  igst: number;
  total: number;
};

export async function createInvoice(
  customerId: string, 
  items: InvoiceItemInput[], 
  subtotal: number, 
  discount: number, 
  taxableValue: number, 
  cgst: number, 
  sgst: number, 
  igst: number, 
  roundOff: number, 
  grandTotal: number,
  type: "GST" | "NON_GST"
) {
  try {
    // Generate Invoice Number (Mock logic - in production use sequence)
    const invoiceNumber = `INV-${Date.now().toString().slice(-6)}`;

    // Create Invoice within a transaction to ensure atomic updates
    const invoice = await prisma.$transaction(async (tx) => {
      // 1. Create Invoice & Items
      const createdInvoice = await tx.invoice.create({
        data: {
          number: invoiceNumber,
          customerId,
          subtotal,
          discount,
          taxableValue,
          cgst,
          sgst,
          igst,
          roundOff,
          grandTotal,
          type,
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
        },
      });

      // 2. Record Activity Timeline
      await tx.activity.create({
        data: {
          customerId,
          type: "SYSTEM",
          title: `Invoice ${invoiceNumber} created (Draft)`,
          description: `Total Amount: ₹${grandTotal.toLocaleString()}`,
        }
      })

      return createdInvoice;
    });

    revalidatePath("/invoices");
    revalidatePath("/inventory");
    revalidatePath(`/customers/${customerId}`);
    
    return { success: true, invoiceId: invoice.id };
  } catch (error) {
    console.error("Error creating invoice:", error);
    return { success: false, error: "Failed to create invoice" };
  }
}

export async function finalizeInvoice(invoiceId: string) {
  try {
    await prisma.$transaction(async (tx) => {
      // 1. Fetch the invoice with items
      const invoice = await tx.invoice.findUnique({
        where: { id: invoiceId },
        include: { items: true },
      });

      if (!invoice) throw new Error("Invoice not found");
      if (invoice.status === "FINALIZED") throw new Error("Invoice is already finalized");

      // 2. Update status to FINALIZED
      await tx.invoice.update({
        where: { id: invoiceId },
        data: { status: "FINALIZED" },
      });

      // 3. Inventory Stock Deduction
      for (const item of invoice.items) {
        // Record transaction
        await tx.inventoryTransaction.create({
          data: {
            productId: item.productId,
            type: "STOCK_OUT",
            quantity: item.quantity,
            reference: invoice.number,
          }
        });

        // Update current stock
        await tx.product.update({
          where: { id: item.productId },
          data: {
            currentStock: { decrement: item.quantity }
          }
        });
      }

      // 4. Customer Ledger Update (Debit)
      await tx.ledgerEntry.create({
        data: {
          customerId: invoice.customerId,
          type: "DEBIT",
          amount: invoice.grandTotal,
          referenceId: invoice.id,
          description: `Invoice ${invoice.number} Finalized`,
        }
      });

      // 5. Activity Timeline Update
      await tx.activity.create({
        data: {
          customerId: invoice.customerId,
          type: "SYSTEM",
          title: `Invoice ${invoice.number} finalized`,
          description: `Ledger updated for ₹${invoice.grandTotal.toLocaleString()}`,
        }
      });
    });

    revalidatePath("/invoices");
    revalidatePath("/inventory");
    revalidatePath(`/invoices/${invoiceId}`);
    
    return { success: true };
  } catch (error: any) {
    console.error("Error finalizing invoice:", error);
    return { success: false, error: error.message || "Failed to finalize invoice" };
  }
}

export async function convertQuotationToInvoice(quotationId: string) {
  try {
    const newInvoiceId = await prisma.$transaction(async (tx) => {
      const quotation = await tx.quotation.findUnique({
        where: { id: quotationId },
        include: { items: true }
      });

      if (!quotation) throw new Error("Quotation not found");
      if (quotation.status === "ACCEPTED") throw new Error("Quotation is already converted");

      // Generate Invoice Number
      const invoiceNumber = `INV-${Date.now().toString().slice(-6)}`;

      // Create new Invoice mapped perfectly from the Quotation
      const invoice = await tx.invoice.create({
        data: {
          number: invoiceNumber,
          customerId: quotation.customerId,
          subtotal: quotation.subtotal,
          discount: quotation.discount,
          taxableValue: quotation.taxableValue,
          cgst: quotation.cgst,
          sgst: quotation.sgst,
          igst: quotation.igst,
          roundOff: quotation.roundOff,
          grandTotal: quotation.grandTotal,
          type: "GST",
          status: "DRAFT",
          items: {
            create: quotation.items.map(item => ({
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

      // Update Quotation Status
      await tx.quotation.update({
        where: { id: quotationId },
        data: { status: "ACCEPTED" }
      });

      return invoice.id;
    });

    revalidatePath("/quotations");
    revalidatePath("/invoices");
    return { success: true, invoiceId: newInvoiceId };
  } catch (error: any) {
    console.error("Error converting quotation:", error);
    return { success: false, error: error.message || "Failed to convert quotation" };
  }
}
