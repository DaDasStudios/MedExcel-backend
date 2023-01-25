import { Request } from "express-jwt"
import { IUser } from "../interfaces"

export interface RequestUser extends Request {
    user: IUser
}
