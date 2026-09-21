import React from 'react';

export function QuotationTemplate({ quotation, companySettings }: { quotation: any, companySettings?: any }) {
  if (!quotation) return null;

  return (
    <div className="bg-white shadow-lg rounded-lg p-8 mx-auto w-full max-w-4xl print:shadow-none print:p-0 print:max-w-full print:m-0 print:border-none text-slate-800">
      {/* Zone 1: Header */}
      <div className="flex justify-between items-start border-b border-slate-200 pb-6 mb-6 print:border-b-2 print:border-slate-300">
        <div>
          {companySettings?.logoBase64 && (
            <img src={companySettings.logoBase64} alt="Company Logo" className="max-h-[60px] mb-4 object-contain" />
          )}
          <h1 className="text-3xl font-bold text-indigo-600 print:text-black">{companySettings?.companyName || "Your Company Name"}</h1>
          <p className="text-sm mt-1 text-slate-500 print:text-slate-700 whitespace-pre-wrap">{companySettings?.address || "123 Business Road, Tech Park\nMumbai, Maharashtra 400001"}</p>
          {companySettings?.gstin && <p className="text-sm font-medium mt-1">GSTIN: {companySettings.gstin}</p>}
          {companySettings?.pan && <p className="text-sm font-medium mt-1">PAN: {companySettings.pan}</p>}
        </div>
        <div className="text-right">
          <h2 className="text-2xl font-bold uppercase tracking-wider text-slate-400 print:text-black">Quotation</h2>
          <p className="text-lg font-semibold mt-2">QT-{quotation.number}</p>
          <p className="text-sm text-slate-500 print:text-slate-700 mt-1">Date: {new Date(quotation.createdAt).toLocaleDateString()}</p>
        </div>
      </div>

      {/* Zone 2: Parties */}
      <div className="flex justify-between mb-8">
        <div className="w-1/2 pr-4 border-r border-slate-200 print:border-slate-300">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 print:text-black">Quote To</h3>
          <p className="font-semibold text-lg">{quotation.customer?.name}</p>
          <p className="text-sm text-slate-600 print:text-black">{quotation.customer?.billingAddress}</p>
          {quotation.customer?.gstin && <p className="text-sm font-medium mt-1">GSTIN: {quotation.customer.gstin}</p>}
        </div>
      </div>

      {/* Zone 3: Grid */}
      <div className="mb-8 overflow-hidden rounded-lg border border-slate-200 print:border-black print:rounded-none">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-slate-600 uppercase bg-slate-50 border-b border-slate-200 print:bg-slate-100 print:border-black print:text-black">
            <tr>
              <th className="px-4 py-3 font-semibold">#</th>
              <th className="px-4 py-3 font-semibold">Product Description</th>
              <th className="px-4 py-3 font-semibold text-right">Qty</th>
              <th className="px-4 py-3 font-semibold text-right">Rate</th>
              <th className="px-4 py-3 font-semibold text-right">Discount</th>
              <th className="px-4 py-3 font-semibold text-right">Taxable Value</th>
              <th className="px-4 py-3 font-semibold text-right">Tax Calculated</th>
              <th className="px-4 py-3 font-semibold text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {quotation.items?.map((item: any, idx: number) => {
              const taxPercent = (item.cgst + item.sgst + item.igst) / item.taxableValue * 100;
              const taxAmount = item.cgst + item.sgst + item.igst;
              return (
                <tr key={item.id} className="border-b border-slate-200 last:border-0 print:border-black">
                  <td className="px-4 py-3">{idx + 1}</td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-900 print:text-black">{item.product?.name}</div>
                    <div className="text-xs text-slate-500 print:text-slate-700">SKU: {item.product?.sku}</div>
                  </td>
                  <td className="px-4 py-3 text-right">{item.quantity}</td>
                  <td className="px-4 py-3 text-right">₹{item.rate.toFixed(2)}</td>
                  <td className="px-4 py-3 text-right">₹{item.discount.toFixed(2)}</td>
                  <td className="px-4 py-3 text-right font-medium">₹{item.taxableValue.toFixed(2)}</td>
                  <td className="px-4 py-3 text-right">
                    <div>₹{taxAmount.toFixed(2)}</div>
                    <div className="text-xs text-slate-500">({Math.round(taxPercent)}%)</div>
                  </td>
                  <td className="px-4 py-3 text-right font-bold">₹{item.total.toFixed(2)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Zone 4: Footer */}
      <div className="flex justify-between items-start mt-8 pt-8 border-t border-slate-200 print:border-t-2 print:border-black">
        <div className="w-1/2 pr-8">
          <div className="mb-6">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 print:text-black">Amount in Words</h4>
            <p className="text-sm italic font-medium">Rupees {Math.round(quotation.grandTotal)} Only</p>
          </div>
          
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 print:bg-white print:border-black print:rounded-none">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 print:text-black">Bank Details</h4>
            <p className="text-sm font-semibold">{companySettings?.bankName || "ACME Tech Solutions Pvt Ltd"}</p>
            <p className="text-sm text-slate-600 print:text-black">Account No: {companySettings?.accountNumber || "1234567890"}</p>
            <p className="text-sm text-slate-600 print:text-black">IFSC: {companySettings?.ifscCode || "HDFC0001234"}</p>
            {companySettings?.terms && (
              <div className="mt-4 pt-4 border-t border-slate-200 print:border-black">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1 print:text-black">Terms & Conditions</h4>
                <p className="text-xs text-slate-600 print:text-black whitespace-pre-wrap">{companySettings.terms}</p>
              </div>
            )}
          </div>
        </div>

        <div className="w-1/3">
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-slate-600 print:text-black">Subtotal</span>
              <span className="font-medium">₹{quotation.subtotal.toFixed(2)}</span>
            </div>
            {quotation.discount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-slate-600 print:text-black">Total Discount</span>
                <span className="font-medium text-red-600">-₹{quotation.discount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-slate-600 print:text-black">Taxable Value</span>
              <span className="font-medium">₹{quotation.taxableValue.toFixed(2)}</span>
            </div>
            
            <div className="pt-2 border-t border-slate-200 print:border-slate-300">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600 print:text-black">CGST</span>
                <span className="font-medium">₹{quotation.cgst.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm mt-1">
                <span className="text-slate-600 print:text-black">SGST</span>
                <span className="font-medium">₹{quotation.sgst.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex justify-between items-center pt-4 border-t-2 border-slate-800 print:border-black mt-2">
              <span className="font-bold text-lg">Grand Total</span>
              <span className="font-bold text-xl text-indigo-700 print:text-black">₹{quotation.grandTotal.toFixed(2)}</span>
            </div>
          </div>

          <div className="mt-12 text-center pt-8">
            <div className="border-t border-slate-300 print:border-black w-48 mx-auto mb-2"></div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500 print:text-black">Authorized Signatory</p>
          </div>
        </div>
      </div>
    </div>
  );
}
