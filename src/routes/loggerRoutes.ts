import express from 'express';
import { Request, Response } from 'express';

const router = express.Router();

/**
 * @route   POST /api/logger/data
 * @desc    Log received data and return confirmation
 * @access  Public
 */
router.post('/data', (req: Request, res: Response) => {
  // Log the received data
  console.log('Received data:', JSON.stringify(req.body, null, 2));
  
  // Log request headers for debugging
  console.log('Request headers:', req.headers);
  
  // Return success response
  res.status(200).json({ 
    success: true, 
    message: 'Data received and logged successfully',
    timestamp: new Date().toISOString(),
    receivedData: req.body
  });
});

/**
 * @route   POST /api/logger/event
 * @desc    Log specific events with categorization
 * @access  Public
 */
router.post('/event', (req: Request, res: Response) => {
  const { eventType, eventData } = req.body;
  
  // Log the event with type
  console.log(`[EVENT: ${eventType}]`, JSON.stringify(eventData, null, 2));
  
  // Return success response
  res.status(200).json({ 
    success: true, 
    message: `Event of type '${eventType}' logged successfully`,
    timestamp: new Date().toISOString()
  });
});

export default router;
