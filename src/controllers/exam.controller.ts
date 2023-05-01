import { Response } from "express";
import { RequestUser } from "../@types/RequestUser";
import { CBQQuestion, ECQQuestion, IQuestion, SBAQuestion } from "../interfaces";
import Question from "../models/Question";
import User from "../models/User";
import { isAnswerCorrect } from '../util/checkQuestion'
import { NODE_ENV } from "../config";
import { ResponseStatus } from "../util/response";

export const getUserCurrentQuestion = async (req: RequestUser, res: Response) => {
    try {
        if (req.user.exam.startedAt === null) return res.status(401).json({ message: "Exam not started yet" })
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

export const cancelUserExam = async (req: RequestUser, res: Response) => {
    try {
        const user = await User.findById(req.user._id)
        const incorrectQuestionsIds: string[] = []
        for (let i = 0; i < user.exam.questions.length && i < user.exam.current; i++) {
            const questionId = user.exam.questions[i]
            if (!user.exam.currentCorrectAnswers.questions.includes(questionId)) {
                incorrectQuestionsIds.push(questionId)
            }
        }

        await user.updateOne({
            $set: {
                exam: {
                    ...user.exam,
                    current: 0,
                    currentCorrectAnswers: {
                        questions: [],
                        value: 0
                    },//
                    score: 0,
                    questions: [],
                    currentPerfomance: [],
                    startedAt: null,
                }
            }
        })

        return res.status(200).json({ message: "Exam cancelled successfully", status: ResponseStatus.EXAM_CANCELED, statusCode: 204, incorrectQuestions: await Question.find({ _id: { $in: incorrectQuestionsIds } }) })
    } catch (error) {
        return res.status(500).json({ message: "Internal server error" })
    }
}

export const setUserExam = async (req: RequestUser, res: Response) => {
    try {
        const { categories, filter, ids } = req.body as { categories: string[], filter: "NEW" | "ALL" | "INCORRECT", ids: string[] }

        if (req.user.exam.startedAt !== null) return res.status(401).json({ message: "You cannot start an exam without finishing the current one" })

        let questions: IQuestion<any>[]

        if (NODE_ENV === "development" && ids) {
            questions = await Question.find({ _id: { $in: ids } })
        } else if (!categories) return res.status(400).json({ message: "Categories must be provided" })

        switch (filter) {
            case "ALL":
                questions = await Question.find({ category: { $in: categories } }).lean()
                break;

            case "NEW":
                // ? The question's ids that was seleced somewhen
                const questionsHistory = req.user.exam.scoresHistory.reduce((arr, curr) => {
                    return arr.concat(curr.questions)
                }, [] as string[])
                questions = await Question.find({ _id: { $nin: questionsHistory }, category: { $in: categories } }).lean()
                break;

            case "INCORRECT":
                questions = await Question.find({ category: { $in: categories }, _id: { $nin: req.user.exam.correctAnswers } }).lean()
                break;
        }

        if (questions.length === 0) return res.status(400).json({ message: "No question found with the specified filters" })

        const user = await User.findById(req.user._id)

        // * Suffle the options of the questions
        // for (const q of questions) {
        //     switch (q.type) {
        //         case "SBA":
        //             (q as IQuestion<SBAQuestion>).content.options.sort((a, b) => 0.5 - Math.random())
        //             break
        //         case "CBQ":
        //             (q as IQuestion<CBQQuestion>).content.map(sq => {
        //                 return { ...sq, options: sq.options.sort((a, b) => 0.5 - Math.random()) }
        //             })
        //             break
        //         case "ECQ":
        //             (q as IQuestion<ECQQuestion>).content.options.sort((a, b) => 0.5 - Math.random())
        //             break
        //     }
        // }

        await user.updateOne({
            $set: {
                exam: {
                    ...user.exam,
                    questions: questions.sort((a, b) => 0.5 - Math.random()).map(q => q._id.toString()),
                    current: 0,
                    score: 0,
                    currentCorrectAnswers: {
                        questions: [],
                        value: 0
                    },
                    startedAt: new Date(),
                }
            }
        })

        return res.status(200).json({ message: "Exam started", questions: user.exam.questions })
    } catch (error) {
        console.log(error)

        return res.status(500).json({ message: "Internal server error" })
    }
}

export const checkQuestion = async (req: RequestUser, res: Response) => {
    try {
        const foundQuestion = await Question.findById(req.user.exam.questions[req.user.exam.current])
        if (!foundQuestion) return res.status(404).json({ message: "Question not found" })

        const questionId = foundQuestion._id.toString()
        const user = await User.findById(req.user._id)

        // * Features
        function storeCorrectAnswer() {
            if (!user.exam.correctAnswers.includes(questionId)) {
                user.exam.correctAnswers.push(questionId)
            }
            user.exam.currentCorrectAnswers.questions.push(foundQuestion._id.toString())
        }

        // * Filter based on type of question
        switch (foundQuestion.type) {
            case "SBA": {
                const { answer } = req.body as { answer: string }
                if (!answer) return res.status(400).json({ message: "Must provide a answer" })
                const options: string[] = foundQuestion.content.options
                const realAnswerIdx: number = foundQuestion.content.answer

                const isCorrect = isAnswerCorrect(options[realAnswerIdx - 1], answer)
                if (isCorrect) {
                    storeCorrectAnswer()
                    user.exam.currentCorrectAnswers.value++
                }

                user.exam.current++
                user.exam.score = (user.exam.currentCorrectAnswers.value / user.exam.current) * 100
                const savedUser = await user.save()

                return res.status(200).json({ status: isCorrect ? "CORRECT" : "INCORRECT", score: savedUser.exam.score, explanation: foundQuestion.content.explanation, question: foundQuestion })
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
                        user.exam.currentCorrectAnswers.value += (1 / questions.length)
                    } else hasStreak = false
                }

                if (hasStreak) {
                    storeCorrectAnswer()
                }

                user.exam.current++
                user.exam.score = (user.exam.currentCorrectAnswers.value / user.exam.current) * 100
                const savedUser = await user.save()

                return res.status(200).json({ status: hasStreak ? "CORRECT" : "NOT ALL CORRECT", score: savedUser.exam.score, explanation: questions.map(q => q.explanation), question: foundQuestion })
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
                        user.exam.currentCorrectAnswers.value += (1 / questions.length)
                    } else hasStreak = false
                }

                if (hasStreak) {
                    storeCorrectAnswer()
                }

                user.exam.current++
                user.exam.score = (user.exam.currentCorrectAnswers.value / user.exam.current) * 100
                const savedUser = await user.save()

                return res.status(200).json({ status: hasStreak ? "CORRECT" : "NOT ALL CORRECT", score: savedUser.exam.score, explanation: foundQuestion.content.explanation, question: foundQuestion })
            }
            default:
                return res.status(400).json({ message: "Question type not found" })
        }
    } catch (error) {
        return res.status(500).json({ message: "Internal server error" })
    }
}