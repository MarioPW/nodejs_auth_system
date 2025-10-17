// src/middleware/loggingMiddleware.ts
import { Request, Response, NextFunction } from 'express';
import { Logger } from '../Utils/logger';

// Extend the Request interface to add startTime
interface RequestWithTiming extends Request {
  startTime?: number;
}

// Main logging middleware
export const loggingMiddleware = (req: RequestWithTiming, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  req.startTime = startTime;

  // Capture request information
  const { method, url, ip } = req;
  const userAgent = req.get('user-agent') || '';
  
  // Log the incoming request
  Logger.http(`Incoming request: ${method} ${url}`, {
    method,
    url,
    ip,
    userAgent,
    timestamp: new Date().toISOString(),
  });

  // Intercept the response
  const originalSend = res.send;
  res.send = function(body) {
    const duration = Date.now() - startTime;
    const { statusCode } = res;
    
    // Determine the log level based on the status code
    const logLevel = statusCode >= 400 ? 'error' : statusCode >= 300 ? 'warn' : 'http';
    
    // Log the response
    const message = `${method} ${url} - ${statusCode} - ${duration}ms`;
    
    if (logLevel === 'error') {
      Logger.error(message, null, {
        method,
        url,
        statusCode,
        duration,
        ip,
        responseSize: body?.length || 0,
      });
    } else if (logLevel === 'warn') {
      Logger.warn(message, {
        method,
        url,
        statusCode,
        duration,
        ip,
        responseSize: body?.length || 0,
      });
    } else {
      Logger.http(message, {
        method,
        url,
        statusCode,
        duration,
        ip,
        responseSize: body?.length || 0,
      });
    }

    return originalSend.call(this, body);
  };

  next();
};

// Middleware to capture unhandled errors
export const errorLoggingMiddleware = (
  error: Error, 
  req: Request, 
  res: Response, 
  next: NextFunction
) => {
  const { method, url, ip } = req;
  const userAgent = req.get('user-agent') || '';

  Logger.error(`Unhandled error in ${method} ${url}`, error, {
    method,
    url,
    ip,
    userAgent,
    timestamp: new Date().toISOString(),
  });

  // If a response has already been sent, do nothing else
  if (res.headersSent) {
    return next(error);
  }

  // Send error response
  res.status(500).json({
    error: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : error.message
  });
};

// Middleware for specific requests (optional)
export const authLoggingMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const { method, url } = req;
  const email = req.body?.email;
  
  Logger.auth(`Auth attempt: ${method} ${url}`, undefined, email, {
    method,
    url,
    hasEmail: !!email,
    timestamp: new Date().toISOString(),
  });

  next();
};