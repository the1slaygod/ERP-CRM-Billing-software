"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createProduct(formData: FormData) {
  try {
    const name = formData.get("name") as string;
    const sku = formData.get("sku") as string;
    const category = formData.get("category") as string;
    const hsnSac = formData.get("hsnSac") as string;
    
    const costPrice = parseFloat(formData.get("costPrice") as string) || 0;
    const sellingPrice = parseFloat(formData.get("sellingPrice") as string) || 0;
    const gstPercent = parseFloat(formData.get("gstPercent") as string) || 0;
    
    const openingStock = parseInt(formData.get("openingStock") as string, 10) || 0;
    const reorderLevel = parseInt(formData.get("reorderLevel") as string, 10) || 0;
    const unit = formData.get("unit") as string || "pcs";

    const product = await prisma.product.create({
      data: {
        name,
        sku,
        category,
        hsnSac,
        costPrice,
        sellingPrice,
        gstPercent,
        unit,
        openingStock,
        currentStock: openingStock, // Initial stock equals opening stock
        reorderLevel,
      },
    });

    // If there is an opening stock, record it in the inventory ledger
    if (openingStock > 0) {
      await prisma.inventoryTransaction.create({
        data: {
          productId: product.id,
          type: "STOCK_IN",
          quantity: openingStock,
          reference: "Opening Stock",
        }
      });
    }

    revalidatePath("/products");
    revalidatePath("/inventory");
    return { success: true, productId: product.id };
  } catch (error) {
    console.error("Error creating product:", error);
    return { success: false, error: "Failed to create product" };
  }
}

export async function updateProduct(productId: string, formData: FormData) {
  try {
    const name = formData.get("name") as string;
    const sku = formData.get("sku") as string;
    const category = formData.get("category") as string;
    const hsnSac = formData.get("hsnSac") as string;
    
    const costPrice = parseFloat(formData.get("costPrice") as string) || 0;
    const sellingPrice = parseFloat(formData.get("sellingPrice") as string) || 0;
    const gstPercent = parseFloat(formData.get("gstPercent") as string) || 0;
    
    const openingStock = parseInt(formData.get("openingStock") as string, 10) || 0;
    const reorderLevel = parseInt(formData.get("reorderLevel") as string, 10) || 0;
    const unit = formData.get("unit") as string || "pcs";

    await prisma.product.update({
      where: { id: productId },
      data: {
        name,
        sku,
        category,
        hsnSac,
        costPrice,
        sellingPrice,
        gstPercent,
        unit,
        openingStock,
        reorderLevel,
      },
    });

    revalidatePath("/products");
    revalidatePath(`/products/${productId}`);
    return { success: true };
  } catch (error) {
    console.error("Error updating product:", error);
    return { success: false, error: "Failed to update product" };
  }
}

export async function deleteProduct(productId: string) {
  try {
    await prisma.product.delete({
      where: { id: productId }
    });

    revalidatePath("/products");
    revalidatePath("/inventory");
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting product:", error);
    if (error?.code === 'P2003') {
      return { success: false, error: "Cannot delete product because it is linked to existing invoices or inventory records." };
    }
    return { success: false, error: "Failed to delete product." };
  }
}
