import { Router } from 'express';
import { register, login, forgotPassword, verifyOTPAndResetPassword } from '../controllers/authController';

const router = Router();

// Auth routes
router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', verifyOTPAndResetPassword);

export default router;
