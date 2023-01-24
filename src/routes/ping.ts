import { Router } from 'express';
import { ping } from '../controllers';

export const pingRouter = Router()

pingRouter.get('/ping', ping)
