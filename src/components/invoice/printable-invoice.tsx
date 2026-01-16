"use client";

import React from "react";
import { format } from "date-fns";

interface InvoiceItem {
    productName: string;
    sku: string;
    quantity: number;
    unitPrice: number;
    discount: number;
    taxRate: number;
    totalPrice: number;
}

interface InvoiceData {
    billNumber: string;
    date: Date;
    storeName: string;
    storeAddress: string;
    storePhone?: string;
    storeGST?: string;
    customerName?: string;
    customerPhone?: string;
    items: InvoiceItem[];
    subtotal: number;
    discount: number;
    taxAmount: number;
    totalAmount: number;
    paymentMethod: string;
    cashierName: string;
}

interface PrintableInvoiceProps {
    invoice: InvoiceData;
}

export default function PrintableInvoice({ invoice }: PrintableInvoiceProps) {
    return (
        <div className="printable-invoice bg-white p-8 max-w-4xl mx-auto" id="invoice-print">
            {/* Header */}
            <div className="border-b-2 border-gray-800 pb-4 mb-6">
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">INVOICE</h1>
                        <p className="text-sm text-gray-600 mt-1">Tax Invoice</p>
                    </div>
                    <div className="text-right">
                        <h2 className="text-2xl font-bold text-gray-900">HM ERP</h2>
                        <p className="text-sm text-gray-600">Hindustan Machinery</p>
                    </div>
                </div>
            </div>

            {/* Store & Invoice Details */}
            <div className="grid grid-cols-2 gap-8 mb-6">
                {/* Store Details */}
                <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">FROM:</h3>
                    <div className="text-sm">
                        <p className="font-semibold text-gray-900">{invoice.storeName}</p>
                        <p className="text-gray-600">{invoice.storeAddress}</p>
                        {invoice.storePhone && (
                            <p className="text-gray-600">Phone: {invoice.storePhone}</p>
                        )}
                        {invoice.storeGST && (
                            <p className="text-gray-600">GSTIN: {invoice.storeGST}</p>
                        )}
                    </div>
                </div>

                {/* Invoice Details */}
                <div className="text-right">
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="mb-2">
                            <span className="text-sm text-gray-600">Invoice No:</span>
                            <p className="text-lg font-bold text-gray-900">{invoice.billNumber}</p>
                        </div>
                        <div>
                            <span className="text-sm text-gray-600">Date:</span>
                            <p className="font-semibold text-gray-900">
                                {format(new Date(invoice.date), "dd MMM yyyy, hh:mm a")}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Customer Details */}
            {(invoice.customerName || invoice.customerPhone) && (
                <div className="mb-6 bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">BILL TO:</h3>
                    <div className="text-sm">
                        {invoice.customerName && (
                            <p className="font-semibold text-gray-900">{invoice.customerName}</p>
                        )}
                        {invoice.customerPhone && (
                            <p className="text-gray-600">Phone: {invoice.customerPhone}</p>
                        )}
                    </div>
                </div>
            )}

            {/* Items Table */}
            <div className="mb-6">
                <table className="w-full">
                    <thead>
                        <tr className="bg-gray-800 text-white">
                            <th className="text-left py-3 px-4 text-sm font-semibold">Item</th>
                            <th className="text-center py-3 px-2 text-sm font-semibold">SKU</th>
                            <th className="text-center py-3 px-2 text-sm font-semibold">Qty</th>
                            <th className="text-right py-3 px-2 text-sm font-semibold">Price</th>
                            <th className="text-right py-3 px-2 text-sm font-semibold">Disc.</th>
                            <th className="text-right py-3 px-2 text-sm font-semibold">Tax</th>
                            <th className="text-right py-3 px-4 text-sm font-semibold">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {invoice.items.map((item, index) => (
                            <tr key={index} className="border-b border-gray-200">
                                <td className="py-3 px-4 text-sm text-gray-900">{item.productName}</td>
                                <td className="py-3 px-2 text-center text-sm text-gray-600 font-mono">
                                    {item.sku}
                                </td>
                                <td className="py-3 px-2 text-center text-sm text-gray-900">
                                    {item.quantity}
                                </td>
                                <td className="py-3 px-2 text-right text-sm text-gray-900">
                                    ₹{item.unitPrice.toFixed(2)}
                                </td>
                                <td className="py-3 px-2 text-right text-sm text-gray-600">
                                    {item.discount > 0 ? `₹${item.discount.toFixed(2)}` : "-"}
                                </td>
                                <td className="py-3 px-2 text-right text-sm text-gray-600">
                                    {item.taxRate > 0 ? `${item.taxRate}%` : "-"}
                                </td>
                                <td className="py-3 px-4 text-right text-sm font-semibold text-gray-900">
                                    ₹{item.totalPrice.toFixed(2)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Totals */}
            <div className="flex justify-end mb-6">
                <div className="w-80">
                    <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Subtotal:</span>
                            <span className="font-semibold text-gray-900">
                                ₹{invoice.subtotal.toFixed(2)}
                            </span>
                        </div>
                        {invoice.discount > 0 && (
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Discount:</span>
                                <span className="font-semibold text-red-600">
                                    -₹{invoice.discount.toFixed(2)}
                                </span>
                            </div>
                        )}
                        {invoice.taxAmount > 0 && (
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Tax (GST):</span>
                                <span className="font-semibold text-gray-900">
                                    ₹{invoice.taxAmount.toFixed(2)}
                                </span>
                            </div>
                        )}
                        <div className="border-t-2 border-gray-300 pt-2 mt-2">
                            <div className="flex justify-between">
                                <span className="text-lg font-bold text-gray-900">Total:</span>
                                <span className="text-2xl font-bold text-gray-900">
                                    ₹{invoice.totalAmount.toFixed(2)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Payment & Footer Info */}
            <div className="border-t-2 border-gray-200 pt-4 mb-6">
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <p className="text-gray-600">Payment Method:</p>
                        <p className="font-semibold text-gray-900">{invoice.paymentMethod}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-gray-600">Cashier:</p>
                        <p className="font-semibold text-gray-900">{invoice.cashierName}</p>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="border-t border-gray-300 pt-4 text-center">
                <p className="text-sm text-gray-600 mb-2">Thank you for your business!</p>
                <p className="text-xs text-gray-500">
                    This is a computer-generated invoice and does not require a signature.
                </p>
            </div>

            {/* Print Styles */}
            <style jsx global>{`
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    #invoice-print,
                    #invoice-print * {
                        visibility: visible;
                    }
                    #invoice-print {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                    }
                    .no-print {
                        display: none !important;
                    }
                }
            `}</style>
        </div>
    );
}
