import React from 'react';
import { UpiQrCode } from './UpiQrCode';

export function QuotationTemplate({ quotation, companySettings }: { quotation: any, companySettings?: any }) {
  if (!quotation) return null;

  return (
    <div className="bg-white p-10 mx-auto w-full max-w-4xl text-zinc-800 font-sans print:p-0 print:max-w-full print:m-0">
      
      {/* Header Section */}
      <div className="flex justify-between items-start mb-12">
        <div>
          {companySettings?.logoBase64 ? (
            <img src={companySettings.logoBase64} alt="Company Logo" className="max-h-[60px] object-contain" />
          ) : (
            <div className="inline-block border border-blue-400 rounded px-4 py-1.5 text-blue-500 font-bold text-lg tracking-wide">
              {companySettings?.companyName || "COMPANY"}
            </div>
          )}
        </div>
        <div className="text-right">
          <h2 className="text-3xl font-bold text-zinc-800 tracking-tight uppercase">Quotation</h2>
          <div className="mt-4 space-y-1 text-sm text-zinc-500">
            <p><span className="font-medium text-zinc-700">Quote No:</span> {quotation.number}</p>
            <p><span className="font-medium text-zinc-700">Date:</span> {new Intl.DateTimeFormat('en-US', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(quotation.createdAt))}</p>
            {quotation.validUntil && (
              <p><span className="font-medium text-zinc-700">Valid Until:</span> {new Intl.DateTimeFormat('en-US', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(quotation.validUntil))}</p>
            )}
          </div>
        </div>
      </div>

      {/* Details Cards Section */}
      <div className="grid grid-cols-2 gap-6 mb-12">
        {/* Your Details */}
        <div className="border border-dashed border-zinc-300 rounded p-5">
          <h3 className="text-blue-500 font-semibold mb-3">Your details:</h3>
          <div className="space-y-1 text-sm text-zinc-500">
            <p className="font-semibold text-zinc-700">{companySettings?.companyName || "Your Company Name"}</p>
            <p className="whitespace-pre-wrap leading-relaxed">{companySettings?.address || "123 Business Road\nCity, State 12345"}</p>
            {companySettings?.gstin && <p>GSTIN: {companySettings.gstin}</p>}
            {companySettings?.pan && <p>PAN: {companySettings.pan}</p>}
          </div>
        </div>

        {/* Client's Details */}
        <div className="border border-dashed border-zinc-300 rounded p-5">
          <h3 className="text-blue-500 font-semibold mb-3">Client's details:</h3>
          <div className="space-y-1 text-sm text-zinc-500">
            <p className="font-semibold text-zinc-700">{quotation.customer.name}</p>
            <p className="whitespace-pre-wrap leading-relaxed">{quotation.customer.billingAddress || "Client Address not provided"}</p>
            {quotation.customer.gstin && <p>GSTIN: {quotation.customer.gstin}</p>}
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="mb-12">
        <table className="w-full text-left text-sm">
          <thead className="bg-zinc-100 border-y border-zinc-300 text-zinc-600">
            <tr>
              <th className="py-3 px-4 font-semibold uppercase tracking-wider text-xs">Item Details</th>
              <th className="py-3 px-4 font-semibold uppercase tracking-wider text-xs text-center">Qty</th>
              <th className="py-3 px-4 font-semibold uppercase tracking-wider text-xs text-right">Rate</th>
              <th className="py-3 px-4 font-semibold uppercase tracking-wider text-xs text-right">Discount</th>
              <th className="py-3 px-4 font-semibold uppercase tracking-wider text-xs text-right">Tax</th>
              <th className="py-3 px-4 font-semibold uppercase tracking-wider text-xs text-right">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {quotation.items.map((item: any) => {
              const hsnCode = item.hsnCode || item.product?.hsnSac || item.product?.hsnCode;
              const taxAmount = (item.cgst || 0) + (item.sgst || 0) + (item.igst || 0);
              const taxableValue = item.taxableValue || ((item.rate * item.quantity) - (item.discount || 0));
              const taxPercent = taxableValue > 0 ? (taxAmount / taxableValue) * 100 : 0;
              const discountValue = item.discount || 0;

              return (
                <tr key={item.id}>
                  <td className="py-4 px-4 align-top w-1/3">
                    <p className="font-bold text-zinc-700">{item.product.name}</p>
                    {hsnCode && <p className="text-xs text-zinc-400 mt-0.5">HSN: {hsnCode}</p>}
                    {item.notes && <p className="text-xs text-zinc-500 mt-1 italic whitespace-pre-wrap">{item.notes}</p>}
                  </td>
                  <td className="py-4 px-4 align-top text-center text-zinc-600">
                    {item.quantity}
                  </td>
                  <td className="py-4 px-4 align-top text-right text-zinc-600">
                    ₹{item.rate.toFixed(2)}
                  </td>
                  <td className="py-4 px-4 align-top text-right text-zinc-600">
                    ₹{discountValue.toFixed(2)}
                  </td>
                  <td className="py-4 px-4 align-top text-right text-zinc-600">
                    <div>₹{taxAmount.toFixed(2)}</div>
                    {taxAmount > 0 && <div className="text-xs text-zinc-400 mt-0.5">({Math.round(taxPercent)}%)</div>}
                  </td>
                  <td className="py-4 px-4 align-top text-right text-zinc-700 font-medium">
                    ₹{item.total.toFixed(2)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-8">
        {/* Bank Details & QR */}
        <div className="flex-1 w-full text-sm text-zinc-500">
          <div className="flex flex-col sm:flex-row gap-6 p-5 border border-dashed border-zinc-300 rounded">
            <div className="flex-1">
              <h4 className="font-semibold text-zinc-700 mb-2 text-blue-500">Bank Details:</h4>
              <div className="space-y-1 text-sm text-zinc-500">
                <p><span className="font-medium text-zinc-700">Bank:</span> {companySettings?.bankName || "ACME Tech Solutions Pvt Ltd"}</p>
                <p><span className="font-medium text-zinc-700">Account No:</span> {companySettings?.accountNumber || "1234567890"}</p>
                <p><span className="font-medium text-zinc-700">IFSC:</span> {companySettings?.ifscCode || "HDFC0001234"}</p>
              </div>
              
              {companySettings?.terms && (
                <div className="mt-4 pt-4 border-t border-zinc-200">
                  <h4 className="font-semibold text-zinc-700 mb-1">Terms & Conditions:</h4>
                  <p className="text-xs whitespace-pre-wrap">{companySettings.terms}</p>
                </div>
              )}
            </div>
            
            {companySettings?.upiId && (
              <div className="flex-none flex items-center justify-center">
                <UpiQrCode 
                  upiId={companySettings.upiId} 
                  payeeName={companySettings.companyName || "Your Company Name"} 
                  amount={quotation.grandTotal} 
                  invoiceNumber={quotation.number} 
                />
              </div>
            )}
          </div>
        </div>

        {/* Quotation Summary */}
        <div className="w-80 flex-none">
          <div className="border-y border-zinc-300 py-2 mb-4">
            <h3 className="text-center font-semibold text-zinc-700 tracking-wide uppercase text-sm">Quotation Summary</h3>
          </div>
          
          <div className="space-y-3 text-sm">
            <div className="flex justify-between text-zinc-600">
              <span>Subtotal</span>
              <span>₹{quotation.subtotal.toFixed(2)}</span>
            </div>
            {quotation.discount > 0 && (
              <div className="flex justify-between text-red-500">
                <span>Discount</span>
                <span>-₹{quotation.discount.toFixed(2)}</span>
              </div>
            )}
            
            {quotation.cgst > 0 && (
              <div className="flex justify-between text-zinc-600">
                <span>CGST</span>
                <span>₹{quotation.cgst.toFixed(2)}</span>
              </div>
            )}
            {quotation.sgst > 0 && (
              <div className="flex justify-between text-zinc-600">
                <span>SGST</span>
                <span>₹{quotation.sgst.toFixed(2)}</span>
              </div>
            )}
            {quotation.igst > 0 && (
              <div className="flex justify-between text-zinc-600">
                <span>IGST</span>
                <span>₹{quotation.igst.toFixed(2)}</span>
              </div>
            )}

            <div className="flex justify-between items-center pt-4 border-t border-zinc-200 mt-2">
              <span className="text-lg font-bold text-zinc-800">Total</span>
              <span className="text-xl font-bold text-blue-600">₹{quotation.grandTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
