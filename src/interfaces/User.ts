import { IScoreHistory } from "./Statistics"

export interface IUser {
    _id: string
    username: string
    email: string
    password: string
    subscription?: {
        hasSubscription: boolean
        access: Date
        purchaseDate: Date
    }
    exam: { 
        startedAt: Date
        correctAnswers: string[]
        current: number
        currentCorrectAnswers: {
            questions: string[],
            value: number
        }
        questions: string[]
        score: number
        scoresHistory: IScoreHistory[]
    }
    token?: string
    payment_id?: string
    payment_token?: string
    role: string
    createdAt: NativeDate
    updatedAt: NativeDate
}