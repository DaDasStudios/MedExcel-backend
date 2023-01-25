import { Response, NextFunction } from 'express';
import { expressjwt } from 'express-jwt';
import { TOKEN_SECRET } from '../config/'
import User from '../models/User';
import Role from '../models/Role';
import { RequestUser } from '../@types/RequestUser';

export const isAuthorized = (roles: string[]) => async (req: RequestUser, res: Response, next: NextFunction) => {
    if (req.auth) {
        const foundUser = await User.findById(req.auth.id)
        if (foundUser) {
            const userRole = await Role.findById(foundUser.role)
            if (roles.some(role => role === userRole.name)) {
                req.user = { 
                    username: foundUser.username, 
                    _id: foundUser._id.toString(), 
                    email: foundUser.email, password: 
                    foundUser.password, 
                    role: foundUser.role?.toString() || '', 
                    createdAt: foundUser.createdAt, 
                    updatedAt: foundUser.updatedAt 
                }
            }
            return next()
        }
    }
    res.status(401).json({ message: "You don't have permissions" })
}


export const isAuthenticated = () => expressjwt({ 
    secret: TOKEN_SECRET, 
    algorithms: ["HS256"]
    })

