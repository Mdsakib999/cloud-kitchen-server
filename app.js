import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

// Route files
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import orderRoutes from './routes/orderRoutes.js';

const app = express();

// Body parser
app.use(express.json());

// Dev logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Enable CORS
app.use(cors());

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/orders', orderRoutes);

app.get('/', (req, res) => {
  res.send('Cloud Kitchen API is running...');
});

// Error handling
app.use(notFound);
app.use(errorHandler);

export default app;
