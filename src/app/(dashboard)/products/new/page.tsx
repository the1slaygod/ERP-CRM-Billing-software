import { ProductForm } from "@/components/products/ProductForm";

export default function NewProductPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Add New Product</h1>
      </div>
      <ProductForm />
    </div>
  );
}
