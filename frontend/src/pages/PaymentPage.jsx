import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ShieldCheck, Tag, CheckCircle2, MessageCircle, AlertCircle, ArrowLeft, Award, Coffee, BookOpen, QrCode, Smartphone } from 'lucide-react';
import { useAuth, api } from '../context/AuthContext';
import useSEO from '../hooks/useSEO';

export default function PaymentPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const productType = searchParams.get('type') || 'certificate';
  const productId = searchParams.get('productId') || null;
  const productName = searchParams.get('name') || (productType === 'certificate' ? 'Verified Course Certificate' : productType === 'coffee' ? 'Buy Me a Coffee Support' : 'Tech Ebook Guide');
  
  const initialPrice = Number(searchParams.get('price')) || (productType === 'coffee' ? 100 : 499);

  // Dynamic Coffee Amount state (for type === 'coffee')
  const [coffeeAmount, setCoffeeAmount] = useState(initialPrice);

  const basePrice = productType === 'coffee' ? (Number(coffeeAmount) || 10) : initialPrice;

  useSEO(`Payment & Checkout - ${productName}`, 'Secure WhatsApp & PhonePe UPI payment gateway for Dexterity Learn certificates and books.');

  const [customerName, setCustomerName] = useState(user?.username || '');
  const [customerEmail, setCustomerEmail] = useState(user?.email || '');
  const [customerPhone, setCustomerPhone] = useState('');

  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState(null); // { code, discountPercent }
  const [promoError, setPromoError] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const coffeePresets = [
    { label: 'Espresso', amount: 50, icon: '☕' },
    { label: 'Cappuccino', amount: 100, icon: '☕☕' },
    { label: 'Cold Brew', amount: 250, icon: '🧊☕' },
  ];

  // Handle Promo Code application
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
      setPromoError('Invalid coupon code.');
    }
  };

  const discountPercent = appliedPromo ? appliedPromo.discountPercent : 0;
  const discountAmount = Math.round((basePrice * discountPercent) / 100);
  const finalPrice = Math.max(0, basePrice - discountAmount);

  // Submit payment order to backend and redirect to WhatsApp
  const handleWhatsAppPayment = async (e) => {
    e.preventDefault();
    setError('');

    if (!customerPhone || customerPhone.length < 10) {
      setError('Please provide a valid 10-digit WhatsApp phone number');
      return;
    }

    setLoading(true);

    try {
      // 1. Log payment order in backend database
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

      // 2. Build pre-filled WhatsApp deep link instructing screenshot attachment
      const waNumber = '917204351696';
      const message = `*DEXTERITY LEARN — PAYMENT %26 ACCESS REQUEST*%0A` +
        `----------------------------------------%0A` +
        `*Order Ref:* ${orderData.invoiceNumber || 'INV-' + Date.now()}%0A` +
        `*Product:* ${productName}%0A` +
        `*Customer Name:* ${customerName}%0A` +
        `*Email:* ${customerEmail}%0A` +
        `*Phone:* ${customerPhone}%0A` +
        `----------------------------------------%0A` +
        `*Original Price:* ₹${basePrice}%0A` +
        (appliedPromo ? `*Promo Code Applied:* ${appliedPromo.code} (${appliedPromo.discountPercent}% OFF)%0A` : '') +
        `*Final Amount Payable:* ₹${finalPrice}%0A` +
        `----------------------------------------%0A` +
        `Hello Admin! I have completed the payment via PhonePe QR Code. Please find my payment screenshot attached for verification %26 access activation.`;

      const waUrl = `https://wa.me/${waNumber}?text=${message}`;

      setLoading(false);

      // Launch WhatsApp chat in new tab
      window.open(waUrl, '_blank');
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || 'Failed to initialize WhatsApp payment order.');
    }
  };

  const getIcon = () => {
    if (productType === 'certificate') return <Award className="h-4 w-4 text-slate-950 dark:text-brand-400" />;
    if (productType === 'coffee') return <Coffee className="h-4 w-4 text-slate-950 dark:text-brand-400" />;
    return <BookOpen className="h-4 w-4 text-slate-950 dark:text-brand-400" />;
  };

  return (
    <div className="max-w-5xl mx-auto space-y-3 pb-24 md:pb-4 px-2 md:px-3 page-transition select-none">
      
      {/* Compact Single-Bar Hero Header */}
      <div className="bg-gradient-to-r from-brand-100 via-brand-50 to-brand-100 dark:from-slate-900 dark:to-slate-850 text-slate-900 dark:text-white border-2 border-slate-950 dark:border-slate-800 rounded-2xl py-2 px-3.5 shadow-flat-sm flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <button
            onClick={() => navigate(-1)}
            className="p-1 text-slate-600 hover:text-slate-950 dark:text-slate-400 dark:hover:text-white transition shrink-0"
            title="Return to Learning"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div className="p-1.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-950 dark:border-slate-700 shrink-0">
            {getIcon()}
          </div>
          <div className="min-w-0">
            <span className="text-[8px] font-black uppercase text-slate-500 block leading-none">Checkout</span>
            <h1 className="text-xs md:text-sm font-black text-slate-950 dark:text-white truncate">{productName}</h1>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="hidden sm:flex items-center gap-1 text-[10px] font-black text-emerald-800 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700 px-2 py-0.5 rounded-full">
            <ShieldCheck className="h-3 w-3" /> PhonePe & WhatsApp Verified
          </div>

          <div className="flex items-baseline gap-1 bg-white dark:bg-slate-950 px-3 py-1 rounded-xl border-2 border-slate-950 dark:border-slate-800">
            <span className="text-[9px] font-black uppercase text-slate-500">Payable:</span>
            <span className="text-base font-black text-brand-600 dark:text-brand-400">₹{finalPrice}</span>
            {appliedPromo && (
              <span className="text-[10px] text-slate-400 line-through font-bold">₹{basePrice}</span>
            )}
          </div>
        </div>
      </div>

      {/* Dynamic Coffee Amount Picker Card (Only shown when productType === 'coffee') */}
      {productType === 'coffee' && (
        <div className="bg-amber-50 dark:bg-slate-900 border-2 border-slate-950 dark:border-slate-800 rounded-2xl p-3 shadow-flat-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
              ☕ Choose Coffee Contribution Amount
            </span>
            <span className="text-[10px] font-bold text-slate-500">Pick a preset or enter any amount</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
            {coffeePresets.map((p) => (
              <button
                key={p.amount}
                type="button"
                onClick={() => setCoffeeAmount(p.amount)}
                className={`py-1.5 px-3 rounded-xl border-2 text-center transition flex items-center justify-between ${
                  Number(coffeeAmount) === p.amount
                    ? 'bg-amber-300 dark:bg-amber-950/60 border-slate-950 text-slate-950 dark:text-amber-300 font-black shadow-flat-sm'
                    : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold'
                }`}
              >
                <span className="text-xs">{p.icon} {p.label}</span>
                <span className="text-xs font-black">₹{p.amount}</span>
              </button>
            ))}

            {/* Custom Amount Input */}
            <div className="flex items-center gap-1.5 bg-white dark:bg-slate-800 border-2 border-slate-950 rounded-xl px-2.5 py-1">
              <span className="text-xs font-black text-slate-400">₹</span>
              <input
                type="number"
                min="10"
                placeholder="Enter Amount"
                value={coffeeAmount}
                onChange={(e) => setCoffeeAmount(e.target.value)}
                className="w-full bg-transparent text-xs font-black text-slate-900 dark:text-white outline-none"
              />
            </div>
          </div>
        </div>
      )}

      {/* Main Compact 2-Column Responsive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-stretch">
        
        {/* LEFT COLUMN (5 COLS): PhonePe QR Code & 3-Step Guide */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 border-2 border-slate-950 dark:border-slate-800 rounded-2xl p-3.5 shadow-flat flex flex-col justify-between space-y-2.5">
          
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
            <div className="flex items-center gap-1.5">
              <QrCode className="h-4 w-4 text-brand-600 dark:text-brand-400" />
              <h2 className="text-xs font-black tracking-wide text-slate-950 dark:text-white">Scan UPI QR Code</h2>
            </div>
            <span className="text-[8.5px] font-black bg-brand-100 text-brand-800 border border-brand-300 px-2 py-0.5 rounded-full uppercase">
              PhonePe / GPay / Paytm
            </span>
          </div>

          {/* QR Code Image Container — Dynamic UPI QR for 7204351696 */}
          <div className="text-center space-y-1.5 py-0.5">
            <div className="inline-block bg-white p-2 rounded-2xl border-2 border-slate-950 shadow-flat-md">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(`upi://pay?pa=7204351696@ybl&pn=Dexterity%20Learn&am=${finalPrice}&cu=INR`)}`}
                alt="UPI Payment QR Code for 7204351696"
                onError={(e) => { e.currentTarget.src = '/payment-qr.png'; }}
                className="w-36 h-36 md:w-40 md:h-40 object-contain rounded-lg"
              />
            </div>

            <div className="space-y-0.5">
              <p className="text-[11px] font-black text-slate-900 dark:text-brand-400">Scan & Transfer ₹{finalPrice} to 7204351696</p>
              <p className="text-[9px] text-slate-500 font-bold">UPI ID: <span className="font-mono text-brand-600 dark:text-brand-400">7204351696@ybl</span></p>
            </div>
          </div>

          {/* 3-Step Verification Guide */}
          <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-300 dark:border-slate-800 rounded-xl p-2.5 space-y-1.5">
            <h3 className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1">
              <Smartphone className="h-3.5 w-3.5 text-brand-600 dark:text-brand-400" /> 3-Step Payment & Activation
            </h3>

            <div className="grid grid-cols-3 gap-1.5 text-[9px] text-center">
              <div className="bg-white dark:bg-slate-900 p-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
                <span className="font-black text-brand-600 dark:text-brand-400 block">1. Scan</span>
                <span className="text-slate-500 font-medium leading-none block mt-0.5">Pay ₹{finalPrice}</span>
              </div>

              <div className="bg-white dark:bg-slate-900 p-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
                <span className="font-black text-brand-600 dark:text-brand-400 block">2. Screenshot</span>
                <span className="text-slate-500 font-medium leading-none block mt-0.5">Save receipt</span>
              </div>

              <div className="bg-white dark:bg-slate-900 p-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
                <span className="font-black text-brand-600 dark:text-brand-400 block">3. WhatsApp</span>
                <span className="text-slate-500 font-medium leading-none block mt-0.5">Send screenshot</span>
              </div>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN (7 COLS): Billing Form, Clean Promo Code, Price Summary & Submit Button */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 border-2 border-slate-950 dark:border-slate-800 rounded-2xl p-3.5 shadow-flat flex flex-col justify-between space-y-2.5">
          
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
            <div>
              <span className="text-[8.5px] font-black uppercase text-brand-600 dark:text-brand-400 tracking-wider block">Customer Details</span>
              <h3 className="text-xs font-black text-slate-950 dark:text-white">Billing & Verification</h3>
            </div>
            <ShieldCheck className="h-4 w-4 text-brand-600 dark:text-brand-400" />
          </div>

          <form onSubmit={handleWhatsAppPayment} className="space-y-2.5">
            
            {error && (
              <div className="flex items-center gap-1.5 bg-red-50 dark:bg-red-950/40 border border-red-500/50 p-2 rounded-xl text-[10px] font-bold text-red-600 dark:text-red-400">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Customer Inputs Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <label className="text-[9px] font-black uppercase text-slate-500 dark:text-slate-400 block mb-0.5">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Arjun Sharma"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full rounded-lg bg-slate-50 dark:bg-slate-800 py-1.5 px-2.5 text-xs border-2 border-slate-950 font-bold text-slate-900 dark:text-white outline-none focus:bg-brand-50"
                />
              </div>

              <div>
                <label className="text-[9px] font-black uppercase text-slate-500 dark:text-slate-400 block mb-0.5">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="you@example.com"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className="w-full rounded-lg bg-slate-50 dark:bg-slate-800 py-1.5 px-2.5 text-xs border-2 border-slate-950 font-bold text-slate-900 dark:text-white outline-none focus:bg-brand-50"
                />
              </div>
            </div>

            {/* WhatsApp Phone */}
            <div>
              <label className="text-[9px] font-black uppercase text-slate-500 dark:text-slate-400 block mb-0.5">
                WhatsApp Phone Number (+91)
              </label>
              <input
                type="tel"
                required
                placeholder="e.g. 7204351696"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="w-full rounded-lg bg-slate-50 dark:bg-slate-800 py-1.5 px-2.5 text-xs border-2 border-slate-950 font-bold text-slate-900 dark:text-white outline-none focus:bg-brand-50"
              />
            </div>

            {/* Clean Promo Code Box */}
            <div className="bg-slate-100 dark:bg-slate-850 p-2 rounded-xl border-2 border-slate-950 space-y-1">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="COUPON CODE"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  className="flex-1 rounded-lg bg-white dark:bg-slate-800 py-1 px-2.5 text-xs border-2 border-slate-950 uppercase font-black tracking-wider text-slate-900 dark:text-white outline-none"
                />
                <button
                  type="button"
                  onClick={handleApplyPromo}
                  className="bg-brand-400 hover:bg-brand-300 text-slate-950 text-xs font-black px-3 py-1 rounded-lg border-2 border-slate-950 shadow-flat-sm active:translate-y-0.5 transition"
                >
                  Apply
                </button>
              </div>

              {promoError && (
                <p className="text-[9px] font-bold text-red-500">{promoError}</p>
              )}

              {appliedPromo && (
                <div className="flex items-center justify-between text-[10px] font-black text-emerald-600 dark:text-emerald-400">
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" /> Coupon Applied ({appliedPromo.code})
                  </span>
                  <span>-{appliedPromo.discountPercent}%</span>
                </div>
              )}
            </div>

            {/* Price Breakdown */}
            <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100 dark:border-slate-800 font-bold text-slate-700 dark:text-slate-300">
              <span>Total Payable Amount</span>
              <span className="text-sm font-black text-brand-600 dark:text-brand-400">₹{finalPrice}</span>
            </div>

            {/* Submit via WhatsApp Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-400 hover:bg-brand-300 text-slate-950 font-black py-2.5 px-4 rounded-xl border-2 border-slate-950 shadow-flat-sm flex items-center justify-center gap-2 text-xs md:text-sm active:translate-y-[1px] active:shadow-none transition-all"
            >
              {loading ? 'Logging Order...' : (
                <>
                  <MessageCircle className="h-4 w-4 fill-slate-950 shrink-0" />
                  <span>Send Screenshot & Submit via WhatsApp</span>
                </>
              )}
            </button>

            <p className="text-[9px] text-center text-slate-500 dark:text-slate-400 font-bold leading-tight">
              Opens WhatsApp (+91 7204351696). Attach your payment screenshot in chat.
            </p>

          </form>

        </div>

      </div>

    </div>
  );
}
