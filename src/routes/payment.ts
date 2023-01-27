import { Router } from 'express';
import { createOrder } from '../controllers';
import { isAuthenticated, isAuthorized } from '../middlewares/auth';

export const paymentRouter = Router()
    .post('/create-order', [isAuthenticated(), isAuthorized(["User"])], createOrder)
