import app from './index';
import { logger } from '../../../utils';
const port = Number(process.env.PORT) || 5002;
app.listen(port, () => logger.info({ port }, 'order-service listening'));