import { Router } from "express";
import { updatePassword, users, user, updateUser, deleteUser, recoverPassword, setSubscriptionPlan, resetExamHistory, resetPerformanceHistory, calculateGeneralStatistics, calculateSpecificStatistics } from "../controllers";
import { checkPlanDateExpiration } from "../middlewares";
import { isAuthenticated, isAuthorized } from '../middlewares/auth'

const passwordRouter = Router()
    .put("/", recoverPassword)
    .put("/:permissionToken", updatePassword)

const ownerRouter = Router()
    .get("/:id", [isAuthenticated(), isAuthorized(["User", "Admin"], true), checkPlanDateExpiration], user)
    .put("/:id", [isAuthenticated(), isAuthorized(["User"], true), checkPlanDateExpiration], updateUser)
    .delete("/reset-exam-history/:id", [isAuthenticated(), isAuthorized(["User"], true), checkPlanDateExpiration], resetExamHistory)
    .delete("/reset-performance-history/:id", [isAuthenticated(), isAuthorized(["User"], true), checkPlanDateExpiration], resetPerformanceHistory)
    .get("/statistics/:id", [isAuthenticated(), isAuthorized(["User"], true), checkPlanDateExpiration], calculateGeneralStatistics)
    .post("/statistics/:id", [isAuthenticated(), isAuthorized(["User"], true), checkPlanDateExpiration], calculateSpecificStatistics)

const userRouter = Router()
    .get("/:id", [isAuthenticated(), isAuthorized(["Admin"])], user)
    .put("/:id", [isAuthenticated(), isAuthorized(["Admin"])], updateUser)
    .delete("/:id", [isAuthenticated(), isAuthorized(["Admin"])], deleteUser)
    .put("/subscription/:id", [isAuthenticated(), isAuthorized(["Admin"])], setSubscriptionPlan)
    .use("/owner", ownerRouter)

export const usersRouter = Router()
    .get("/", [isAuthenticated(), isAuthorized(["Admin"])], users)
    .use("/user", userRouter)
    .use("/password", passwordRouter)
