import { Request, Response, NextFunction } from 'express';

export const errorHandler = function (err: Error, req: Request, res: Response, next: NextFunction) {
    console.log(err.stack)
    res.json({ message: "Something went wrong" })
}