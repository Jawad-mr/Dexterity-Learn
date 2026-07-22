import React, { useState } from 'react';
import { X, ShieldCheck, Tag, ArrowRight, CheckCircle2, MessageCircle, AlertCircle } from 'lucide-react';
import { useAuth, api } from '../context/AuthContext';

export default function RazorpayModal({
  isOpen,
  onClose,
  productType = 'certificate', // 'certificate' | 'book' | 'coffee'
  productId = null,
  productName = 'Verified Certificate',
  basePrice = 499,
  onSuccess = null
}) {
  const { user } = useAuth();
  const [customerName, setCustomerName] = useState(user?.username || '');
  const [customerEmail, setCustomerEmail] = useState(user?.email || '');
  const [customerPhone, setCustomerPhone] = useState('');
  
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState(null); // { code, discountPercent }
  const [promoError, setPromoError] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  // Available promo codes logic
  const handleApplyPromo = () => {
    setPromoError('');
    const code = promoCode.trim().toUpperCase();

    if (!code) {
      setPromoError('Please enter a promo code');
      return;
    }

    if (code === 'FREE100') {
      setAppliedPromo({ code: 'FREE100', discountPercent: 100 });
    } else if (code === 'DEX50') {
      setAppliedPromo({ code: 'DEX50', discountPercent: 50 });
    } else if (code === 'WELCOME20') {
      setAppliedPromo({ code: 'WELCOME20', discountPercent: 20 });
    } else {
      setPromoError('Invalid promo code. Try FREE100, DEX50, or WELCOME20.');
    }
  };

  const discountPercent = appliedPromo ? appliedPromo.discountPercent : 0;
  const discountAmount = Math.round((basePrice * discountPercent) / 100);
  const finalPrice = Math.max(0, basePrice - discountAmount);

  const handleWhatsAppPayment = async (e) => {
    e.preventDefault();
    setError('');

    if (!customerPhone || customerPhone.length < 10) {
      setError('Please provide a valid 10-digit WhatsApp phone number');
      return;
    }

    setLoading(true);

    try {
      // 1. Log payment order in backend
      const res = await api.post('/payments/create-order', {
        productType,
        productId,
        amount: finalPrice,
        originalAmount: basePrice,
        promoCode: appliedPromo ? appliedPromo.code : null,
        customerName,
        customerEmail,
        customerPhone,
      });

      const orderData = res.data.order;

      // 2. Construct WhatsApp pre-filled deep link
      const waNumber = '917204351696';
      const message = `*DEXTERITY LEARN — PAYMENT & ACCESS REQUEST*%0A` +
        `----------------------------------------%0A` +
        `*Order Ref:* ${orderData.invoiceNumber || 'INV-' + Date.now()}%0A` +
        `*Product:* ${productName}%0A` +
        `*Customer Name:* ${customerName}%0A` +
        `*Email:* ${customerEmail}%0A` +
        `*Phone:* ${customerPhone}%0A` +
        `----------------------------------------%0A` +
        `*Original Price:* ₹${basePrice}%0A` +
        (appliedPromo ? `*Promo Code:* ${appliedPromo.code} (${appliedPromo.discountPercent}% OFF)%0A` : '') +
        `*Final Amount Payable:* ₹${finalPrice}%0A` +
        `----------------------------------------%0A` +
        `Please verify and activate my access request.`;

      const waUrl = `https://wa.me/${waNumber}?text=${message}`;

      setLoading(false);

      if (onSuccess) onSuccess(orderData);

      // Redirect to WhatsApp
      window.location.href = waUrl;
      onClose();
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || 'Failed to initialize WhatsApp payment gateway.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border-2 border-slate-950 rounded-3xl w-full max-w-md overflow-hidden shadow-flat-lg relative">
        
        {/* Header - Razorpay Inspired Theme */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-5 relative border-b-2 border-slate-950">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-300 hover:text-white bg-slate-800/60 p-1.5 rounded-full border border-slate-700 transition"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <div className="h-7 w-7 rounded-lg bg-blue-500 flex items-center justify-center font-black text-white text-xs border border-white/20">
              R
            </div>
            <span className="text-xs font-black tracking-wide uppercase text-blue-200">Razorpay Checkout</span>
          </div>

          <h3 className="text-base font-black text-white">{productName}</h3>
          
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-400">₹{finalPrice}</span>
            {appliedPromo && (
              <span className="text-xs text-slate-400 line-through">₹{basePrice}</span>
            )}
            {appliedPromo && (
              <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full">
                {appliedPromo.discountPercent}% OFF APPLIED
              </span>
            )}
          </div>

          <div className="flex items-center gap-1 mt-2 text-[10px] text-slate-300 font-semibold">
            <ShieldCheck className="h-3.5 w-3.5 text-blue-400" />
            256-Bit Encrypted Secure WhatsApp Gateway
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleWhatsAppPayment} className="p-5 space-y-4">
          
          {error && (
            <div className="flex items-center gap-2 bg-red-50 dark:bg-red-950/30 border-2 border-red-500/50 p-2.5 rounded-xl text-xs font-bold text-red-600 dark:text-red-400">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Customer Name */}
          <div>
            <label className="text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 block mb-1">
              Full Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Rahul Sharma"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full rounded-xl bg-slate-50 dark:bg-slate-800 py-2 px-3 text-xs border-2 border-slate-950 focus:outline-none font-bold text-slate-900 dark:text-white"
            />
          </div>

          {/* Customer Email */}
          <div>
            <label className="text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 block mb-1">
              Email Address
            </label>
            <input
              type="email"
              required
              placeholder="e.g. rahul@example.com"
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
              className="w-full rounded-xl bg-slate-50 dark:bg-slate-800 py-2 px-3 text-xs border-2 border-slate-950 focus:outline-none font-bold text-slate-900 dark:text-white"
            />
          </div>

          {/* WhatsApp Phone */}
          <div>
            <label className="text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 block mb-1">
              WhatsApp Phone Number (+91)
            </label>
            <input
              type="tel"
              required
              placeholder="e.g. 9876543210"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              className="w-full rounded-xl bg-slate-50 dark:bg-slate-800 py-2 px-3 text-xs border-2 border-slate-950 focus:outline-none font-bold text-slate-900 dark:text-white"
            />
          </div>

          {/* Promo Code Input Box */}
          <div className="bg-slate-100 dark:bg-slate-850 p-3 rounded-2xl border-2 border-slate-950 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase text-slate-600 dark:text-slate-300 flex items-center gap-1">
                <Tag className="h-3 w-3 text-brand-600" /> Apply Coupon Code
              </span>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="PROMO CODE"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                className="flex-1 rounded-xl bg-white dark:bg-slate-800 py-1.5 px-3 text-xs border-2 border-slate-950 uppercase font-black tracking-wider text-slate-900 dark:text-white outline-none"
              />
              <button
                type="button"
                onClick={handleApplyPromo}
                className="bg-brand-500 hover:bg-brand-400 text-slate-950 text-xs font-black px-4 py-1.5 rounded-xl border-2 border-slate-950 shadow-flat-sm active:translate-y-0.5 transition"
              >
                Apply
              </button>
            </div>

            {promoError && (
              <p className="text-[9.5px] font-bold text-red-500">{promoError}</p>
            )}

            {appliedPromo && (
              <div className="flex items-center justify-between text-[10px] font-black text-emerald-600 dark:text-emerald-400 pt-1">
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" /> Coupon `{appliedPromo.code}` applied
                </span>
                <span>-{appliedPromo.discountPercent}%</span>
              </div>
            )}
          </div>

          {/* Price Breakdown */}
          <div className="space-y-1 pt-1 text-xs border-t border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-medium">
            <div className="flex justify-between">
              <span>Base Price</span>
              <span>₹{basePrice}</span>
            </div>
            {appliedPromo && (
              <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-bold">
                <span>Discount ({appliedPromo.code})</span>
                <span>-₹{discountAmount}</span>
              </div>
            )}
            <div className="flex justify-between font-black text-slate-900 dark:text-white pt-1 text-sm">
              <span>Total Payable</span>
              <span>₹{finalPrice}</span>
            </div>
          </div>

          {/* Pay Button linking to WhatsApp */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black py-3 rounded-2xl border-2 border-slate-950 shadow-flat-md flex items-center justify-center gap-2 active:translate-y-0.5 transition"
          >
            {loading ? 'Processing...' : (
              <>
                <MessageCircle className="h-4 w-4 fill-slate-950" />
                <span>Pay ₹{finalPrice} via WhatsApp</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>

          <p className="text-[9.5px] text-center text-slate-400 font-medium leading-tight">
            Clicking will launch WhatsApp sent directly to <strong className="text-slate-700 dark:text-slate-300">+91 7204351696</strong> with your order request details.
          </p>
        </form>
      </div>
    </div>
  );
}
