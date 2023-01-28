import { Router } from 'express';
import { getExam } from '../controllers';

export const examRouter = Router()
    .get('/', getExam)