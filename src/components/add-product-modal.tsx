'use client';

import { useState, useEffect } from 'react';

interface ProductFormData {
  code?: string;
  name: string;
  description?: string;
  price: number;
}

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (product: ProductFormData) => void;
}

export function AddProductModal({ isOpen, onClose, onSubmit }: AddProductModalProps) {
  const [formData, setFormData] = useState<ProductFormData>({
    code: '',
    name: '',
    description: '',
    price: 0,
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setFormData({ code: '', name: '', description: '', price: 0 });
      setErrors({});
      setIsSubmitting(false);
    }
  }, [isOpen]);

  // Handle escape key to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Product name is required';
    }

    if (!formData.price || formData.price <= 0) {
      newErrors.price = 'Price must be greater than 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    
    try {
      // Simulate a brief delay for better UX
      await new Promise(resolve => setTimeout(resolve, 300));
      
      onSubmit({
        code: formData.code?.trim() || undefined,
        name: formData.name.trim(),
        description: formData.description?.trim() || undefined,
        price: Number(formData.price),
      });
    } catch (error) {
      console.error('Failed to add product:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      
      {/* Modal Container */}
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="relative bg-background border border-border rounded-xl shadow-xl max-w-md w-full mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border">
            <h2 className="text-xl font-semibold text-foreground">Add New Product</h2>
            <button
              onClick={onClose}
              className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
              disabled={isSubmitting}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Product Name */}
            <div className="space-y-2">
              <label htmlFor="productName" className="text-sm font-medium text-foreground">
                Product Name <span className="text-red-500">*</span>
              </label>
              <input
                id="productName"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter product name"
                className={`w-full px-4 py-3 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors ${
                  errors.name ? 'border-red-500' : 'border-border'
                }`}
                disabled={isSubmitting}
                required
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name}</p>
              )}
            </div>

            {/* Product Code */}
            <div className="space-y-2">
              <label htmlFor="productCode" className="text-sm font-medium text-foreground">
                Product Code
              </label>
              <input
                id="productCode"
                type="text"
                value={formData.code}
                onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value.toUpperCase().slice(0, 5) }))}
                placeholder="Enter product code (1-5 chars, auto-generated if empty)"
                className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors font-mono"
                disabled={isSubmitting}
                maxLength={5}
              />
              <p className="text-xs text-muted-foreground">
                Leave empty to auto-generate. Single character will be padded with zeros.
              </p>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label htmlFor="productDescription" className="text-sm font-medium text-foreground">
                Description
              </label>
              <textarea
                id="productDescription"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter product description (optional)"
                rows={3}
                className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors resize-none"
                disabled={isSubmitting}
              />
            </div>

            {/* Price */}
            <div className="space-y-2">
              <label htmlFor="productPrice" className="text-sm font-medium text-foreground">
                Price (EUR) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">€</span>
                <input
                  id="productPrice"
                  type="number"
                  value={formData.price || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  className={`w-full pl-8 pr-4 py-3 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors ${
                    errors.price ? 'border-red-500' : 'border-border'
                  }`}
                  disabled={isSubmitting}
                  required
                />
              </div>
              {errors.price && (
                <p className="text-sm text-red-500">{errors.price}</p>
              )}
            </div>

            {/* Form Actions */}
            <div className="flex items-center gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-3 border border-border text-foreground hover:bg-muted rounded-lg font-medium transition-colors"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-3 bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"></div>
                    Adding...
                  </span>
                ) : (
                  'Add Product'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
