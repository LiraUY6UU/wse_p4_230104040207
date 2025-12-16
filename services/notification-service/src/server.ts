import app from './index';
import { logger } from '../../../utils';
const port = Number(process.env.PORT) || 5003;
app.listen(port, () => logger.info({ port }, 'notification-service listening'));