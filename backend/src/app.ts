import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { errorHandler } from './middleware/errorHandler';
import { notFound } from './middleware/notFound';
import apiRoutes from './routes/index';

const app = express();

// Security middleware
app.use(helmet());

const allowedOrigin = process.env.FRONTEND_URL || 'http://localhost:3000';
app.use((req, res, next) => {
  const origin = req.headers.origin;

  if (origin && origin !== allowedOrigin) {
    console.warn(`Blocked request from origin: ${origin}`);
    return res.status(403).json({ error: 'Forbidden: Invalid Origin' });
  }

  next();
});

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));

// Logging middleware
app.use(morgan('combined'));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Cookie parsing middleware
app.use(cookieParser());

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});


app.use('/api', apiRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;