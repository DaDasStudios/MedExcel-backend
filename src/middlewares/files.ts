import { Response, NextFunction } from 'express';
import { UploadedFile } from 'express-fileupload';
import { RequestUser } from '../@types/RequestUser';
import { imageRexExp } from '../util/regExp';

export const hasImage = () => (req: RequestUser, res: Response, next: NextFunction) => {
    try {
        if (!req.files) return res.status(400).json({ message: 'Bad request' })
        if (!req.files.image) return res.status(403).json({ message: 'Uncompleted information' })
        if (!imageRexExp.test(req.files.image.mimetype)) return res.status(400).json({ message: 'Bad request' })

        next()
    } catch (error) {
        next(error)
    }
}

export const checkSize = (size: number, target: string) => (req: RequestUser, res: Response, next: NextFunction) => {
    try {
        const file = req.files[target] as UploadedFile
        if (file.size > size) return res.status(400).json({ message: 'Bad request' })

        next()
    } catch (error) {
        next(error)
    }
}