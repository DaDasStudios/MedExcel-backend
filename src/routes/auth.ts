import { Router } from 'express';
import { signUp, signIn, confirmEmail } from '../controllers'
import { checkPlanDateExpiration } from '../middlewares';

export const authRouter: Router = Router()
    .post('/signup', signUp)
    .get('/signup/:authorization', confirmEmail)
    .post('/signin', signIn)


