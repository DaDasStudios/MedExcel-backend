import { Router } from 'express';
import { ping } from '../controllers/ping.controller';

export const routerPing = Router()

routerPing.get('/ping', ping)
