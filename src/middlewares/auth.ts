import { Response, NextFunction } from 'express';
import { expressjwt } from 'express-jwt';
import { TOKEN_SECRET } from '../config/'
import User from '../models/User';
import Role from '../models/Role';
import { RequestUser } from '../@types/RequestUser';

export const isAuthorized = (roles: string[], checkParamId: boolean = false) => async (req: RequestUser, res: Response, next: NextFunction) => {
    try {
        if (req.auth) {
            const foundUser = await User.findById(req.auth.id).lean() as any
            if (foundUser) {
                if (foundUser.token !== req.headers.authorization.split(' ')[1]) return res.status(401).json({ message: "Revoked token" })
                if (checkParamId && foundUser._id.toString() !== req.params?.id) return res.status(403).json({ message: "You don't have permissions" })
                const userRole = await Role.findById(foundUser.role)
                if (roles.some(role => role === userRole.name)) {
                    req.user = {
                        ...foundUser,
                        _id: foundUser._id.toString()
                    }
                    return next()
                }
            }
        }
        return res.status(401).json({ message: "You don't have permissions" })
    } catch (error) {
        next(error)
    }
}


export const isAuthenticated = () => expressjwt({
    secret: TOKEN_SECRET,
    algorithms: ["HS256"],
})
