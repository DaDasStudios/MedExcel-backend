import { Router } from "express"
import {
	cancelUserExam,
	checkQuestion,
	getExamQuestion,
	getUserExamInfo,
	setUserExam,
	terminateExam,
} from "../controllers"
import { checkAccessDate, checkTerminated, isAuthenticated, isAuthorized } from "../middlewares"

export const examRouter = Router()
	.get("/", [isAuthenticated(), isAuthorized(["User"])], getUserExamInfo)
	.get(
		"/question/:index",
		[isAuthenticated(), isAuthorized(["User"]), checkAccessDate, checkTerminated],
		getExamQuestion
	)
	.post("/terminate", [isAuthenticated(), isAuthorized(["User"]), checkAccessDate], terminateExam)
	.post("/set", [isAuthenticated(), isAuthorized(["User"]), checkAccessDate], setUserExam)
	.delete("/cancel", [isAuthenticated(), isAuthorized(["User"])], checkAccessDate, checkTerminated, cancelUserExam)
	.post("/answer", [isAuthenticated(), isAuthorized(["User"]), checkAccessDate, checkTerminated], checkQuestion)
