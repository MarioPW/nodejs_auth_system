// src/middleware/loggingMiddleware.ts
import { Request, Response, NextFunction } from 'express';
import { Logger } from '../Utils/logger';

// Extender la interfaz Request para agregar startTime
interface RequestWithTiming extends Request {
  startTime?: number;
}

// Middleware principal de logging
export const loggingMiddleware = (req: RequestWithTiming, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  req.startTime = startTime;

  // Capturar información de la request
  const { method, url, ip } = req;
  const userAgent = req.get('user-agent') || '';
  
  // Log de la request entrante
  Logger.http(`Incoming request: ${method} ${url}`, {
    method,
    url,
    ip,
    userAgent,
    timestamp: new Date().toISOString(),
  });

  // Interceptar la respuesta
  const originalSend = res.send;
  res.send = function(body) {
    const duration = Date.now() - startTime;
    const { statusCode } = res;
    
    // Determinar el nivel de log basado en el status code
    const logLevel = statusCode >= 400 ? 'error' : statusCode >= 300 ? 'warn' : 'http';
    
    // Log de la respuesta
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

// Middleware para capturar errores no manejados
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

  // Si ya se envió una respuesta, no hacer nada más
  if (res.headersSent) {
    return next(error);
  }

  // Enviar respuesta de error
  res.status(500).json({
    error: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : error.message
  });
};

// Middleware para requests específicos (opcional)
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