import { NextFunction, Response } from "express"
import { RequestUser } from "../@types/RequestUser"

export const checkAccessDate = async (req: RequestUser, res: Response, next: NextFunction) => {
	try {
		if (req.user.subscription.access < new Date())
			return res.status(401).json({ message: "Must get a subscripton plan" })
		next()
	} catch (error) {
		next(error)
	}
}

export const checkTerminated = (req: RequestUser, res: Response, next: NextFunction) => {
	try {
		if (req.user.exam.startedAt) return next()

		return res.status(401).json({ message: "Must get a subscripton plan" })
	} catch (error) {
		next(error)
	}
}