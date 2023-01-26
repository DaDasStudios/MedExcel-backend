import { Router } from 'express';
import { getSite, updateImage } from '../controllers';
import { isAuthenticated, isAuthorized } from '../middlewares/auth';
import { checkSize, hasImage } from '../middlewares/files';

export const siteRouter = Router()
    .get('/', getSite)
    .put('/image', [isAuthenticated(), isAuthorized(["Admin"]), hasImage(), checkSize(500 * 10 ** 3, "image")], updateImage)
