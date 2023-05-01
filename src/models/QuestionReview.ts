import { Schema, model } from 'mongoose';
import { IQuestionReview } from '../interfaces';

const questionReviewSchema = new Schema<IQuestionReview>({
    questionId: {
        type: String, required: true
    },
    rate: {
        type: Number, required: true
    },
    review: {
        type: String, required: true
    },
    authorId: {
        type: String, required: true
    }
}, {
    versionKey: false,
    timestamps: true
})

export default model("QuestionReview", questionReviewSchema)
