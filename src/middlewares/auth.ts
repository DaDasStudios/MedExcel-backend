import { Response, NextFunction } from 'express';
import { expressjwt, Request as RequestJWT } from 'express-jwt';
import { TOKEN_SECRET } from '../config/'
import User from '../models/User';
import Role from '../models/Role';

export const isAuthorized = (role: string) => async (req: RequestJWT, res: Response, next: NextFunction) => {
    if (req.auth) {
        const foundUser = await User.findById(req.auth.id)
        if (foundUser) {
            const userRole = await Role.findById(foundUser.role)
            if (userRole?.name === role) {
                return next()
            }
        }
    }
    res.status(401).json({ message: "You don't have permissions" })
}

export const isAuthenticated = () => expressjwt({ secret: TOKEN_SECRET, algorithms: ["HS256"] })