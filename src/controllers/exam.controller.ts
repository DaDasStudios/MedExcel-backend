import { Response } from "express";
import { RequestUser } from "../@types/RequestUser";
import { SBAQuestion } from "../interfaces";
import Question from "../models/Question";
import User from "../models/User";
import { isAnswerCorrect } from '../util/checkQuestion'

export const getUserCurrentQuestion = async (req: RequestUser, res: Response) => {
    try {
        const question = await Question.findById(req.user.exam.questions[req.user.exam.current]).lean()
        let payload: any
        switch (question.type) {
            case "SBA":
                payload = {
                    ...question,
                    content: {
                        ...question.content,
                        answer: null,
                        explanation: null
                    }
                }
                break
            case "CBQ":
                payload = {
                    ...question,
                    content: question.content.map(function (c) {
                        return {
                            ...c,
                            answer: null,
                            explanation: null
                        }
                    })
                }
                break
            case "ECQ":
                payload = {
                    ...question,
                    content: {
                        ...question.content,
                        explanation: null,
                        question: question.content.question.map(function (q) {
                            return {
                                ...q,
                                answer: null
                            }
                        })
                    }
                }
                break

            default:
                return res.status(400).json({ message: "Invalid type of question" })
        }

        return res.status(200).json({
            question: payload
        })

    } catch (error) {
        return res.status(500).json({ message: "Internal server error" })
    }
}

export const getUserExamInfo = async (req: RequestUser, res: Response) => {
    try {
        return res.status(200).json({ exam: req.user.exam })
    } catch (error) {
        return res.status(500).json({ message: "Internal server error" })
    }
}

export const setUserExam = async (req: RequestUser, res: Response) => {
    try {
        const { categories, filter } = req.body as { categories: string[], filter: string[] }
        if (!categories) return res.status(400).json({ message: "Categories must be provided" })

        if (req.user.exam.startedAt !== null) return res.status(401).json({ message: "You cannot start an exam without finishing the current one" })

        const questions = await Question.find({ category: { $in: categories } })

        const user = await User.findById(req.user._id)
        user.exam.questions = questions.map(q => q._id.toString())
        user.exam.current = 0
        user.exam.score = 0
        user.exam.startedAt = new Date()
        await user.save()

        return res.status(200).json({ questions })
    } catch (error) {
        return res.status(500).json({ message: "Internal server error" })
    }
}

export const checkQuestion = async (req: RequestUser, res: Response) => {
    try {
        const foundQuestion = await Question.findById(req.user.exam.questions[req.user.exam.current])
        if (!foundQuestion) return res.status(404).json({ message: "Question not found" })

        const questionId = foundQuestion._id.toString()
        const user = await User.findById(req.user._id)

        // * Filter based on type of question
        switch (foundQuestion.type) {
            case "SBA": {
                const { answer } = req.body as { answer: string }
                if (!answer) return res.status(400).json({ message: "Must provide a answer" })
                const options: string[] = foundQuestion.content.options
                const realAnswerIdx: number = foundQuestion.content.answer

                const isCorrect = isAnswerCorrect(options[realAnswerIdx - 1], answer)
                if (isCorrect) {
                    if (!user.exam.correctAnswers.includes(questionId)) {
                        user.exam.correctAnswers.push(questionId)
                    }
                    user.exam.score += (100 / user.exam.questions.length)
                }
                user.exam.current++
                const savedUser = await user.save()
                
                return res.status(200).json({ status: isCorrect ? "CORRECT" : "INCORRECT", score: savedUser.exam.score, explanation: foundQuestion.content.explanation })
            }

            case "CBQ": {
                const { answers } = req.body as { answers: string[] }
                if (!answers) return res.status(400).json({ message: "Must provide a answers list" })

                const questions: SBAQuestion[] = foundQuestion.content
                let hasStreak = true
                for (let i = 0; i < questions.length; i++) {
                    const options = questions[i].options
                    const realAnswerIdx = questions[i].answer
                    if (isAnswerCorrect(options[realAnswerIdx - 1], answers[i])) {
                        user.exam.score += (100 / user.exam.questions.length) / questions.length
                    } else hasStreak = false
                }

                if (hasStreak && !user.exam.correctAnswers.includes(questionId)) {
                    user.exam.correctAnswers.push(questionId)
                }
                user.exam.current++
                const savedUser = await user.save()

                return res.status(200).json({ status: hasStreak ? "CORRECT" : "NOT ALL CORRECT", score: savedUser.exam.score, explanation: questions.map(q => q.explanation) })
            }

            case "ECQ": {
                const options: string[] = foundQuestion.content.options
                const questions = foundQuestion.content.question as {
                    question: string
                    answer: number
                }[]
                const { answers } = req.body as { answers: string[] }
                if (!answers) return res.status(400).json({ message: "Must provide a answers list" })
                if (answers.length !== questions.length) return res.status(400).json({ message: "Number of answers and questions must be equal" })

                let hasStreak = true
                for (let i = 0; i < answers.length; i++) {
                    const realAnswerIdx = questions[i].answer
                    if (isAnswerCorrect(options[realAnswerIdx - 1], answers[i])) {
                        user.exam.score += (100 / user.exam.questions.length) / questions.length
                    } else hasStreak = false
                }

                if (hasStreak && !user.exam.correctAnswers.includes(questionId)) {
                    user.exam.correctAnswers.push(questionId)
                }
                user.exam.current++
                const savedUser = await user.save()

                return res.status(200).json({ status: hasStreak ? "CORRECT" : "NOT ALL CORRECT", score: savedUser.exam.score, explanation: foundQuestion.content.explanation })
            }
            default:
                return res.status(400).json({ message: "Question type not found" })
        }
    } catch (error) {
        return res.status(500).json({ message: "Internal server error" })
    }
}