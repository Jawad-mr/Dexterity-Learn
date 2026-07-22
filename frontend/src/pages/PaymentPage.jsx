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
  const [step, setStep] = useState(1);

  const coffeePresets = [
    { label: 'Espresso', amount: 50, icon: '☕' },
    { label: 'Cappuccino', amount: 100, icon: '☕☕' },
    { label: 'Cold Brew', amount: 250, icon: '🧊☕' },
  ];

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

  const handleProceedToPayment = (e) => {
    e.preventDefault();
    setError('');

    if (!customerName.trim()) {
      setError('Please enter your full name');
      return;
    }
    if (!customerEmail.trim() || !customerEmail.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }
    if (!customerPhone || customerPhone.length < 10) {
      setError('Please provide a valid 10-digit WhatsApp phone number');
      return;
    }

    setStep(2);
  };

  const handleWhatsAppPayment = async (e) => {
    e.preventDefault();
    setError('');

    setLoading(true);

    try {
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
      const waNumber = '917204351696';
      const message = `*DEXTERITY LEARN — PAYMENT %26 ACCESS REQUEST*%0A` +
        `----------------------------------------%0A` +
        `*Order Ref:* ${orderData.invoiceNumber || 'INV-' + Date.now()}%0A` +
        `*Product:* ${productName}%0A` +
        `*Customer Name:* ${customerName}%0A` +
        `*Email:* ${customerEmail}%0A` +
        `*WhatsApp Phone:* %2B91 ${customerPhone}%0A` +
        `*Payable Amount:* ₹${finalPrice}%0A` +
        `----------------------------------------%0A` +
        `*Action:* Please check the attached payment transaction screenshot below and verify my access activation request.`;

      window.open(`https://wa.me/${waNumber}?text=${message}`, '_blank');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to initialize WhatsApp checkout order.');
    } finally {
      setLoading(false);
    }
  };

  const getIcon = () => {
    if (productType === 'coffee') return <Coffee className="h-5 w-5 text-amber-500" />;
    if (productType === 'book') return <BookOpen className="h-5 w-5 text-blue-500" />;
    return <Award className="h-5 w-5 text-purple-500" />;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4 pb-6 page-transition">
      <div className="bg-slate-50 dark:bg-slate-900 border-2 border-slate-950 dark:border-slate-800 rounded-3xl p-3 md:p-4 flex items-center justify-between shadow-flat-sm select-none gap-4">
        <div className="flex items-center gap-2.5 min-w-0">
          <button
            onClick={() => {
              if (step === 2) {
                setStep(1);
              } else {
                navigate(-1);
              }
            }}
            className="h-8 w-8 rounded-full border-2 border-slate-950 dark:border-slate-800 flex items-center justify-center bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>

          <div className="p-1.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-950 dark:border-slate-700 shrink-0">
            {getIcon()}
          </div>
          <div className="min-w-0">
            <span className="text-[8px] font-black uppercase text-slate-500 block leading-none">Checkout</span>
            <h1 className="text-xs md:text-sm font-black text-slate-955 dark:text-white truncate">{productName}</h1>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="hidden sm:flex items-center gap-1 text-[10px] font-black text-emerald-800 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700 px-2 py-0.5 rounded-full">
            <ShieldCheck className="h-3 w-3" /> Verified Checkout
          </div>

          <div className="flex items-baseline gap-1 bg-white dark:bg-slate-950 px-3 py-1 rounded-xl border-2 border-slate-950 dark:border-slate-800">
            <span className="text-[9px] font-black uppercase text-slate-500">Payable:</span>
            <span className="text-sm md:text-base font-black text-brand-600 dark:text-brand-400">₹{finalPrice}</span>
            {appliedPromo && (
              <span className="text-[10px] text-slate-400 line-through font-bold">₹{basePrice}</span>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center gap-4 py-1.5 select-none">
        <button
          onClick={() => setStep(1)}
          className="flex items-center gap-1.5 text-xs font-black focus:outline-none"
        >
          <span className={`h-6 w-6 rounded-full flex items-center justify-center border-2 border-slate-950 ${step === 1 ? 'bg-brand-400 text-slate-950' : 'bg-white dark:bg-slate-800 text-slate-400 dark:text-slate-600'}`}>1</span>
          <span className={step === 1 ? 'text-slate-900 dark:text-white' : 'text-slate-400'}>Billing Details</span>
        </button>
        <div className="h-0.5 w-12 bg-slate-350 dark:bg-slate-800" />
        <div className="flex items-center gap-1.5 text-xs font-black">
          <span className={`h-6 w-6 rounded-full flex items-center justify-center border-2 border-slate-950 ${step === 2 ? 'bg-brand-400 text-slate-950' : 'bg-white dark:bg-slate-800 text-slate-400 dark:text-slate-600'}`}>2</span>
          <span className={step === 2 ? 'text-slate-900 dark:text-white' : 'text-slate-400'}>Scan & Pay</span>
        </div>
      </div>

      {step === 1 && (
        <form onSubmit={handleProceedToPayment} className="max-w-xl mx-auto w-full bg-white dark:bg-slate-900 border-2 border-slate-950 dark:border-slate-800 rounded-3xl p-5 shadow-flat space-y-4">
          
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
            <div>
              <span className="text-[8.5px] font-black uppercase text-brand-600 dark:text-brand-400 tracking-wider block">Step 1 of 2</span>
              <h3 className="text-xs font-black text-slate-950 dark:text-white">Customer & Contribution Billing</h3>
            </div>
            <ShieldCheck className="h-4 w-4 text-brand-600 dark:text-brand-400" />
          </div>

          {error && (
            <div className="flex items-center gap-1.5 bg-red-50 dark:bg-red-950/40 border border-red-500/50 p-2 rounded-xl text-[10px] font-bold text-red-600 dark:text-red-400">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {productType === 'coffee' && (
            <div className="bg-amber-50/60 dark:bg-slate-800/40 border-2 border-slate-950 dark:border-slate-800 rounded-2xl p-3 space-y-2">
              <span className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-wider block">
                ☕ Coffee Contribution Amount
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                {coffeePresets.map((p) => (
                  <button
                    key={p.amount}
                    type="button"
                    onClick={() => setCoffeeAmount(p.amount)}
                    className={`py-1.5 px-3 rounded-xl border-2 text-center transition flex items-center justify-between ${
                      Number(coffeeAmount) === p.amount
                        ? 'bg-amber-300 dark:bg-amber-955 border-slate-950 text-slate-950 dark:text-amber-300 font-black shadow-flat-sm'
                        : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-bold'
                    }`}
                  >
                    <span className="text-xs">{p.icon}</span>
                    <span className="text-xs font-black">₹{p.amount}</span>
                  </button>
                ))}

                <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 border-2 border-slate-950 rounded-xl px-2 py-1">
                  <span className="text-xs font-black text-slate-400">₹</span>
                  <input
                    type="number"
                    min="10"
                    placeholder="Custom"
                    value={coffeeAmount}
                    onChange={(e) => setCoffeeAmount(e.target.value)}
                    className="w-full bg-transparent text-xs font-black text-slate-900 dark:text-white outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <label className="text-[9px] font-black uppercase text-slate-500 dark:text-slate-400 block mb-0.5">Full Name</label>
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
                <label className="text-[9px] font-black uppercase text-slate-500 dark:text-slate-400 block mb-0.5">Email Address</label>
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

            <div>
              <label className="text-[9px] font-black uppercase text-slate-500 dark:text-slate-400 block mb-0.5">WhatsApp Phone Number (+91)</label>
              <input
                type="tel"
                required
                placeholder="e.g. 7204351696"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="w-full rounded-lg bg-slate-50 dark:bg-slate-800 py-1.5 px-2.5 text-xs border-2 border-slate-950 font-bold text-slate-900 dark:text-white outline-none focus:bg-brand-50"
              />
            </div>

            <div className="bg-slate-100 dark:bg-slate-850 p-2.5 rounded-xl border-2 border-slate-950 space-y-1">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="COUPON CODE"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  className="flex-1 rounded-lg bg-white dark:bg-slate-900 py-1 px-2.5 text-xs border-2 border-slate-950 uppercase font-black tracking-wider text-slate-900 dark:text-white outline-none"
                />
                <button
                  type="button"
                  onClick={handleApplyPromo}
                  className="bg-brand-400 hover:bg-brand-300 text-slate-950 text-xs font-black px-3.5 py-1 rounded-lg border-2 border-slate-950 shadow-flat-sm active:translate-y-0.5 transition"
                >
                  Apply
                </button>
              </div>

              {promoError && <p className="text-[9px] font-bold text-red-500">{promoError}</p>}
              {appliedPromo && (
                <div className="flex items-center justify-between text-[10px] font-black text-emerald-600 dark:text-emerald-400">
                  <span className="flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Coupon Applied ({appliedPromo.code})</span>
                  <span>-{appliedPromo.discountPercent}%</span>
                </div>
              )}
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-brand-400 hover:bg-brand-300 text-slate-950 font-black py-2.5 rounded-xl border-2 border-slate-950 shadow-flat-sm flex items-center justify-center gap-2 text-xs md:text-sm active:translate-y-[1px] transition-all"
          >
            Proceed to Payment ➜
          </button>
        </form>
      )}

      {step === 2 && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-stretch">
          <div className="md:col-span-5 bg-white dark:bg-slate-900 border-2 border-slate-950 dark:border-slate-800 rounded-3xl p-4 shadow-flat flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
              <div className="flex items-center gap-1.5">
                <QrCode className="h-4 w-4 text-brand-600 dark:text-brand-400" />
                <h2 className="text-xs font-black tracking-wide text-slate-955 dark:text-white">Scan UPI QR Code</h2>
              </div>
              <span className="text-[8.5px] font-black bg-brand-100 text-brand-800 border border-brand-300 px-2 py-0.5 rounded-full uppercase">
                UPI / PhonePe
              </span>
            </div>

            <div className="text-center py-2 space-y-2">
              {/* Mobile direct UPI pay button (hidden on desktop) */}
              <div className="block sm:hidden my-2">
                <a
                  href={`upi://pay?pa=7204351696@ybl&pn=Dexterity%20Learn&am=${finalPrice}&cu=INR`}
                  className="w-full bg-brand-400 hover:bg-brand-300 text-slate-950 font-black py-2.5 rounded-xl border-2 border-slate-950 flex items-center justify-center gap-2 text-xs shadow-flat-sm active:translate-y-[1px] transition"
                >
                  <Smartphone className="h-4 w-4 text-slate-950 shrink-0" />
                  <span>Open UPI App to Pay ₹{finalPrice}</span>
                </a>
                <div className="flex items-center justify-center gap-2 my-3 select-none">
                  <div className="h-0.5 flex-1 bg-slate-200 dark:bg-slate-800" />
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Or Scan QR</span>
                  <div className="h-0.5 flex-1 bg-slate-200 dark:bg-slate-800" />
                </div>
              </div>

              <div className="inline-block bg-white p-2 rounded-2xl border-2 border-slate-950 shadow-flat-md">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(`upi://pay?pa=7204351696@ybl&pn=Dexterity%20Learn&am=${finalPrice}&cu=INR`)}`}
                  alt="UPI Payment QR Code"
                  onError={(e) => { e.currentTarget.src = '/payment-qr.png'; }}
                  className="w-36 h-36 object-contain rounded-lg mx-auto"
                />
              </div>
              <div className="space-y-0.5">
                <p className="text-[11px] font-black text-slate-900 dark:text-brand-400">Scan & Transfer ₹{finalPrice} to 7204351696</p>
                <p className="text-[9px] text-slate-500 font-bold">UPI ID: <span className="font-mono text-brand-600 dark:text-brand-400">7204351696@ybl</span></p>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-350 dark:border-slate-800 rounded-xl p-2.5 space-y-1">
              <h3 className="text-[9px] font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1">
                <Smartphone className="h-3.5 w-3.5 text-brand-600 dark:text-brand-400" /> 3-Step Verification
              </h3>
              <div className="grid grid-cols-3 gap-1 text-[8.5px] text-center">
                <div className="bg-white dark:bg-slate-900 p-1 rounded-lg border border-slate-200 dark:border-slate-700">
                  <span className="font-black text-brand-600 dark:text-brand-400 block">1. Scan</span>
                  <span className="text-slate-500 block">Pay ₹{finalPrice}</span>
                </div>
                <div className="bg-white dark:bg-slate-900 p-1 rounded-lg border border-slate-200 dark:border-slate-700">
                  <span className="font-black text-brand-600 dark:text-brand-400 block">2. Capture</span>
                  <span className="text-slate-500 block">Screenshot</span>
                </div>
                <div className="bg-white dark:bg-slate-900 p-1 rounded-lg border border-slate-200 dark:border-slate-700">
                  <span className="font-black text-brand-600 dark:text-brand-400 block">3. WhatsApp</span>
                  <span className="text-slate-500 block">Send Receipt</span>
                </div>
              </div>
            </div>
          </div>

          <div className="md:col-span-7 bg-white dark:bg-slate-900 border-2 border-slate-950 dark:border-slate-800 rounded-3xl p-5 shadow-flat flex flex-col justify-between space-y-4">
            
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
              <div>
                <span className="text-[8.5px] font-black uppercase text-brand-600 dark:text-brand-400 tracking-wider block">Step 2 of 2</span>
                <h3 className="text-xs font-black text-slate-950 dark:text-white">Screenshot Submission</h3>
              </div>
              <ShieldCheck className="h-4 w-4 text-brand-600 dark:text-brand-400" />
            </div>

            {error && (
              <div className="flex items-center gap-1.5 bg-red-50 dark:bg-red-950/40 border border-red-500/50 p-2 rounded-xl text-[10px] font-bold text-red-600 dark:text-red-400">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-2 text-xs bg-slate-50 dark:bg-slate-800/40 p-3 rounded-2xl border-2 border-slate-950 dark:border-slate-800">
              <div className="flex justify-between">
                <span className="text-slate-450">Customer Name:</span>
                <span className="font-black text-slate-800 dark:text-slate-200">{customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-450">Email Address:</span>
                <span className="font-black text-slate-800 dark:text-slate-200 truncate max-w-[180px]">{customerEmail}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-450">WhatsApp Phone:</span>
                <span className="font-black text-slate-800 dark:text-slate-200">+91 {customerPhone}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-200 dark:border-slate-800">
                <span className="font-bold text-slate-900 dark:text-white">Total Payable Amount:</span>
                <span className="font-black text-brand-600 dark:text-brand-400">₹{finalPrice}</span>
              </div>
            </div>

            <div className="space-y-2.5">
              <button
                onClick={handleWhatsAppPayment}
                disabled={loading}
                className="w-full bg-brand-400 hover:bg-brand-300 text-slate-950 font-black py-3 px-4 rounded-xl border-2 border-slate-950 shadow-flat-sm flex items-center justify-center gap-2 text-xs md:text-sm active:translate-y-[1px] active:shadow-none transition-all"
              >
                {loading ? 'Logging Order...' : (
                  <>
                    <MessageCircle className="h-4 w-4 fill-slate-950 shrink-0" />
                    <span>Send Screenshot & Submit via WhatsApp</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-full bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-950 dark:text-white text-xs font-black py-2 rounded-xl border-2 border-slate-950 dark:border-slate-800 shadow-flat-sm transition active:translate-y-[1px]"
              >
                ← Back to Billing Details
              </button>

              <p className="text-[9px] text-center text-slate-450 dark:text-slate-500 font-bold leading-tight">
                This triggers WhatsApp to submit your order and verify your screenshot.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
