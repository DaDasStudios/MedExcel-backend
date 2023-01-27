import { Router } from 'express';
import { captureOrder, createOrder, cancelOrder } from '../controllers';
import { isAuthenticated, isAuthorized } from '../middlewares/auth';

export const paymentRouter = Router()
    .post('/create-order/:id', [isAuthenticated(), isAuthorized(["User"])], createOrder)
    .get('/capture', captureOrder)
    .get('/cancel', cancelOrder)
