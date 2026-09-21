"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { InvoiceItemInput } from "./billing"; 

export async function createSalesOrder(
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
    const orderNumber = `SO-${Date.now().toString().slice(-6)}`;

    const salesOrder = await prisma.$transaction(async (tx) => {
      const created = await tx.salesOrder.create({
        data: {
          number: orderNumber,
          customerId,
          subtotal,
          discount,
          taxableValue,
          cgst,
          sgst,
          igst,
          roundOff,
          grandTotal,
          status: "PENDING",
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

      await tx.activity.create({
        data: {
          customerId,
          type: "SYSTEM",
          title: `Sales Order ${orderNumber} Confirmed`,
          description: `Total Value: ₹${grandTotal.toLocaleString()}`,
        }
      });

      return created;
    });

    revalidatePath("/sales-orders");
    revalidatePath(`/customers/${customerId}`);
    
    return { success: true, salesOrderId: salesOrder.id };
  } catch (error) {
    console.error("Error creating sales order:", error);
    return { success: false, error: "Failed to create sales order" };
  }
}
