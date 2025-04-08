import express from 'express';
import { protect } from '../middleware/authMiddleware';
import {
  getOrderHistory,
  getOrderDetails,
  createOrder,
  updateOrderStatus,
  cancelOrder
} from '../controllers/orderController';

const router = express.Router();

// Protected routes
router.get('/history', protect, getOrderHistory);
router.get('/:orderId', protect, getOrderDetails);
router.post('/', protect, createOrder);
router.put('/:orderId/status', protect, updateOrderStatus);
router.put('/:orderId/cancel', protect, cancelOrder);

export default router; 