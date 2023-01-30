import { Router } from 'express';
import { checkQuestion, getUserCurrentQuestion, getUserExamInfo, setUserExam } from '../controllers';
import { checkAccessDate, hasFinished } from '../middlewares';
import { isAuthenticated, isAuthorized } from '../middlewares/auth';

export const examRouter = Router()
    .get('/', [isAuthenticated(), isAuthorized(["User"])], getUserExamInfo)
    .get('/current', [isAuthenticated(), isAuthorized(["User"])], getUserCurrentQuestion)
    .post('/set', [isAuthenticated(), isAuthorized(["User"]), checkAccessDate], setUserExam)
    .post('/answer', [isAuthenticated(), isAuthorized(["User"]), checkAccessDate, hasFinished], checkQuestion)