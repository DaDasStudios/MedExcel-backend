import { Router } from 'express';
import { deleteQuestion, deleteQuestionReview, getFilteredQuestions, getQuestions, getReviewQuestions, getUserQuestionReviews, postQuestion, postReviewQuestion, updateQuestion } from '../controllers/questions.controller';
import { isAuthenticated, isAuthorized } from '../middlewares/auth';

const questionReviewRouter = Router()
    .post('/', [isAuthenticated(), isAuthorized(["User"])], postReviewQuestion)
    .get('/', [isAuthenticated(), isAuthorized(["Admin"])], getReviewQuestions)
    .get('/owner', [isAuthenticated(), isAuthorized(["User"])], getUserQuestionReviews)
    .delete('/:id', [isAuthenticated(), isAuthorized(["Admin", "User"])], deleteQuestionReview)

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
    .use('/review', questionReviewRouter)