import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import Order, { IOrder } from '../models/orderModel';
import { ValidationError, NotFoundError } from '../utils/errors';
import mongoose from 'mongoose';

// Get order history for a user
export const getOrderHistory = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      throw new ValidationError('User ID is required');
    }

    // Get page and limit from query parameters
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    // Get total count for pagination
    const totalOrders = await Order.countDocuments({ userId });

    // Get orders with pagination
    const orders = await Order.find({ userId })
      .sort({ orderDate: -1 }) // Most recent first
      .skip(skip)
      .limit(limit)
      .lean();

    res.status(200).json({
      success: true,
      orders,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalOrders / limit),
        totalOrders,
        hasMore: skip + orders.length < totalOrders
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : 'Error fetching order history'
    });
  }
};

// Get single order details
export const getOrderDetails = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { orderId } = req.params;
    const userId = req.user?._id;

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      throw new ValidationError('Invalid order ID');
    }

    const order = await Order.findOne({
      _id: orderId,
      userId
    }).lean();

    if (!order) {
      throw new NotFoundError('Order not found');
    }

    res.status(200).json({
      success: true,
      order
    });
  } catch (error) {
    res.status(error instanceof NotFoundError ? 404 : 400).json({
      success: false,
      message: error instanceof Error ? error.message : 'Error fetching order details'
    });
  }
};

// Create new order
export const createOrder = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      throw new ValidationError('User ID is required');
    }

    const orderData = {
      ...req.body,
      userId,
      orderDate: new Date(),
      status: 'pending',
      paymentStatus: 'pending'
    };

    // Validate required fields
    if (!orderData.items || !orderData.items.length) {
      throw new ValidationError('Order must contain at least one item');
    }

    if (!orderData.shippingAddress) {
      throw new ValidationError('Shipping address is required');
    }

    // Calculate total amount
    orderData.totalAmount = orderData.items.reduce(
      (total: number, item: any) => total + (item.price * item.quantity),
      0
    );

    const order = await Order.create(orderData);

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      order
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : 'Error creating order'
    });
  }
};

// Update order status
export const updateOrderStatus = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { orderId } = req.params;
    const { status, designerNotes } = req.body;
    const userId = req.user?._id;

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      throw new ValidationError('Invalid order ID');
    }

    const order = await Order.findOneAndUpdate(
      { _id: orderId, userId },
      { 
        status,
        designerNotes,
        ...(status === 'completed' ? { actualDeliveryDate: new Date() } : {})
      },
      { new: true }
    );

    if (!order) {
      throw new NotFoundError('Order not found');
    }

    res.status(200).json({
      success: true,
      message: 'Order status updated successfully',
      order
    });
  } catch (error) {
    res.status(error instanceof NotFoundError ? 404 : 400).json({
      success: false,
      message: error instanceof Error ? error.message : 'Error updating order status'
    });
  }
};

// Cancel order
export const cancelOrder = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { orderId } = req.params;
    const { cancelReason } = req.body;
    const userId = req.user?._id;

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      throw new ValidationError('Invalid order ID');
    }

    const order = await Order.findOne({ _id: orderId, userId });

    if (!order) {
      throw new NotFoundError('Order not found');
    }

    // Only allow cancellation of pending or processing orders
    if (!['pending', 'processing'].includes(order.status)) {
      throw new ValidationError('Cannot cancel order in current status');
    }

    order.status = 'cancelled';
    order.customerNotes = cancelReason;
    await order.save();

    res.status(200).json({
      success: true,
      message: 'Order cancelled successfully',
      order
    });
  } catch (error) {
    res.status(error instanceof NotFoundError ? 404 : 400).json({
      success: false,
      message: error instanceof Error ? error.message : 'Error cancelling order'
    });
  }
}; 