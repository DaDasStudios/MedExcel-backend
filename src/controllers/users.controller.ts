import { Response, Request } from 'express';
import User from '../models/User';

export const users = async (req: Request, res: Response) => {
    const users = await User.find()
    return res.status(200).json({ users })
}