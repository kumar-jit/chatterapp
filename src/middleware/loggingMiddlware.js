import winston from "winston";


const customFormat = winston.format.printf(({ level, message, timestamp }) => {
    return `[${timestamp}] : "level":"${level}", "message":"${message}"`;
});

export const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), // Add timestamp format
        customFormat // Log as JSON with timestamp included
    ),
    transports: [
      new winston.transports.File({ filename: './logs/error.log', level: 'error' }),
      new winston.transports.File({ filename: './logs/combined.log' })
    ],
  });