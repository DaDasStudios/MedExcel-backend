import { NextFunction, Response } from "express";
import { RequestUser } from "../@types/RequestUser";
import User from "../models/User";

export const checkAccessDate = async (req: RequestUser, res: Response, next: NextFunction) => {
    try {
        if (req.user.subscription.access < new Date()) return res.status(401).json({ message: "Must get a subscripton plan" })
        next()
    } catch (error) {
        next(error)
    }
}

export const hasFinished = async (req: RequestUser, res: Response, next: NextFunction) => {
    try {
        if (req.user.exam.current === req.user.exam.questions.length && req.user.exam.startedAt !== null) {
            const user = await User.findById(req.user._id)
            const currentScore = {
                questions: user.exam.questions,
                finishedAt: new Date(),
                startedAt: user.exam.startedAt,
                score: user.exam.score
            }
            user.exam.scoresHistory.push(currentScore)
            user.exam.current = 0
            user.exam.questions = []
            user.exam.score = 0
            user.exam.startedAt = null
            user.exam.scoresHistory.sort(function (a, b) { return b.score - a.score })
            const savedUser = await user.save()
            return res.status(200).json({ message: "Exam finished", status: "FINISHED", record: currentScore })
        }

        next()
    } catch (error) {
        next(error)
    }
}