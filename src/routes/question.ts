import { Router } from 'express';
import { postQuestion } from '../controllers/questions.controller';
import { isAuthenticated, isAuthorized } from '../middlewares/auth';
import { checkSize, hasQuestionFiles } from '../middlewares/files';

export const questionRouter = Router()
    .post('/', [
        isAuthenticated(),
        isAuthorized(["Admin"]),
    ], postQuestion)