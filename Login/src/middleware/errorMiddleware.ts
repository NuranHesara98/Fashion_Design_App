import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';
import mongoose from 'mongoose';
import multer from 'multer';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';

interface ErrorResponse {
  success: boolean;
  message: string;
  stack?: string;
  errors?: any;
}

interface MongoError extends Error {
  code?: number;
  errmsg?: string;
}

const handleCastErrorDB = (err: mongoose.Error.CastError) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err: MongoError) => {
  const value = err.errmsg?.match(/(["'])(\\?.)*?\1/)?.[0] || '';
  const message = `Duplicate field value: ${value}. Please use another value!`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = (err: mongoose.Error.ValidationError) => {
  const errors = Object.values(err.errors).map(el => el.message);
  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

const handleJWTError = () => {
  return new AppError('Invalid token. Please log in again!', 401);
};

const handleJWTExpiredError = () => {
  return new AppError('Your token has expired! Please log in again.', 401);
};

const handleMulterError = (err: multer.MulterError) => {
  let message = 'File upload error';
  
  switch (err.code) {
    case 'LIMIT_FILE_SIZE':
      message = 'File too large. Maximum size is 5MB';
      break;
    case 'LIMIT_UNEXPECTED_FILE':
      message = 'Unexpected field name for file upload';
      break;
    default:
      message = err.message;
  }
  
  return new AppError(message, 400);
};

const sendErrorDev = (err: AppError, res: Response<ErrorResponse>) => {
  res.status(err.statusCode).json({
    success: false,
    message: err.message,
    stack: err.stack,
    errors: err
  });
};

const sendErrorProd = (err: AppError, res: Response<ErrorResponse>) => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message
    });
  } 
  // Programming or other unknown error: don't leak error details
  else {
    // Log error
    console.error('ERROR 💥', err);

    // Send generic message
    res.status(500).json({
      success: false,
      message: 'Something went very wrong!'
    });
  }
};

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response<ErrorResponse>,
  next: NextFunction
) => {
  let error = err instanceof AppError ? err : new AppError(err.message, 500);
  error.statusCode = error.statusCode || 500;
  error.status = error.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(error, res);
  } else {
    if (err instanceof mongoose.Error.CastError) error = handleCastErrorDB(err);
    if (err instanceof mongoose.Error.ValidationError) error = handleValidationErrorDB(err);
    if (err instanceof multer.MulterError) error = handleMulterError(err);
    if (err instanceof JsonWebTokenError) error = handleJWTError();
    if (err instanceof TokenExpiredError) error = handleJWTExpiredError();
    if ((err as MongoError).code === 11000) error = handleDuplicateFieldsDB(err as MongoError);

    sendErrorProd(error, res);
  }
};
