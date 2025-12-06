'use client';

import { useEffect, useState } from 'react';

interface InvoiceItem {
  productId: string;
  productName: string;
  productCode: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  subtotal: number;
}

interface Invoice {
  id: string;
  number: string;
  date: string;
  customerName: string;
  customerEmail?: string;
  items: InvoiceItem[];
  subtotal: number;
  totalDiscount: number;
  total: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
  createdAt: string;
}

interface DeleteInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  invoice: Invoice;
}

export function DeleteInvoiceModal({ isOpen, onClose, onConfirm, invoice }: DeleteInvoiceModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);

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

  // Reset deleting state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setIsDeleting(false);
    }
  }, [isOpen]);

  const handleConfirm = async () => {
    setIsDeleting(true);
    
    try {
      // Simulate a brief delay for better UX
      await new Promise(resolve => setTimeout(resolve, 300));
      onConfirm();
    } catch (error) {
      console.error('Failed to delete invoice:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR'
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadge = (status: Invoice['status']) => {
    const styles = {
      draft: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
      sent: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      paid: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      overdue: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      
      {/* Modal Container */}
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="relative bg-background border border-border rounded-xl shadow-xl max-w-lg w-full mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border">
            <h2 className="text-xl font-semibold text-foreground">Delete Invoice</h2>
            <button
              onClick={onClose}
              className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
              disabled={isDeleting}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Warning Icon */}
            <div className="flex items-center justify-center w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full mx-auto mb-4">
              <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.732 15.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>

            {/* Confirmation Message */}
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Are you sure you want to delete this invoice?
              </h3>
              <p className="text-muted-foreground mb-4">
                This action cannot be undone. The invoice will be permanently removed from your records.
              </p>
            </div>

            {/* Invoice Details */}
            <div className="bg-muted/50 rounded-lg p-4 mb-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Invoice Number:</span>
                  <span className="text-sm font-medium text-foreground">{invoice.number}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Customer:</span>
                  <span className="text-sm font-medium text-foreground">{invoice.customerName}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Date:</span>
                  <span className="text-sm text-foreground">{formatDate(invoice.date)}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Items:</span>
                  <span className="text-sm text-foreground">{invoice.items.length} product{invoice.items.length !== 1 ? 's' : ''}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Status:</span>
                  {getStatusBadge(invoice.status)}
                </div>
                
                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <span className="text-sm font-medium text-foreground">Total Amount:</span>
                  <span className="text-lg font-bold text-primary">{formatPrice(invoice.total)}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-3 border border-border text-foreground hover:bg-muted rounded-lg font-medium transition-colors"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Deleting...
                  </span>
                ) : (
                  'Delete Invoice'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
