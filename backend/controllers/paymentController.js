import Payment from '../models/Payment.js';
import User from '../models/User.js';
import Book from '../models/Book.js';
import Course from '../models/Course.js';
import Certificate from '../models/Certificate.js';
import crypto from 'crypto';

// @desc    Create a payment transaction (Razorpay/Stripe Ready)
// @route   POST /api/payments/create-order
// @access  Private
export const createOrder = async (req, res, next) => {
  const { productType, productId, amount: reqAmount, originalAmount, promoCode, customerName, customerEmail, customerPhone } = req.body;
  const userId = req.user._id;

  try {
    let amount = reqAmount || 0;
    let name = '';

    if (productType === 'book') {
      const book = await Book.findById(productId);
      if (!book) {
        res.status(404);
        return next(new Error('Book not found'));
      }
      name = book.title;
    } else if (productType === 'certificate') {
      if (productId) {
        const course = await Course.findById(productId);
        if (course) {
          name = `${course.title} Certificate`;
        } else {
          name = 'Verified Certificate';
        }
      } else {
        name = 'Verified Certificate';
      }
    } else if (productType === 'coffee') {
      name = 'Buy Me a Coffee Support';
    } else {
      res.status(400);
      return next(new Error('Invalid product type'));
    }

    // Generate unique invoice number
    const invoiceNumber = `INV-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;

    // Create pending payment in DB
    const payment = await Payment.create({
      userId,
      productType,
      productId: productId || undefined,
      amount: amount >= 0 ? amount : 0,
      originalAmount: originalAmount || amount,
      promoCode: promoCode || '',
      customerName: customerName || req.user.username,
      customerEmail: customerEmail || req.user.email,
      customerPhone: customerPhone || '',
      currency: 'INR',
      status: 'pending',
      invoiceNumber,
    });

    /* 
      =========================================================
      PRODUCTION RAZORPAY / STRIPE GATEWAY PLUG-IN SPOT:
      =========================================================
      const razorpayOrder = await razorpay.orders.create({
        amount: amount * 100, // paise
        currency: "INR",
        receipt: payment._id.toString()
      });
      // Return orderId along with payment metadata.
    */

    res.json({
      success: true,
      order: {
        paymentId: payment._id,
        invoiceNumber: payment.invoiceNumber,
        amount: payment.amount,
        currency: payment.currency,
        productName: name,
        gatewayOrderId: `order_mock_${crypto.randomBytes(8).toString('hex')}`,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify payment success (Webhook or Callback validation)
// @route   POST /api/payments/verify
// @access  Private
export const verifyPayment = async (req, res, next) => {
  const { paymentId, gatewayTransactionId, status } = req.body;
  const userId = req.user._id;

  try {
    const payment = await Payment.findById(paymentId);
    if (!payment) {
      res.status(404);
      return next(new Error('Payment log record not found.'));
    }

    if (payment.status === 'completed') {
      return res.json({
        success: true,
        message: 'Payment was already processed.',
        payment,
      });
    }

    if (status === 'success') {
      payment.status = 'completed';
      payment.transactionId = gatewayTransactionId || `tx_${crypto.randomBytes(12).toString('hex')}`;
      payment.receiptUrl = `https://dexteritylearn.com/receipts/${payment.invoiceNumber}.pdf`;
      await payment.save();

      // Process unlocks
      const user = await User.findById(userId);

      if (payment.productType === 'book') {
        // Unlock E-book
        if (!user.unlockedBooks.includes(payment.productId)) {
          user.unlockedBooks.push(payment.productId);
          user.progress.xp += 50; // Purchase reward XP
          await user.save();
        }
      } else if (payment.productType === 'certificate') {
        // Find certificate and unlock
        const cert = await Certificate.findOne({ userId, courseId: payment.productId });
        if (cert) {
          cert.isPaid = true;
          cert.issuedAt = Date.now();
          await cert.save();
        }
        user.progress.xp += 100;
        await user.save();
      }

      res.json({
        success: true,
        message: 'Payment captured and product unlocked!',
        payment,
      });
    } else {
      payment.status = 'failed';
      await payment.save();
      res.status(400).json({
        success: false,
        message: 'Payment verification reported failure.',
        payment,
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get user payment history
// @route   GET /api/payments/history
// @access  Private
export const getPaymentHistory = async (req, res, next) => {
  try {
    const payments = await Payment.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, payments });
  } catch (error) {
    next(error);
  }
};
