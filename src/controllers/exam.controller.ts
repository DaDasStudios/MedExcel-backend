import { Response } from "express";
import { RequestUser } from "../@types/RequestUser";
import Question from "../models/Question";
import User from "../models/User";
import { isAnswerCorrect } from '../util/checkQuestion'

export const getExam = async (req: RequestUser, res: Response) => {
    try {
        const { categories, filter } = req.body as { categories: string[], filter: string[] }
        if (!categories) return res.status(400).json({ message: "Categories must be provided" })

        const questions = await Question.find({ category: { $in: categories } })
        return res.status(200).json({ questions })
    } catch (error) {
        return res.status(500).json({ message: "Internal server error" })
    }
}

export const checkQuestion = async (req: RequestUser, res: Response) => {
    try {
        const foundQuestion = await Question.findById(req.params.id)
        if (!foundQuestion) return res.status(404).json({ message: "Question not found" })
        
        const questionId = foundQuestion._id.toString()
        const user = await User.findById(req.user._id)
        
        // * Filter based on type of question
        const { answer } = req.body as { answer: string }
        switch (foundQuestion.type) {
            case "SBA":
                const options: string[] = foundQuestion.content.options
                const realAnswerIdx: number = foundQuestion.content.answer
                if (isAnswerCorrect(options[realAnswerIdx-1], answer)) {
                    if (!user.correctAnswers.includes(questionId)) {
                        user.correctAnswers.push(questionId) 
                        await user.save()
                    } 
                    return res.status(200).json({ status: "CORRECT" })
                }
                break;

            default:

                break;
        }

       return res.status(200).json({ status: "INCORRECT" })
    } catch (error) {
        return res.status(500).json({ message: "Internal server error" })
    }
}