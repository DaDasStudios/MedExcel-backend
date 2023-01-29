import { Router } from 'express';
import { checkQuestion, getUserExamInfo, setUserExam } from '../controllers';
import { checkAccessDate, hasFinished } from '../middlewares';
import { isAuthenticated, isAuthorized } from '../middlewares/auth';

export const examRouter = Router()
    .get('/', [isAuthenticated(), isAuthorized(["User"])], getUserExamInfo)
    .post('/set', [isAuthenticated(), isAuthorized(["User"]), checkAccessDate], setUserExam)
    .post('/answer', [isAuthenticated(), isAuthorized(["User"]), checkAccessDate, hasFinished], checkQuestion)