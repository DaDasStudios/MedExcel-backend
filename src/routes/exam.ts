import { Router } from 'express';
import { checkQuestion, getExam } from '../controllers';
import { isAuthenticated, isAuthorized } from '../middlewares/auth';

export const examRouter = Router()
    .get('/', [isAuthenticated(), isAuthorized(["User"])], getExam)
    .post('/answer/:id', [isAuthenticated(), isAuthorized(["User"])], checkQuestion)