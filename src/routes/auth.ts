import { Router } from 'express';
import { signUp, signIn } from '../controllers'

export const authRouter = Router()
    .post('/signup', signUp)
    .post('/signin', signIn)


