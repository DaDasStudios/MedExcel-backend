import { Response, NextFunction } from 'express';
import { RequestUser } from '../@types/RequestUser';
import Role from '../models/Role';
import User from '../models/User';

export const checkPlanDateExpiration = async (req: RequestUser, res: Response, next: NextFunction) => {
    try {
        const role = await Role.findById(req.user.role).lean()
        if (role.name === "Admin") return next()

        if (req.user && !req.user.subscription.hasSubscription) return next()

        const user = await User.findById(req.user._id)
        if (user.subscription.access.getTime() < Date.now()) {
            user.subscription.hasSubscription = false
            await user.save()
        }
        next()
    } catch (error) {
        next(error)
    }
}