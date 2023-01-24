import { Router } from "express";
import { users } from "../controllers";
import { isAuthenticated, isAuthorized } from '../middlewares/auth'

export const usersRouter = Router()
    .get("/", [isAuthenticated(), isAuthorized("Admin")], users)