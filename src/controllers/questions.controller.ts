import { Response, response } from "express";
import { RequestUser } from "../@types/RequestUser";
import Question from "../models/Question";
import { CBQQuestion, ECQQuestion, IQuestion, IQuestionReview, QuestionType, SBAQuestion } from "../interfaces";
import { ResponseStatus } from "../util/response";
import QuestionReview from "../models/QuestionReview";
import Role from "../models/Role";

interface IGetFilteredQuestionsBody {
    category: string[]
    id: string
    type: QuestionType
    topic: string[]
}

export const getFilteredQuestions = async (req: RequestUser, res: Response) => {
    try {
        const { category, id, type, topic } = req.body as IGetFilteredQuestionsBody
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

        if (!type || !content || !category || !scenario) return res.status(400).json({ mesage: "Uncompleted information" })

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


export const postReviewQuestion = async (req: RequestUser, res: Response) => {
    try {
        const { questionId, review, rate }: IQuestionReview = req.body
        if (!questionId || !review || !rate) {
            return res.status(400).json({ message: "Must provide all the parameters", status: ResponseStatus.BAD_REQUEST })
        }

        if (rate < 0 || rate > 5) {
            return res.status(400).json({ message: "Rate must be between 0 and 5", status: ResponseStatus.BAD_REQUEST })
        }

        if (!(await Question.findById(questionId))) {
            return res.status(404).json({ message: "Question not found with the provided id", status: ResponseStatus.NOT_FOUND_QUESTIONS })
        }

        const questionReview = await (new QuestionReview({
            questionId, review, rate, authorId: req.user._id
        })).save()


        return res.status(201).json({ message: "Question review created successfully", status: ResponseStatus.RESOURCE_CREATED, questionReview })

    } catch (error) {
        return res.status(500).json({ message: "Internal server error" })
    }
}

export const getReviewQuestions = async (req: RequestUser, res: Response) => {
    try {
        const questionReviews = await QuestionReview.find()

        if (questionReviews.length === 0) {
            return res.status(404).json({ message: "Question reviews not found", status: ResponseStatus.NOT_FOUND_REVIEW })
        }

        return res.status(200).json({ status: ResponseStatus.CORRECT, questionReviews })

    } catch (error) {
        return res.status(500).json({ message: "Internal server error" })
    }
}

export const getUserQuestionReviews = async (req: RequestUser, res: Response) => {
    try {
        const questionReviews = await QuestionReview.find({ authorId: { $in: req.user._id } })

        if (questionReviews.length === 0) {
            return res.status(404).json({ message: "Question reviews not found", status: ResponseStatus.NOT_FOUND_REVIEW })
        }

        return res.status(200).json({ status: ResponseStatus.CORRECT, questionReviews })

    } catch (error) {
        return res.status(500).json({ message: "Internal server error" })
    }
}

export const deleteQuestionReview = async (req: RequestUser, res: Response) => {
    try {
        const questionReview = await QuestionReview.findById(req.params.id).lean()
        const userRole = await Role.findById(req.user.role).lean()

        if (userRole.name === "User" && questionReview.authorId !== req.user._id) {
            return res.status(403).json({ message: "Not authorized to delete an alien question review", status: ResponseStatus.UNAUTHORIZED })
        }

        const deletedQuestionReview = await QuestionReview.findByIdAndDelete(req.params.id)
        if (!deletedQuestionReview) {
            return res.status(404).json({ message: "Question review not found with the provided id", status: ResponseStatus.NOT_FOUND_REVIEW })
        }

        return res.status(204).json({ message: "Question review deleted successfully", questionReview: deletedQuestionReview, status: ResponseStatus.RESOURCE_DELETED })

    } catch (error) {
        return res.status(500).json({ message: "Internal server error" })
    }
}