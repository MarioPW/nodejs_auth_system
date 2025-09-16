import winston from 'winston';
import path from 'path';

// Define custom log levels
const logLevels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Colors for each level
const logColors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'blue',
};

winston.addColors(logColors);

// Custom format for logs
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.errors({ stack: true }),
  winston.format.colorize({ all: true }),
  winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
    let logMessage = `${timestamp} [${level}]: ${message}`;

    // Add stack trace if it's an error
    if (stack) {
      logMessage += `\n${stack}`;
    }

    // Add additional metadata
    if (Object.keys(meta).length > 0) {
      logMessage += `\n${JSON.stringify(meta, null, 2)}`;
    }

    return logMessage;
  })
);

// Format for files (without colors)
const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// Create logs directory if it doesn't exist
const logsDir = path.join(process.cwd(), 'logs');

// Configuration of transports
const transports: winston.transport[] = [
  // Console transport
  new winston.transports.Console({
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    format: logFormat,
  }),

  // File for all logs
  new winston.transports.File({
    filename: path.join(logsDir, 'app.log'),
    level: 'info',
    format: fileFormat,
    maxsize: 5242880, // 5MB
    maxFiles: 5,
  }),

  // File for errors only
  new winston.transports.File({
    filename: path.join(logsDir, 'error.log'),
    level: 'error',
    format: fileFormat,
    maxsize: 5242880, // 5MB
    maxFiles: 5,
  }),

  // File for HTTP requests
  new winston.transports.File({
    filename: path.join(logsDir, 'http.log'),
    level: 'http',
    format: fileFormat,
    maxsize: 5242880, // 5MB
    maxFiles: 3,
  }),
];

// Create the main logger
const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  levels: logLevels,
  format: logFormat,
  transports,
  exitOnError: false,
});

// Logger class with useful methods
export class Logger {
  // Basic logging methods
  static error(message: string, error?: Error | any, meta?: any) {
    if (error instanceof Error) {
      logger.error(message, { error: error.message, stack: error.stack, ...meta });
    } else if (error) {
      logger.error(message, { error, ...meta });
    } else {
      logger.error(message, meta);
    }
  }

  static warn(message: string, meta?: any) {
    logger.warn(message, meta);
  }

  static info(message: string, meta?: any) {
    logger.info(message, meta);
  }

  static http(message: string, meta?: any) {
    logger.http(message, meta);
  }

  static debug(message: string, meta?: any) {
    logger.debug(message, meta);
  }

  // Specific methods for your application
  static auth(message: string, userId?: string, email?: string, meta?: any) {
    logger.info(`[AUTH] ${message}`, {
      userId,
      email,
      category: 'authentication',
      ...meta
    });
  }

  static database(message: string, operation?: string, table?: string, meta?: any) {
    logger.info(`[DATABASE] ${message}`, {
      operation,
      table,
      category: 'database',
      ...meta
    });
  }

  static email(message: string, to?: string, subject?: string, meta?: any) {
    logger.info(`[EMAIL] ${message}`, {
      to,
      subject,
      category: 'email',
      ...meta
    });
  }

  static api(message: string, method?: string, url?: string, statusCode?: number, meta?: any) {
    logger.http(`[API] ${message}`, {
      method,
      url,
      statusCode,
      category: 'api',
      ...meta
    });
  }

  // Logger for middleware
  static middleware(message: string, meta?: any) {
    logger.debug(`[MIDDLEWARE] ${message}`, {
      category: 'middleware',
      ...meta
    });
  }
}

export default logger;