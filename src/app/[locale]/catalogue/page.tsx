'use client';

import { useState, useEffect } from 'react';
import { withAuth } from '../../../components/auth-guard';
import { AddProductModal } from '../../../components/add-product-modal';
import { UpdateProductModal } from '../../../components/update-product-modal';
import { DeleteProductModal } from '../../../components/delete-product-modal';

interface Product {
  id: string;
  code: string;
  name: string;
  description?: string;
  price: number;
  createdAt: string;
}

interface ProductFormData {
  code?: string;
  name: string;
  description?: string;
  price: number;
}

function CataloguePage() {
  const [products, setProducts] = useState<Product[]>(() => {
    // Initialize state from localStorage
    if (typeof window !== 'undefined') {
      const savedProducts = localStorage.getItem('billora-products');
      if (savedProducts) {
        try {
          return JSON.parse(savedProducts);
        } catch (error) {
          console.error('Failed to load products:', error);
        }
      }
    }
    return [];
  });
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Save products to localStorage whenever products change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('billora-products', JSON.stringify(products));
    }
  }, [products]);

  // Generate or format product code
  const generateProductCode = (userCode?: string): string => {
    if (userCode && userCode.trim()) {
      const trimmed = userCode.trim().toUpperCase();
      // If only 1 character, pad with zeros
      if (trimmed.length === 1) {
        return `0000${trimmed}`;
      }
      return trimmed.slice(0, 5); // Ensure max 5 characters
    }
    
    // Generate random code (1-5 characters)
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const length = Math.floor(Math.random() * 5) + 1;
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const handleAddProduct = (productData: ProductFormData) => {
    const newProduct: Product = {
      id: `product-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      code: generateProductCode(productData.code),
      name: productData.name,
      description: productData.description,
      price: productData.price,
      createdAt: new Date().toISOString(),
    };
    
    setProducts(prev => [newProduct, ...prev]);
    setIsAddModalOpen(false);
  };

  const handleUpdateProduct = (updatedData: ProductFormData) => {
    if (!selectedProduct) return;
    
    setProducts(prev => prev.map(product => 
      product.id === selectedProduct.id 
        ? { 
            ...product, 
            code: generateProductCode(updatedData.code),
            name: updatedData.name,
            description: updatedData.description,
            price: updatedData.price,
          }
        : product
    ));
    setIsUpdateModalOpen(false);
    setSelectedProduct(null);
  };

  const handleDeleteProduct = () => {
    if (!selectedProduct) return;
    
    setProducts(prev => prev.filter(product => product.id !== selectedProduct.id));
    setIsDeleteModalOpen(false);
    setSelectedProduct(null);
  };

  const openUpdateModal = (product: Product) => {
    setSelectedProduct(product);
    setIsUpdateModalOpen(true);
  };

  const openDeleteModal = (product: Product) => {
    setSelectedProduct(product);
    setIsDeleteModalOpen(true);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR'
    }).format(price);
  };

  return (
    <>
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-2">Product Catalogue</h1>
            <p className="text-lg text-muted-foreground">
              Manage your products and services with ease
            </p>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {/* Add Product Card - Always first */}
            <div 
              onClick={() => setIsAddModalOpen(true)}
              className="group relative bg-muted/30 border-2 border-dashed border-border hover:border-primary rounded-lg p-8 flex flex-col items-center justify-center min-h-[200px] cursor-pointer transition-all duration-200 hover:bg-muted/50"
            >
              <div className="w-12 h-12 bg-primary/10 group-hover:bg-primary/20 rounded-full flex items-center justify-center mb-4 transition-colors">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Add Product</h3>
              <p className="text-sm text-muted-foreground text-center">
                Click to add a new product to your catalogue
              </p>
            </div>

            {/* Product Cards */}
            {products.map((product) => (
              <div key={product.id} className="bg-background border border-border rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="flex flex-col h-full">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-semibold text-foreground line-clamp-2 flex-1">
                      {product.name}
                    </h3>
                    <span className="text-xs font-mono bg-muted text-muted-foreground px-2 py-1 rounded ml-2">
                      {product.code}
                    </span>
                  </div>
                  
                  <div className="flex-1">
                    {product.description && (
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                        {product.description}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-border">
                    <span className="text-xl font-bold text-primary">
                      {formatPrice(product.price)}
                    </span>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => openUpdateModal(product)}
                        className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                        title="Edit product"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button 
                        onClick={() => openDeleteModal(product)}
                        className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-lg transition-colors"
                        title="Delete product"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {products.length === 0 && (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">No products yet</h3>
              <p className="text-muted-foreground">
                Get started by adding your first product to the catalogue
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Add Product Modal */}
      <AddProductModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddProduct}
      />

      {/* Update Product Modal */}
      {selectedProduct && (
        <UpdateProductModal
          isOpen={isUpdateModalOpen}
          onClose={() => {
            setIsUpdateModalOpen(false);
            setSelectedProduct(null);
          }}
          onSubmit={handleUpdateProduct}
          product={selectedProduct}
        />
      )}

      {/* Delete Product Modal */}
      {selectedProduct && (
        <DeleteProductModal
          isOpen={isDeleteModalOpen}
          onClose={() => {
            setIsDeleteModalOpen(false);
            setSelectedProduct(null);
          }}
          onConfirm={handleDeleteProduct}
          product={selectedProduct}
        />
      )}
    </>
  );
}

export default withAuth(CataloguePage);
