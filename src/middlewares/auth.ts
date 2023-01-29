import { Response, NextFunction } from 'express';
import { expressjwt } from 'express-jwt';
import { TOKEN_SECRET } from '../config/'
import User from '../models/User';
import Role from '../models/Role';
import { RequestUser } from '../@types/RequestUser';

export const isAuthorized = (roles: string[], checkParamId: boolean = false) => async (req: RequestUser, res: Response, next: NextFunction) => {
    try {
        if (req.auth) {
            const foundUser = await User.findById(req.auth.id)
            if (foundUser) {
                if (foundUser.token !== req.headers.authorization.split(' ')[1]) return res.status(401).json({ message: "Revoked token" })
                if (checkParamId && foundUser._id.toString() !== req.params?.id) return res.status(403).json({ message: "You don't have permissions" })
                const userRole = await Role.findById(foundUser.role)
                if (roles.some(role => role === userRole.name)) {
                    req.user = {
                        username: foundUser.username,
                        _id: foundUser._id.toString(),
                        email: foundUser.email,
                        password: foundUser.password,
                        role: foundUser.role?.toString() || '',
                        subscription: {
                            access: foundUser.subscription.access,
                            hasSubscription: foundUser.subscription.hasSubscription,
                            purchaseDate: foundUser.subscription.purchaseDate,
                        },
                        exam: {
                            correctAnswers: foundUser.exam.correctAnswers,
                            current: foundUser.exam.current,
                            questions: foundUser.exam.questions,
                            score: foundUser.exam.score,
                            startedAt: foundUser.exam.startedAt,
                            scoresHistory: foundUser.exam.scoresHistory.map(function (sh) {
                                return {
                                    finishedAt: sh.finishedAt,
                                    questions: sh.questions,
                                    score: sh.score,
                                    startedAt: sh.startedAt
                                }
                            }),
                        },
                        createdAt: foundUser.createdAt,
                        updatedAt: foundUser.updatedAt
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
