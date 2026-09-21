"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function recordStockAdjustment(formData: FormData) {
  try {
    const productId = formData.get("productId") as string;
    const type = formData.get("type") as "STOCK_IN" | "STOCK_OUT" | "ADJUSTMENT";
    const quantity = parseInt(formData.get("quantity") as string, 10);
    const reference = formData.get("reference") as string;

    if (!productId || isNaN(quantity) || quantity <= 0) {
      return { success: false, error: "Invalid data" };
    }

    // 1. Record the transaction
    await prisma.inventoryTransaction.create({
      data: {
        productId,
        type,
        quantity,
        reference,
      }
    });

    // 2. Update the product's current stock
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) throw new Error("Product not found");

    let newStock = product.currentStock;
    if (type === "STOCK_IN") {
      newStock += quantity;
    } else if (type === "STOCK_OUT") {
      newStock -= quantity;
    }
    // For ADJUSTMENT, we assume 'quantity' is the difference, or we could set it absolutely. 
    // We'll treat ADJUSTMENT as adding for this simple logic, or require positive/negative.
    // For now, assume STOCK_IN adds and STOCK_OUT subtracts.

    await prisma.product.update({
      where: { id: productId },
      data: { currentStock: newStock }
    });

    revalidatePath("/inventory");
    revalidatePath("/products");
    return { success: true };
  } catch (error) {
    console.error("Error adjusting stock:", error);
    return { success: false, error: "Failed to adjust stock" };
  }
}
