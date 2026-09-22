"use client";

import { QRCodeSVG } from "qrcode.react";

interface UpiQrCodeProps {
  upiId: string;
  payeeName: string;
  amount: number;
  invoiceNumber: string;
}

export function UpiQrCode({ upiId, payeeName, amount, invoiceNumber }: UpiQrCodeProps) {
  // Strict NPCI URI specification
  const upiString = "upi://pay?pa=" + upiId + "&pn=" + encodeURIComponent(payeeName) + "&am=" + amount + "&cu=INR&tn=" + encodeURIComponent(invoiceNumber);

  return (
    <div className="flex flex-col items-center p-2 bg-white rounded-md border border-slate-200 shadow-sm print:shadow-none print:border-slate-300">
      <QRCodeSVG 
        value={upiString} 
        size={100} 
        level="H" 
        includeMargin={true}
        className="print:vector-sharp"
      />
      <div className="text-[10px] text-slate-500 mt-1 font-medium text-center leading-tight">
        Scan to Pay<br/>₹{amount.toFixed(2)}
      </div>
    </div>
  );
}
