'use client';

import { useState, useEffect } from 'react';

interface Product {
  id: string;
  code: string;
  name: string;
  description?: string;
  price: number;
  createdAt: string;
}

interface InvoiceItem {
  productId: string;
  quantity: number;
  discount: number;
  discountType: 'percentage' | 'absolute';
  selected: boolean;
}

interface InvoiceFormData {
  customerName: string;
  customerEmail?: string;
  items: Array<{
    productId: string;
    quantity: number;
    discount: number;
    discountType: 'percentage' | 'absolute';
  }>;
}

interface AddInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (invoice: InvoiceFormData) => void;
  products: Product[];
}

export function AddInvoiceModal({ isOpen, onClose, onSubmit, products }: AddInvoiceModalProps) {
  const [formData, setFormData] = useState<{
    customerName: string;
    customerEmail?: string;
    items: InvoiceItem[];
  }>({
    customerName: '',
    customerEmail: '',
    items: [],
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize items when modal opens or products change
  useEffect(() => {
    if (isOpen && products.length > 0) {
      const initialItems = products.map(product => ({
        productId: product.id,
        quantity: 1,
        discount: 0,
        discountType: 'percentage' as const,
        selected: false,
      }));
      
      setFormData(prev => ({
        ...prev,
        items: initialItems,
      }));
    }
  }, [isOpen, products]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        customerName: '',
        customerEmail: '',
        items: [],
      });
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
    const selectedItems = formData.items.filter(item => item.selected);

    if (!formData.customerName.trim()) {
      newErrors.customerName = 'Customer name is required';
    }

    if (formData.customerEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.customerEmail)) {
      newErrors.customerEmail = 'Please enter a valid email address';
    }

    if (selectedItems.length === 0) {
      newErrors.items = 'At least one product must be selected';
    }

    // Validate individual selected items
    formData.items.forEach((item, index) => {
      if (item.selected) {
        if (item.quantity <= 0) {
          newErrors[`quantity_${index}`] = 'Quantity must be greater than 0';
        }
        
        const product = products.find(p => p.id === item.productId);
        if (product) {
          if (item.discountType === 'percentage') {
            if (item.discount < 0 || item.discount > 100) {
              newErrors[`discount_${index}`] = 'Discount must be between 0 and 100%';
            }
          } else {
            const maxDiscount = item.quantity * product.price;
            if (item.discount < 0) {
              newErrors[`discount_${index}`] = 'Discount cannot be negative';
            } else if (item.discount > maxDiscount) {
              newErrors[`discount_${index}`] = `Discount cannot exceed ${formatPrice(maxDiscount)}`;
            }
          }
        }
      }
    });

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
      
      const selectedItems = formData.items.filter(item => item.selected).map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        discount: item.discount,
        discountType: item.discountType,
      }));

      onSubmit({
        customerName: formData.customerName.trim(),
        customerEmail: formData.customerEmail?.trim() || undefined,
        items: selectedItems,
      });
    } catch (error) {
      console.error('Failed to create invoice:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleProductSelection = (index: number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map((item, i) => 
        i === index ? { ...item, selected: !item.selected } : item
      ),
    }));
  };

  const updateItem = (index: number, field: 'quantity' | 'discount' | 'discountType', value: number | string) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      ),
    }));
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR'
    }).format(price);
  };

  const calculateItemTotal = (item: InvoiceItem): number => {
    const product = products.find(p => p.id === item.productId);
    if (!product || !item.selected) return 0;
    
    const gross = item.quantity * product.price;
    let discountAmount = 0;
    
    if (item.discountType === 'percentage') {
      discountAmount = gross * (item.discount / 100);
    } else {
      discountAmount = Math.min(item.discount, gross); // Don't allow discount to exceed gross amount
    }
    
    return Math.max(0, gross - discountAmount); // Don't allow negative totals
  };

  const calculateSubtotal = (): number => {
    return formData.items
      .filter(item => item.selected)
      .reduce((sum, item) => {
        const product = products.find(p => p.id === item.productId);
        return sum + (product ? item.quantity * product.price : 0);
      }, 0);
  };

  const calculateTotalDiscount = (): number => {
    return calculateSubtotal() - formData.items
      .filter(item => item.selected)
      .reduce((sum, item) => sum + calculateItemTotal(item), 0);
  };

  const calculateTotal = (): number => {
    return formData.items
      .filter(item => item.selected)
      .reduce((sum, item) => sum + calculateItemTotal(item), 0);
  };

  const getSelectedCount = (): number => {
    return formData.items.filter(item => item.selected).length;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      
      {/* Modal Container */}
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="relative bg-background border border-border rounded-xl shadow-xl max-w-4xl w-full mx-auto max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border sticky top-0 bg-background">
            <h2 className="text-xl font-semibold text-foreground">Create New Invoice</h2>
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
            {/* Customer Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="customerName" className="text-sm font-medium text-foreground">
                  Customer Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="customerName"
                  type="text"
                  value={formData.customerName}
                  onChange={(e) => setFormData(prev => ({ ...prev, customerName: e.target.value }))}
                  placeholder="Enter customer name"
                  className={`w-full px-4 py-3 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors ${
                    errors.customerName ? 'border-red-500' : 'border-border'
                  }`}
                  disabled={isSubmitting}
                  required
                />
                {errors.customerName && (
                  <p className="text-sm text-red-500">{errors.customerName}</p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="customerEmail" className="text-sm font-medium text-foreground">
                  Customer Email
                </label>
                <input
                  id="customerEmail"
                  type="email"
                  value={formData.customerEmail}
                  onChange={(e) => setFormData(prev => ({ ...prev, customerEmail: e.target.value }))}
                  placeholder="Enter customer email (optional)"
                  className={`w-full px-4 py-3 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors ${
                    errors.customerEmail ? 'border-red-500' : 'border-border'
                  }`}
                  disabled={isSubmitting}
                />
                {errors.customerEmail && (
                  <p className="text-sm text-red-500">{errors.customerEmail}</p>
                )}
              </div>
            </div>

            {/* Products Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-foreground">
                  Select Products <span className="text-red-500">*</span>
                </label>
                <div className="text-sm text-muted-foreground">
                  {getSelectedCount()} of {products.length} selected
                </div>
              </div>

              {errors.items && (
                <p className="text-sm text-red-500">{errors.items}</p>
              )}

              {products.length === 0 ? (
                <div className="text-center py-8 border border-dashed border-border rounded-lg">
                  <p className="text-muted-foreground">No products available</p>
                  <p className="text-sm text-muted-foreground mt-1">Add products to your catalogue first</p>
                </div>
              ) : (
                <div className="border border-border rounded-lg overflow-hidden">
                  <div className="max-h-80 overflow-y-auto">
                    <table className="w-full">
                      <thead className="bg-muted/50 sticky top-0">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider w-12">
                            Select
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            Product
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider w-24">
                            Price
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider w-20">
                            Qty
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider w-24">
                            Discount Type
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider w-24">
                            Discount
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider w-24">
                            Total
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-background divide-y divide-border">
                        {formData.items.map((item, index) => {
                          const product = products.find(p => p.id === item.productId);
                          if (!product) return null;

                          return (
                            <tr key={index} className={`hover:bg-muted/30 ${item.selected ? 'bg-primary/5' : ''}`}>
                              <td className="px-4 py-3">
                                <input
                                  type="checkbox"
                                  checked={item.selected}
                                  onChange={() => toggleProductSelection(index)}
                                  className="w-4 h-4 text-primary bg-background border border-border rounded focus:ring-primary focus:ring-2"
                                  disabled={isSubmitting}
                                />
                              </td>
                              <td className="px-4 py-3">
                                <div>
                                  <div className="text-sm font-medium text-foreground">{product.name}</div>
                                  <div className="text-xs text-muted-foreground">Code: {product.code}</div>
                                  {product.description && (
                                    <div className="text-xs text-muted-foreground truncate max-w-xs">{product.description}</div>
                                  )}
                                </div>
                              </td>
                              <td className="px-4 py-3 text-sm text-foreground">
                                {formatPrice(product.price)}
                              </td>
                              <td className="px-4 py-3">
                                <input
                                  type="number"
                                  value={item.quantity}
                                  onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                                  min="1"
                                  className={`w-full px-2 py-1 text-sm bg-background border rounded focus:outline-none focus:ring-1 focus:ring-primary transition-colors ${
                                    errors[`quantity_${index}`] ? 'border-red-500' : 'border-border'
                                  } ${!item.selected ? 'opacity-50' : ''}`}
                                  disabled={!item.selected || isSubmitting}
                                />
                                {errors[`quantity_${index}`] && (
                                  <p className="text-xs text-red-500 mt-1">{errors[`quantity_${index}`]}</p>
                                )}
                              </td>
                              <td className="px-4 py-3">
                                <select
                                  value={item.discountType}
                                  onChange={(e) => updateItem(index, 'discountType', e.target.value as 'percentage' | 'absolute')}
                                  className={`w-full px-2 py-1 text-sm bg-background border rounded focus:outline-none focus:ring-1 focus:ring-primary transition-colors ${
                                    !item.selected ? 'opacity-50' : 'border-border'
                                  }`}
                                  disabled={!item.selected || isSubmitting}
                                >
                                  <option value="percentage">%</option>
                                  <option value="absolute">€</option>
                                </select>
                              </td>
                              <td className="px-4 py-3">
                                <input
                                  type="number"
                                  value={item.discount}
                                  onChange={(e) => updateItem(index, 'discount', parseFloat(e.target.value) || 0)}
                                  min="0"
                                  max={item.discountType === 'percentage' ? 100 : undefined}
                                  step={item.discountType === 'percentage' ? "0.1" : "0.01"}
                                  placeholder={item.discountType === 'percentage' ? '0-100' : '0.00'}
                                  className={`w-full px-2 py-1 text-sm bg-background border rounded focus:outline-none focus:ring-1 focus:ring-primary transition-colors ${
                                    errors[`discount_${index}`] ? 'border-red-500' : 'border-border'
                                  } ${!item.selected ? 'opacity-50' : ''}`}
                                  disabled={!item.selected || isSubmitting}
                                />
                                {errors[`discount_${index}`] && (
                                  <p className="text-xs text-red-500 mt-1">{errors[`discount_${index}`]}</p>
                                )}
                              </td>
                              <td className="px-4 py-3 text-sm font-medium text-foreground">
                                {item.selected ? formatPrice(calculateItemTotal(item)) : '-'}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* Invoice Summary */}
            {getSelectedCount() > 0 && (
              <div className="bg-muted/50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-foreground mb-3">Invoice Summary</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Selected Items:</span>
                    <span className="text-foreground">{getSelectedCount()} products</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal:</span>
                    <span className="text-foreground">{formatPrice(calculateSubtotal())}</span>
                  </div>
                  {calculateTotalDiscount() > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Total Discount:</span>
                      <span className="text-red-600">-{formatPrice(calculateTotalDiscount())}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-semibold border-t border-border pt-2">
                    <span className="text-foreground">Total:</span>
                    <span className="text-primary">{formatPrice(calculateTotal())}</span>
                  </div>
                </div>
              </div>
            )}

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
                    Creating Invoice...
                  </span>
                ) : (
                  'Create Invoice'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
