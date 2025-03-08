import { Request, Response, NextFunction } from 'express';
import { AppError, ValidationError, NotFoundError, AuthenticationError, FileUploadError } from '../utils/errors';
import mongoose from 'mongoose';
import multer from 'multer';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';

interface ErrorResponse {
  success: boolean;
  message: string;
  errors?: any;
  stack?: string;
  code?: string;
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
  let code = 'FILE_UPLOAD_ERROR';
  
  switch (err.code) {
    case 'LIMIT_FILE_SIZE':
      message = 'File too large. Maximum size is 5MB';
      code = 'FILE_TOO_LARGE';
      break;
    case 'LIMIT_UNEXPECTED_FILE':
      message = 'Unexpected field name for file upload';
      code = 'INVALID_FIELD_NAME';
      break;
    default:
      message = err.message;
  }
  
  return new AppError(message, 400, code);
};

const handleCustomError = (err: Error) => {
  if (err instanceof ValidationError) {
    return new AppError(err.message, 400, 'VALIDATION_ERROR');
  }
  if (err instanceof NotFoundError) {
    return new AppError(err.message, 404, 'NOT_FOUND');
  }
  if (err instanceof AuthenticationError) {
    return new AppError(err.message, 401, 'AUTHENTICATION_ERROR');
  }
  if (err instanceof FileUploadError) {
    return new AppError(err.message, 400, 'FILE_UPLOAD_ERROR');
  }
  return new AppError(err.message, 500);
};

const sendErrorDev = (err: AppError, res: Response<ErrorResponse>) => {
  res.status(err.statusCode).json({
    success: false,
    message: err.message,
    code: err.code,
    stack: err.stack,
    errors: err
  });
};

const sendErrorProd = (err: AppError, res: Response<ErrorResponse>) => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    const response: ErrorResponse = {
      success: false,
      message: err.message
    };
    
    // Add error code if available
    if (err.code) {
      response.code = err.code;
    }
    
    res.status(err.statusCode).json(response);
  } 
  // Programming or other unknown error: don't leak error details
  else {
    // Log error
    console.error('ERROR 💥', err);

    // Send generic message
    res.status(500).json({
      success: false,
      message: 'Something went wrong!',
      code: 'INTERNAL_SERVER_ERROR'
    });
  }
};

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response<ErrorResponse>,
  next: NextFunction
) => {
  let error = err instanceof AppError ? err : handleCustomError(err);
  error.statusCode = error.statusCode || 500;
  error.status = error.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(error, res);
  } else {
    let processedError = error;
    
    if (err instanceof mongoose.Error.CastError) processedError = handleCastErrorDB(err);
    if (err instanceof mongoose.Error.ValidationError) processedError = handleValidationErrorDB(err);
    if (err instanceof multer.MulterError) processedError = handleMulterError(err);
    if (err instanceof JsonWebTokenError) processedError = handleJWTError();
    if (err instanceof TokenExpiredError) processedError = handleJWTExpiredError();
    if ((err as MongoError).code === 11000) processedError = handleDuplicateFieldsDB(err as MongoError);
    
    sendErrorProd(processedError, res);
  }
};
