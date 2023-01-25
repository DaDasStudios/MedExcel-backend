import { Router } from "express";
import { updatePassword, users, confirmUpdatePassword } from "../controllers";
import { isAuthenticated, isAuthorized } from '../middlewares/auth'

export const usersRouter = Router()
    .get("/", [isAuthenticated(), isAuthorized(["Admin"])], users)
    .put("/password", [isAuthenticated(), isAuthorized(["User", "Admin"])], confirmUpdatePassword)
    .put("/password/:permissionToken", [isAuthenticated(), isAuthorized(["User", "Admin"])] , updatePassword)