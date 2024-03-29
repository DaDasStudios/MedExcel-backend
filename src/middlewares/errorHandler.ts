import { Request, Response, NextFunction } from 'express';
import { NODE_ENV } from '../config';

export const errorHandler = function (err: Error, req: Request, res: Response, next: NextFunction) {
    if (NODE_ENV === 'development') {
        console.log(err)
    }

    if (err.name === "SyntaxError") return res.status(400).json({ message: "Request failed due to syntax error at body"})

    if (err.name === "UnauthorizedError") return res.status(401).json({ message: "Unauthorized" })

    if (err.name === "CastError") return res.status(403).json({ message: "Invalid ID"})
    return res.status(500).json({message: "Internal server error" })    
}