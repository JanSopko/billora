'use client';

import { useState, useEffect } from 'react';
import { withAuth } from '../../../components/auth-guard';
import { AddInvoiceModal } from '../../../components/add-invoice-modal';
import { UpdateInvoiceModal } from '../../../components/update-invoice-modal';
import { DeleteInvoiceModal } from '../../../components/delete-invoice-modal';

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
  productName: string;
  productCode: string;
  quantity: number;
  unitPrice: number;
  discount: number; // percentage (0-100) or absolute amount
  discountType: 'percentage' | 'absolute';
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

function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>(() => {
    // Initialize state from localStorage
    if (typeof window !== 'undefined') {
      const savedInvoices = localStorage.getItem('billora-invoices');
      if (savedInvoices) {
        try {
          return JSON.parse(savedInvoices);
        } catch (error) {
          console.error('Failed to load invoices:', error);
        }
      }
    }
    return [];
  });

  const [products, setProducts] = useState<Product[]>(() => {
    // Load products for invoice creation
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
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  // Save invoices to localStorage whenever invoices change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('billora-invoices', JSON.stringify(invoices));
    }
  }, [invoices]);

  const generateInvoiceNumber = (): string => {
    const year = new Date().getFullYear();
    const count = invoices.length + 1;
    return `INV-${year}-${count.toString().padStart(4, '0')}`;
  };

  const calculateItemSubtotal = (quantity: number, unitPrice: number, discount: number, discountType: 'percentage' | 'absolute'): number => {
    const grossAmount = quantity * unitPrice;
    let discountAmount = 0;
    
    if (discountType === 'percentage') {
      discountAmount = grossAmount * (discount / 100);
    } else {
      discountAmount = Math.min(discount, grossAmount); // Don't allow discount to exceed gross amount
    }
    
    return Math.max(0, grossAmount - discountAmount); // Don't allow negative totals
  };

  const handleAddInvoice = (formData: InvoiceFormData) => {
    const invoiceItems: InvoiceItem[] = formData.items.map(item => {
      const product = products.find(p => p.id === item.productId);
      if (!product) throw new Error('Product not found');
      
      const subtotal = calculateItemSubtotal(item.quantity, product.price, item.discount, item.discountType);
      
      return {
        productId: product.id,
        productName: product.name,
        productCode: product.code,
        quantity: item.quantity,
        unitPrice: product.price,
        discount: item.discount,
        discountType: item.discountType,
        subtotal,
      };
    });

    const subtotal = invoiceItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const totalDiscount = subtotal - invoiceItems.reduce((sum, item) => sum + item.subtotal, 0);
    const total = invoiceItems.reduce((sum, item) => sum + item.subtotal, 0);

    const newInvoice: Invoice = {
      id: `invoice-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      number: generateInvoiceNumber(),
      date: new Date().toISOString().split('T')[0],
      customerName: formData.customerName,
      customerEmail: formData.customerEmail,
      items: invoiceItems,
      subtotal,
      totalDiscount,
      total,
      status: 'draft',
      createdAt: new Date().toISOString(),
    };

    setInvoices(prev => [newInvoice, ...prev]);
    setIsAddModalOpen(false);
  };

  const handleUpdateInvoice = (formData: InvoiceFormData) => {
    if (!selectedInvoice) return;

    const invoiceItems: InvoiceItem[] = formData.items.map(item => {
      const product = products.find(p => p.id === item.productId);
      if (!product) throw new Error('Product not found');
      
      const subtotal = calculateItemSubtotal(item.quantity, product.price, item.discount, item.discountType);
      
      return {
        productId: product.id,
        productName: product.name,
        productCode: product.code,
        quantity: item.quantity,
        unitPrice: product.price,
        discount: item.discount,
        discountType: item.discountType,
        subtotal,
      };
    });

    const subtotal = invoiceItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const totalDiscount = subtotal - invoiceItems.reduce((sum, item) => sum + item.subtotal, 0);
    const total = invoiceItems.reduce((sum, item) => sum + item.subtotal, 0);

    const updatedInvoice: Invoice = {
      ...selectedInvoice,
      customerName: formData.customerName,
      customerEmail: formData.customerEmail,
      items: invoiceItems,
      subtotal,
      totalDiscount,
      total,
    };

    setInvoices(prev => prev.map(invoice => 
      invoice.id === selectedInvoice.id ? updatedInvoice : invoice
    ));
    setIsUpdateModalOpen(false);
    setSelectedInvoice(null);
  };

  const handleDeleteInvoice = () => {
    if (!selectedInvoice) return;
    
    setInvoices(prev => prev.filter(invoice => invoice.id !== selectedInvoice.id));
    setIsDeleteModalOpen(false);
    setSelectedInvoice(null);
  };

  const openUpdateModal = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setIsUpdateModalOpen(true);
  };

  const openDeleteModal = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setIsDeleteModalOpen(true);
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

  return (
    <>
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-2">Invoices</h1>
              <p className="text-lg text-muted-foreground">
                Manage your invoices and track payments
              </p>
            </div>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Invoice
            </button>
          </div>

          {/* Invoices Table */}
          {invoices.length > 0 ? (
            <div className="bg-background border border-border rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full divide-y divide-border">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Invoice
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Items
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Total
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-background divide-y divide-border">
                    {invoices.map((invoice) => (
                      <tr key={invoice.id} className="hover:bg-muted/30">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-foreground">{invoice.number}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-foreground">{invoice.customerName}</div>
                            {invoice.customerEmail && (
                              <div className="text-sm text-muted-foreground">{invoice.customerEmail}</div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                          {formatDate(invoice.date)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                          {invoice.items.length} item{invoice.items.length !== 1 ? 's' : ''}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-foreground">{formatPrice(invoice.total)}</div>
                          {invoice.totalDiscount > 0 && (
                            <div className="text-xs text-muted-foreground">
                              Discount: {formatPrice(invoice.totalDiscount)}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(invoice.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => openUpdateModal(invoice)}
                              className="text-muted-foreground hover:text-foreground hover:bg-muted p-2 rounded-lg transition-colors"
                              title="Edit invoice"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button 
                              onClick={() => openDeleteModal(invoice)}
                              className="text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/50 p-2 rounded-lg transition-colors"
                              title="Delete invoice"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            /* Empty State */
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">No invoices yet</h3>
              <p className="text-muted-foreground mb-6">
                Create your first invoice to start billing your customers
              </p>
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Create First Invoice
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Add Invoice Modal */}
      <AddInvoiceModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddInvoice}
        products={products}
      />

      {/* Update Invoice Modal */}
      {selectedInvoice && (
        <UpdateInvoiceModal
          isOpen={isUpdateModalOpen}
          onClose={() => {
            setIsUpdateModalOpen(false);
            setSelectedInvoice(null);
          }}
          onSubmit={handleUpdateInvoice}
          products={products}
          invoice={selectedInvoice}
        />
      )}

      {/* Delete Invoice Modal */}
      {selectedInvoice && (
        <DeleteInvoiceModal
          isOpen={isDeleteModalOpen}
          onClose={() => {
            setIsDeleteModalOpen(false);
            setSelectedInvoice(null);
          }}
          onConfirm={handleDeleteInvoice}
          invoice={selectedInvoice}
        />
      )}
    </>
  );
}

export default withAuth(InvoicesPage);
