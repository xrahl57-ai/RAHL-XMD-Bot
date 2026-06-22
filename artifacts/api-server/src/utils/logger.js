import winston from 'winston';
import 'winston-daily-rotate-file';
import { mkdirSync } from 'fs';

mkdirSync('./logs', { recursive: true });

const { combine, timestamp, printf, colorize, errors } = winston.format;

const logFormat = printf(({ level, message, timestamp, stack }) => {
  return `[${timestamp}] ${level}: ${stack || message}`;
});

const fileTransport = new winston.transports.DailyRotateFile({
  filename: './logs/rahl-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  maxSize: '20m',
  maxFiles: '14d',
  format: combine(timestamp(), errors({ stack: true }), logFormat),
});

const errorTransport = new winston.transports.DailyRotateFile({
  filename: './logs/error-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  level: 'error',
  maxSize: '20m',
  maxFiles: '30d',
  format: combine(timestamp(), errors({ stack: true }), logFormat),
});

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    errors({ stack: true }),
    logFormat,
  ),
  transports: [
    new winston.transports.Console({
      silent: true,
    }),
    fileTransport,
    errorTransport,
  ],
});

export function logCommand(user, command, group = null) {
  logger.info(`CMD [${group || 'DM'}] ${user}: ${command}`);
}

export function logEvent(event, data = '') {
  logger.info(`EVT ${event}: ${data}`);
}

export function logError(context, err) {
  logger.error(`ERR [${context}]: ${err?.message || err}`);
}
