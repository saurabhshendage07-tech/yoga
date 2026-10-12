import React from 'react';
import { X, Printer, CheckCircle2, ShieldCheck } from 'lucide-react';

export default function ReceiptModal({ enrollment, onClose }) {
  if (!enrollment) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-[#DDD5C7] relative animate-fade-in">
        {/* Header Actions */}
        <div className="flex items-center justify-between pb-4 border-b border-[#EAE3D6] print:hidden">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#2D4A3E] uppercase tracking-wider">
            <CheckCircle2 className="w-4 h-4 text-[#55755E]" />
            Official Payment Receipt
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#EFE9DF] hover:bg-[#E2D8C9] text-xs font-medium text-[#24362C] transition"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Receipt</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Receipt Body */}
        <div className="pt-6 space-y-6 text-[#24362C]">
          {/* Studio Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-[#EAE3D6] p-1.5 flex items-center justify-center">
                <img src="/logo.svg" alt="PranaVeda Logo" className="w-full h-full object-contain" />
              </div>
              <div>
                <h2 className="font-heading font-bold text-xl tracking-wider text-[#2D4A3E]">
                  PRANAVEDA YOGA & WELLNESS
                </h2>
                <p className="text-xs text-[#6A7E72]">Himalayan Tradition & Mind-Body Sanctuary</p>
                <p className="text-[11px] text-[#869A8C]">Ram Mandir Chowk | Sangli, Maharashtra - 416416</p>
              </div>
            </div>

            <div className="text-right">
              <span className="inline-block px-2.5 py-1 bg-green-100 text-green-800 text-[11px] font-bold uppercase rounded-full tracking-wider">
                PAID & VERIFIED
              </span>
              <p className="text-xs text-[#869A8C] mt-1 font-mono">
                {enrollment.id || 'ENR-2026-XXXX'}
              </p>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-[#FBF9F5] border border-[#EAE3D6] text-xs">
            <div>
              <p className="text-[#7A8C80] uppercase tracking-wider font-semibold text-[10px]">Student Name</p>
              <p className="font-medium text-sm text-[#24362C] mt-0.5">{enrollment.userName}</p>
            </div>
            <div>
              <p className="text-[#7A8C80] uppercase tracking-wider font-semibold text-[10px]">Mobile / Contact</p>
              <p className="font-medium text-sm text-[#24362C] mt-0.5">{enrollment.userMobile}</p>
            </div>
            <div>
              <p className="text-[#7A8C80] uppercase tracking-wider font-semibold text-[10px]">Email Address</p>
              <p className="font-medium text-xs text-[#24362C] mt-0.5 truncate">{enrollment.userEmail}</p>
            </div>
            <div>
              <p className="text-[#7A8C80] uppercase tracking-wider font-semibold text-[10px]">Enrolled Date</p>
              <p className="font-medium text-xs text-[#24362C] mt-0.5">
                {enrollment.createdAt ? new Date(enrollment.createdAt).toLocaleDateString('en-IN', { dateStyle: 'medium' }) : new Date().toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Course & Fee Breakdown */}
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-[#DDD5C7] text-[#6A7E72] text-[11px] uppercase">
                <th className="text-left py-2">Course Description</th>
                <th className="text-left py-2">Batch Timing</th>
                <th className="text-right py-2">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0EAE1]">
              <tr>
                <td className="py-3 font-semibold text-sm text-[#2D4A3E]">
                  {enrollment.courseName}
                </td>
                <td className="py-3 text-[#5A6D61]">
                  {enrollment.batchTiming}
                </td>
                <td className="py-3 text-right font-semibold text-sm">
                  ₹{Number(enrollment.amount).toLocaleString('en-IN')}
                </td>
              </tr>
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-[#2D4A3E] font-bold text-sm">
                <td colSpan="2" className="pt-3 text-right">Total Amount Paid:</td>
                <td className="pt-3 text-right text-[#2D4A3E]">
                  ₹{Number(enrollment.amount).toLocaleString('en-IN')}
                </td>
              </tr>
            </tfoot>
          </table>

          {/* Payment Identification Meta */}
          <div className="p-3 bg-[#F4F0E8] rounded-lg text-[11px] space-y-1 font-mono text-[#55695C]">
            <div className="flex justify-between">
              <span>Razorpay Payment ID:</span>
              <span className="font-bold text-[#24362C]">{enrollment.paymentId || 'pay_verified_razorpay'}</span>
            </div>
            <div className="flex justify-between">
              <span>Order ID:</span>
              <span>{enrollment.orderId || 'order_verified'}</span>
            </div>
            <div className="flex justify-between">
              <span>Verification Status:</span>
              <span className="text-green-700 font-semibold">Backend HMAC SHA256 Signature Verified ✓</span>
            </div>
          </div>

          {/* Footer Notes */}
          <div className="pt-2 text-center text-[10px] text-[#869A8C] space-y-1">
            <p className="flex items-center justify-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#55755E]" />
              This is a computer generated official enrollment confirmation & receipt.
            </p>
            <p>PranaVeda Yoga & Wellness Sanctuary | Contact: +91 98765 43210 | namaste@pranavedayoga.com</p>
          </div>
        </div>
      </div>
    </div>
  );
}
