import express, { Router } from 'express';

const router: Router = express.Router();

// Define routes
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'API is running' });
});

export default router;
