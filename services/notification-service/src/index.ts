import express from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { httpLogger, correlationId, requireBearer, errorHandler } from '../../../utils';

const app = express();

app.use(correlationId);
app.use(helmet());
app.use(httpLogger);
app.use(requireBearer);
app.use(rateLimit({ windowMs: 60_000, max: 120, standardHeaders: true, legacyHeaders: false }));

app.get('/notifications', (req, res) => {
  const limit = Math.max(1, Math.min(100, Number(req.query.limit) || 10));
  const data = Array.from({ length: Math.min(1, limit) }).map((_, i) => ({
    id: `n${i + 1}`,
    type: 'ORDER_CREATED',
    message: 'Order created successfully',
    createdAt: new Date().toISOString(),
  }));
  res.json({ data, total: data.length });
});

app.use(errorHandler);

export default app;