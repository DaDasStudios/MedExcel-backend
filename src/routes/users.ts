import { Router } from "express";
import { updatePassword, users, user, updateUser, deleteUser, recoverPassword } from "../controllers";
import { checkPlanDateExpiration } from "../middlewares";
import { isAuthenticated, isAuthorized } from '../middlewares/auth'

const passwordRouter = Router()
    .put("/", recoverPassword)
    .put("/:permissionToken", updatePassword)

const userRouter = Router()
    .get("/:id", [isAuthenticated(), isAuthorized(["Admin"])], user)
    .get("/owner/:id", [isAuthenticated(), isAuthorized(["User", "Admin"], true), checkPlanDateExpiration], user)
    .put("/owner/:id", [isAuthenticated(), isAuthorized(["User"], true), checkPlanDateExpiration], updateUser)
    .put("/:id", [isAuthenticated(), isAuthorized(["Admin"])], updateUser)
    .delete("/:id", [isAuthenticated(), isAuthorized(["Admin"])], deleteUser)

export const usersRouter = Router()
    .get("/", [isAuthenticated(), isAuthorized(["Admin"])], users)
    .use("/user", userRouter)
    .use("/password", passwordRouter)
