import { Response } from "express";
import { RequestUser } from "../@types/RequestUser";
import Question from "../models/Question";
import { CBQQuestion, ECQQuestion, IQuestion, QuestionType, SBAQuestion } from "../interfaces";

export const getFilteredQuestions = async (req: RequestUser, res: Response) => {
    try {
        const { category, id, type, topic } = req.body as { category: string[], id: string, type: QuestionType, topic: string[] }
        if (id) {
            return res.status(200).json({ question: await Question.findById(id) })
        }
        else if (category && topic && type) {
            return res.status(200).json({
                questions: await Question.find(
                    {
                        category: { $in: category },
                        type: { $in: type },
                        topic: { $in: topic }
                    }
                )
            })
        }
        else if (category && topic) {
            return res.status(200).json({
                questions: await Question.find(
                    {
                        category: { $in: category },
                        topic: { $in: topic }
                    }
                )
            })
        }
        else if (type && topic) {
            return res.status(200).json({
                questions: await Question.find(
                    {
                        topic: { $in: topic },
                        type: { $in: type }
                    }
                )
            })
        }
        else if (category && type) {
            return res.status(200).json({
                questions: await Question.find(
                    {
                        category: { $in: category },
                        type: { $in: type }
                    }
                )
            })
        } else if (topic) {
            return res.status(200).json({ questions: category.length === 0 ? await Question.find() : await Question.find({ topic: { $in: topic } }) })
        }
        else if (category) {
            return res.status(200).json({ questions: category.length === 0 ? await Question.find() : await Question.find({ category: { $in: category } }) })
        } else if (type) {
            return res.status(200).json({ questions: await Question.find({ type: { $in: type } }) })
        }

        return res.status(400).json({ message: "No filter specified" })
    } catch (error) {
        return res.status(500).json({ message: "Internal server error" })
    }
}

export const getQuestions = async (req: RequestUser, res: Response) => {
    try {
        const questions = await Question.find().lean()
        return res.status(200).json({
            questions: questions.map(function (q) {
                return {
                    ...q,
                    content: null,
                    __v: null
                }
            })
        })
    } catch (error) {
        return res.status(500).json({ message: "Internal server error" })
    }
}

export const deleteQuestion = async (req: RequestUser, res: Response) => {
    try {
        const deletedQuestion = await Question.findByIdAndDelete(req.params.id)
        if (!deletedQuestion) return res.status(404).json({ message: 'Question not found' })

        return res.status(200).json({ message: 'Question deleted', question: deletedQuestion })
    } catch (error) {
        return res.status(500).json({ message: "Internal server error" })
    }
}

export const updateQuestion = async (req: RequestUser, res: Response) => {
    try {
        const { content, scenario, category, parent, topic } = req.body;
        const updatedQuestion = await Question.findByIdAndUpdate(req.params.id, { content, scenario, category, parent, topic }, { new: true })
        return res.status(200).json({ message: "Question updated", question: updatedQuestion })
    } catch (error) {
        return res.status(500).json({ message: "Internal server error" })
    }
}

export const postQuestion = async (req: RequestUser, res: Response) => {
    try {
        const { type, content, scenario, category, parent, topic } = req.body as IQuestion<SBAQuestion | ECQQuestion | CBQQuestion>

        if (!type || !content || !category || !scenario || !topic) return res.status(400).json({ mesage: "Uncompleted information" })

        if (!["SBA", "ECQ", "CBQ"].includes(type)) return res.status(400).json({ message: "Invalid type of question" })

        const newQuestion = new Question({
            type, content, scenario, category, parent, topic
        })

        const savedQuestion = await newQuestion.save()

        return res.status(200).json({ message: "New question saved", question: savedQuestion })
    } catch (error) {
        return res.status(500).json({ message: "Internal server error" })
    }
}