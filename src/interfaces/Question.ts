import {UploadedFile} from "express-fileupload"

export type QuestionType = "SBA" | "ECQ" | "CBQ" 

export interface MDFile extends UploadedFile {

}

export interface CBQQuestion {
    questions: SBAQuestion[];
}

export interface ECQQuestion {
    options: string[]
    questions: Array<{
        question: string
        answer: string | number
    }>

}

export interface SBAQuestion {
    options: string[];
    question: string
    answer: string | number
}

export interface IQuestion<T> {
    type: QuestionType
    scenario: string
    content: T
    category: string
    subcategory?: string
    explanation: string
}