import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { ProductForm } from "@/components/products/ProductForm";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const product = await prisma.product.findUnique({
    where: { id },
  });

  if (!product) notFound();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Edit Product: {product.name}</h1>
      </div>
      <ProductForm initialData={product} />
    </div>
  );
}
