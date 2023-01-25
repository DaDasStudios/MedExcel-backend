import { Router } from 'express';
import { signUp, signIn, confirmEmail } from '../controllers'

export const authRouter: Router = Router()
    .post('/signup', signUp)
    .get('/signup/:authorization', confirmEmail)
    .post('/signin', signIn)


