import { Request, Response, NextFunction } from 'express';

export const errorHandler = function (err: Error, req: Request, res: Response, next: NextFunction) {
    console.log(err.stack)
    if (err.name === "UnauthorizedError") return res.status(401).json({ message: "Unauthorized" })
    res.json({ message: "Something went wrong" })

    return res.status(500).json({message: "Internal server error" })    
}