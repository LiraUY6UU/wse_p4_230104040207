import { randomUUID } from 'node:crypto';
import pino from 'pino';
import pinoHttp from 'pino-http';
import { z } from 'zod';
import type { NextFunction, Request, Response } from 'express';

const isProd = process.env.NODE_ENV === 'production';

export const logger = pino({
  level: process.env.LOG_LEVEL ?? 'info',
  redact: {
    paths: ['req.headers.authorization', 'req.headers.cookie', 'res.headers["set-cookie"]'],
    censor: '[REDACTED]',
  },
  ...(isProd ? {} : {
    transport: {
      target: 'pino-pretty',
      options: { translateTime: 'SYS:standard', singleLine: true, messageKey: 'msg' },
    },
  }),
});

export function correlationId(req: Request, res: Response, next: NextFunction) {
  const cid = (req.headers['x-correlation-id'] as string) ||
              (req.headers['x-request-id'] as string) ||
              randomUUID();
  res.setHeader('x-correlation-id', cid);
  (req as any).cid = cid;
  next();
}

export const httpLogger = pinoHttp({
  logger,
  customLogLevel: (_req, res, err) => {
    if (err || res.statusCode >= 500) return 'error';
    if (res.statusCode >= 400) return 'warn';
    return 'info';
  },
  customProps: (req) => ({ cid: (req as any).cid }),
  autoLogging: true,
});

export function requireBearer(req: Request, res: Response, next: NextFunction) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ') || auth.split(' ')[1] !== 'test123') {
    return res.status(401).json({ message: 'Unauthorized', code: 'UNAUTH' });
  }
  next();
}

export const CreateOrderSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().min(1),
}).strict();

export function validate<T>(schema: z.ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ message: 'ValidationError', code: 'BAD_REQUEST' });
    }
    (req as any).validated = result.data;
    next();
  };
}

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  logger.error({ err, cid: (req as any).cid }, 'unhandled_error');
  res.status(500).json({ message: 'InternalError', code: 'INTERNAL' });
}