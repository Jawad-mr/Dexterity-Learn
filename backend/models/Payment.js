import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    productType: {
      type: String,
      enum: ['certificate', 'book', 'coffee'],
      required: true,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      required: false,
    },
    amount: {
      type: Number,
      required: true,
    },
    originalAmount: {
      type: Number,
      default: 0,
    },
    promoCode: {
      type: String,
      default: '',
    },
    customerName: String,
    customerEmail: String,
    customerPhone: String,
    currency: {
      type: String,
      default: 'INR',
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending',
    },
    transactionId: {
      type: String,
      default: '',
    },
    invoiceNumber: {
      type: String,
      unique: true,
      sparse: true,
    },
    receiptUrl: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

const Payment = mongoose.model('Payment', paymentSchema);
export default Payment;
