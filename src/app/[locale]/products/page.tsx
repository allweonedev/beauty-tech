"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { ProductsList } from "@/components/product/ProductsTable";
import { ProductModal } from "@/components/product/ProductModal";
import { type Product } from "@/types/product";
import {
  usePaginatedProducts,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
  useBulkDeleteProducts,
} from "@/hooks/useProducts";

export default function ProductsPage() {
  const t = useTranslations();
  const router = useRouter();
  const [showProductModal, setShowProductModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | undefined>();
  const [pageSize, setPageSize] = useState(10);

  // Product data hooks
  const {
    data: productsData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = usePaginatedProducts(pageSize);
  const { mutateAsync: createProduct, isPending: isCreating } =
    useCreateProduct();
  const { mutateAsync: updateProduct, isPending: isUpdating } =
    useUpdateProduct();
  const { mutateAsync: deleteProduct, isPending: isDeleting } =
    useDeleteProduct();
  const { mutateAsync: bulkDeleteProducts, isPending: isBulkDeleting } =
    useBulkDeleteProducts();

  // Generate flat list of products from paginated data
  const products = React.useMemo(() => {
    if (!productsData) return [];
    return productsData.pages.flatMap((page) => page.data);
  }, [productsData]);

  // Flag for any loading state
  const isMutating = isCreating || isUpdating || isDeleting || isBulkDeleting;

  // Handle product creation/update
  const handleSaveProduct = async (productData: Partial<Product>) => {
    console.log("From the page.tsx", productData);
    if (selectedProduct) {
      console.log("Updating product", productData);
      await updateProduct({
        id: selectedProduct.id,
        data: productData,
      });
    } else {
      console.log("Creating product", productData);
      await createProduct(productData);
    }

    setShowProductModal(false);
    setSelectedProduct(undefined);
  };

  // Handle product deletion
  const handleDeleteProduct = async (productId: string) => {
    await deleteProduct(productId);
  };

  // Handle bulk product deletion
  const handleBulkDeleteProducts = async (productIds: string[]) => {
    await bulkDeleteProducts(productIds);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center">
            <h1
              onClick={() => router.push("/")}
              className="text-xl font-semibold text-gray-900 cursor-pointer hover:text-indigo-600 transition-colors"
            >
              Beauty Tech
            </h1>
            <span className="mx-2">›</span>
            <h2 className="text-lg font-medium text-gray-700">
              {t("products.title")}
            </h2>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <ProductsList
          products={products}
          onNewProduct={() => {
            setSelectedProduct(undefined);
            setShowProductModal(true);
          }}
          onEditProduct={(product) => {
            setSelectedProduct(product);
            setShowProductModal(true);
          }}
          onDeleteProduct={handleDeleteProduct}
          onBulkDeleteProducts={handleBulkDeleteProducts}
          isLoading={isLoading}
          isMutating={isMutating}
          onLoadMore={() => fetchNextPage()}
          hasMore={!!hasNextPage}
          isLoadingMore={isFetchingNextPage}
          onPageSizeChange={setPageSize}
          currentPageSize={pageSize}
        />
      </main>

      {showProductModal && (
        <ProductModal
          product={selectedProduct}
          onClose={() => {
            setShowProductModal(false);
            setSelectedProduct(undefined);
          }}
          onSave={handleSaveProduct}
          open={showProductModal}
          isMutating={isCreating || isUpdating}
        />
      )}
    </div>
  );
}
