import { NextFunction, Response } from "express";
import { RequestUser } from "../@types/RequestUser";
import { IScoreHistory } from "../interfaces";
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

            const currentScore: IScoreHistory = {
                questions: user.exam.questions,
                finishedAt: new Date(),
                startedAt: user.exam.startedAt,
                score: user.exam.score,
                correctAnswers: user.exam.currentCorrectAnswers.questions
            }

            await user.updateOne({
                $set: {
                    exam: {
                        ...user.exam,
                        startedAt: null,
                        current: 0,
                        currentCorrectAnswers: {
                            questions: [],
                            value: 0
                        },
                        score: 0,
                        questions: [],
                        currentPerfomance: [],
                    }
                }
            })
            await user.updateOne({
                $push: {
                    'exam.scoresHistory': currentScore
                }
            })


            return res.status(200).json({ message: "Exam finished", status: "FINISHED", record: currentScore })
        }

        next()
    } catch (error) {
        console.log(error)
        next(error)
    }
}