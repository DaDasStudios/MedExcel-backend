import { Router } from 'express';
import { createSubcriptionPlan, deleteSubscriptionPlan, getSite, getSubscriptionPlans, updateImage, updateSubscriptionPlan } from '../controllers';
import { isAuthenticated, isAuthorized } from '../middlewares/auth';
import { checkSize, hasImage } from '../middlewares/files';

const subscriptionRouter = Router()
    .get('/', getSubscriptionPlans)
    .post('/', [isAuthenticated(), isAuthorized(["Admin"])], createSubcriptionPlan)
    .put('/', [isAuthenticated(), isAuthorized(["Admin"])], updateSubscriptionPlan)
    .delete('/', [isAuthenticated(), isAuthorized(["Admin"])], deleteSubscriptionPlan)

export const siteRouter = Router()
    .get('/', getSite)
    .put('/image', [isAuthenticated(), isAuthorized(["Admin"]), hasImage(), checkSize(500 * 10 ** 3, "image")], updateImage)
    .use('/subscription', subscriptionRouter)

