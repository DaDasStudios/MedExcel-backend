import { UploadedFile } from "express-fileupload"

export type QuestionType = "SBA" | "ECQ" | "CBQ"

export interface MDFile extends UploadedFile {

}

export type CBQQuestion = SBAQuestion[]

export interface ECQQuestion {
    options: string[]
    questions: Array<{
        question: string
        answer: string | number
        explanation: string
    }>

}

export interface SBAQuestion {
    options: string[];
    question: string
    answer: number
    explanation: string
}

export interface IQuestion<T> {
    _id: string
    type: QuestionType
    scenario: string
    content: T
    category: string
    parent?: string
    topic: string
}

export interface IQuestionReview {
    questionId: string
    authorId: string
    rate: number
    review: string
}