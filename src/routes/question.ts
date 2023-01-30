import { Router } from 'express';
import { deleteQuestion, getFilteredQuestions, getQuestions, postQuestion, updateQuestion } from '../controllers/questions.controller';
import { isAuthenticated, isAuthorized } from '../middlewares/auth';

export const questionRouter = Router()
    .get('/', [
        isAuthenticated(),
        isAuthorized(["User", "Admin"]),
    ], getQuestions)
    .post('/filter', [
        isAuthenticated(),
        isAuthorized(["Admin"]),
    ], getFilteredQuestions)
    .post('/', [
        isAuthenticated(),
        isAuthorized(["Admin"]),
    ], postQuestion)
    .put('/:id', [
        isAuthenticated(),
        isAuthorized(["Admin"]),
    ], updateQuestion)
    .delete('/:id', [
        isAuthenticated(),
        isAuthorized(["Admin"]),
    ], deleteQuestion)