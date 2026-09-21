import React from 'react';

export function InvoiceTemplate({ invoice, companySettings }: { invoice: any, companySettings?: any }) {
  if (!invoice) return null;

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
          <h2 className="text-2xl font-bold uppercase tracking-wider text-slate-400 print:text-black">Tax Invoice</h2>
          <div className="mt-2 text-sm">
            <p><span className="font-semibold text-slate-700 print:text-black">Invoice No:</span> {invoice.number}</p>
            <p><span className="font-semibold text-slate-700 print:text-black">Date:</span> {new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(invoice.date))}</p>
            {invoice.placeOfSupply && <p><span className="font-semibold text-slate-700 print:text-black">Place of Supply:</span> {invoice.placeOfSupply}</p>}
            <div className="mt-2 inline-block px-2 py-1 text-xs font-semibold uppercase tracking-wide rounded border border-slate-200 print:border-black">
              {invoice.status}
            </div>
          </div>
        </div>
      </div>

      {/* Zone 2: Parties */}
      <div className="grid grid-cols-2 gap-8 mb-8">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 border-b pb-1 print:text-black print:border-black">Bill To</h3>
          <p className="font-bold text-lg">{invoice.customer.name}</p>
          {invoice.customer.billingAddress && (
            <p className="text-sm whitespace-pre-wrap mt-1 text-slate-600 print:text-black">{invoice.customer.billingAddress}</p>
          )}
          {invoice.customer.gstin && (
            <p className="text-sm mt-2 font-medium">GSTIN: {invoice.customer.gstin}</p>
          )}
        </div>
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 border-b pb-1 print:text-black print:border-black">Ship To</h3>
          {invoice.customer.shippingAddress ? (
            <>
              <p className="font-bold text-lg">{invoice.customer.name}</p>
              <p className="text-sm whitespace-pre-wrap mt-1 text-slate-600 print:text-black">{invoice.customer.shippingAddress}</p>
            </>
          ) : (
            <p className="text-sm text-slate-500 italic print:text-black">Same as billing address</p>
          )}
        </div>
      </div>

      {/* Zone 3: Grid */}
      <div className="mb-8 overflow-hidden rounded-lg border border-slate-200 print:border-black print:rounded-none">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b border-slate-200 print:bg-white print:border-b-2 print:border-black">
            <tr>
              <th className="py-3 px-4 font-semibold text-slate-700 print:text-black print:px-2">#</th>
              <th className="py-3 px-4 font-semibold text-slate-700 print:text-black print:px-2">Description</th>
              <th className="py-3 px-4 font-semibold text-slate-700 text-right print:text-black print:px-2">Qty</th>
              <th className="py-3 px-4 font-semibold text-slate-700 text-right print:text-black print:px-2">Rate</th>
              <th className="py-3 px-4 font-semibold text-slate-700 text-right print:text-black print:px-2">Taxable</th>
              {invoice.type === "GST" && (
                <th className="py-3 px-4 font-semibold text-slate-700 text-right print:text-black print:px-2">Tax</th>
              )}
              <th className="py-3 px-4 font-semibold text-slate-700 text-right print:text-black print:px-2">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 print:divide-black">
            {invoice.items.map((item: any, idx: number) => (
              <tr key={item.id} className="print:border-b print:border-slate-300">
                <td className="py-3 px-4 text-slate-500 print:text-black print:px-2">{idx + 1}</td>
                <td className="py-3 px-4 print:px-2">
                  <p className="font-medium text-slate-900 print:text-black">{item.product.name}</p>
                  {item.product.hsnSac && <p className="text-xs text-slate-500 print:text-slate-700">HSN: {item.product.hsnSac}</p>}
                </td>
                <td className="py-3 px-4 text-right print:px-2">{item.quantity} {item.unit}</td>
                <td className="py-3 px-4 text-right print:px-2">₹{item.rate.toFixed(2)}</td>
                <td className="py-3 px-4 text-right print:px-2">₹{item.taxableValue.toFixed(2)}</td>
                {invoice.type === "GST" && (
                  <td className="py-3 px-4 text-right print:px-2">
                    <p>₹{(item.cgst + item.sgst + item.igst).toFixed(2)}</p>
                    <p className="text-xs text-slate-500 print:text-slate-700">({item.product.gstPercent}%)</p>
                  </td>
                )}
                <td className="py-3 px-4 text-right font-medium print:px-2">₹{item.total.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Zone 4: Footer */}
      <div className="flex flex-col md:flex-row justify-between items-start gap-8 print:flex-row">
        <div className="flex-1 w-full space-y-6">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1 print:text-black">Amount in Words</h4>
            <p className="text-sm font-medium italic">Rupees {invoice.grandTotal.toLocaleString()} Only</p>
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

        <div className="flex-none w-full md:w-72 print:w-72 space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-slate-600 print:text-black">Subtotal</span>
            <span className="font-medium">₹{invoice.subtotal.toFixed(2)}</span>
          </div>
          {invoice.discount > 0 && (
            <div className="flex justify-between text-sm text-green-600 print:text-black">
              <span>Discount</span>
              <span>-₹{invoice.discount.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between text-sm">
            <span className="text-slate-600 print:text-black">Taxable Value</span>
            <span className="font-medium">₹{invoice.taxableValue.toFixed(2)}</span>
          </div>
          {invoice.type === "GST" && (
            <>
              {invoice.cgst > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600 print:text-black">CGST</span>
                  <span className="font-medium">₹{invoice.cgst.toFixed(2)}</span>
                </div>
              )}
              {invoice.sgst > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600 print:text-black">SGST</span>
                  <span className="font-medium">₹{invoice.sgst.toFixed(2)}</span>
                </div>
              )}
              {invoice.igst > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600 print:text-black">IGST</span>
                  <span className="font-medium">₹{invoice.igst.toFixed(2)}</span>
                </div>
              )}
            </>
          )}
          <div className="flex justify-between items-center border-t-2 border-slate-800 pt-3 mt-3 print:border-black">
            <span className="text-lg font-bold">Grand Total</span>
            <span className="text-xl font-bold">₹{invoice.grandTotal.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div className="mt-16 pt-16 flex justify-end print:mt-12 print:pt-12">
        <div className="text-center">
          <div className="border-b-2 border-slate-300 w-48 mb-2 mx-auto print:border-black"></div>
          <p className="text-sm font-medium text-slate-700 print:text-black">Authorized Signatory</p>
        </div>
      </div>
    </div>
  );
}
