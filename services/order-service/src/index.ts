import express, { type ErrorRequestHandler } from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { randomUUID } from 'node:crypto';
import {
  httpLogger, correlationId, requireBearer, validate, CreateOrderSchema, errorHandler
} from '../../../utils';

const app = express();

// 1. Middleware Global
app.use(correlationId);
app.use(helmet());
app.use(httpLogger);

// 2. Custom JSON Parser Error Handler (agar error JSON jadi 400, bukan 500)
app.use(express.json({ limit: '100kb' }));
const jsonParseErrorHandler: ErrorRequestHandler = (err, req, res, next) => {
  if (err instanceof SyntaxError && 'status' in err && err.status === 400) {
    return res.status(400).json({ message: 'Invalid JSON', code: 'BAD_JSON' });
  }
  next(err);
};
app.use(jsonParseErrorHandler);

// 3. Auth & Rate Limit
app.use(requireBearer);
app.use(rateLimit({ windowMs: 60_000, max: 60, standardHeaders: true, legacyHeaders: false }));

// 4. In-Memory Database
const orders: any[] = [];

// 5. Routes
app.post('/orders', validate(CreateOrderSchema), (req, res) => {
  const { productId, quantity } = (req as any).validated;
  const order = {
    id: randomUUID(),
    productId,
    quantity,
    createdAt: new Date().toISOString(),
  };
  orders.push(order);
  res.status(201).json(order);
});

// 6. Global Error Handler
app.use(errorHandler);

export default app;