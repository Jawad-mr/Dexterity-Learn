import express from 'express';
import { createOrder, verifyPayment, getPaymentHistory, verifyCertificate } from '../controllers/paymentController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public certificate validation
router.get('/verify-certificate/:certId', verifyCertificate);

router.use(protect); // All routes below require authentication

router.post('/create-order', createOrder);
router.post('/verify', verifyPayment);
router.get('/history', getPaymentHistory);

export default router;
