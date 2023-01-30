import { Router } from 'express';
import { cancelUserExam, checkQuestion, getUserCurrentQuestion, getUserExamInfo, setUserExam } from '../controllers';
import { checkAccessDate, hasFinished } from '../middlewares';
import { isAuthenticated, isAuthorized } from '../middlewares/auth';

export const examRouter = Router()
    .get('/', [isAuthenticated(), isAuthorized(["User"])], getUserExamInfo)
    .get('/current', [isAuthenticated(), isAuthorized(["User"])], getUserCurrentQuestion)
    .post('/set', [isAuthenticated(), isAuthorized(["User"]), checkAccessDate], setUserExam)
    .delete('/cancel', [isAuthenticated(), isAuthorized(["User"])], cancelUserExam)
    .post('/answer', [isAuthenticated(), isAuthorized(["User"]), checkAccessDate, hasFinished], checkQuestion)