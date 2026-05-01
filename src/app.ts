import 'express-async-errors';
import express, { Application } from 'express';
import passport from 'passport';
import authRoutes from './modules/auth/auth.routes';
import { errorHandler } from './middlewares/error.middleware';
import './config/passport';

const app: Application = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());

app.use('/api/auth', authRoutes);

app.use(errorHandler);

export default app;
