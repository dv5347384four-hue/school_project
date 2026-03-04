import express from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import csrf from 'csurf';
import { router } from './routes.js';
import { env } from './config/env.js';
import { prisma } from './utils/prisma.js';

const app = express();
app.use(helmet({ contentSecurityPolicy: false }));
app.use(rateLimit({ windowMs: 60_000, max: 120 }));
app.use(cors({ origin: env.appOrigin, credentials: true }));
app.use(cookieParser());
app.use(express.json({ limit: '2mb' }));
app.use(csrf({ cookie: true }));

app.use('/api', async (req, _res, next) => {
  if (req.path.includes('/health')) return next();
  await prisma.auditLog.create({
    data: {
      userId: req.headers['x-user-id']?.toString() || 'anonymous',
      action: `${req.method} ${req.path}`,
      entity: 'api',
      entityId: 'n/a',
      metadata: { ip: req.ip, ua: req.headers['user-agent'] || '' }
    }
  }).catch(() => null);
  next();
});
app.use('/api', router);

app.listen(env.port, () => console.log(`API started on ${env.port}`));
