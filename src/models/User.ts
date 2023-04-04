import { Schema, model } from 'mongoose';

const ScoreHistorySchema = new Schema({
    startedAt: {
        type: Date,
        required: false
    },
    finishedAt: {
        type: Date,
        required: false
    },
    questions: {
        type: [String],
        required: true
    },
    score: {
        type: Number,
        required: true
    },
    correctAnswers: {
        type: [String],
        required: true
    }
}, {
    _id: false,
    versionKey: false
})

const UserSchema = new Schema({
    username: {
        type: String,
        required: true,
    },
    email: { 
        type: String, 
        required: true, 
        unique: true 
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: Schema.Types.ObjectId,
        ref: "Role",
        required: false
    },
    token: {
        type: String,
        required: false
    },
    exam: {
        questions: [String],
        current: Number,
        correctAnswers: [String],
        currentCorrectAnswers: {
            questions: [String],
            value: Number
        },
        startedAt: Date,
        score: Number,
        scoresHistory: [ScoreHistorySchema],
    },
    subscription: {
        hasSubscription: Boolean,
        access: Date,
        purchaseDate: Date,
        required: false,
    },
    payment_id: {
        type: String,
        required: false
    },
    payment_token: {
        type: String,
        required: false
    }
}, {
    timestamps: true
})

export default model("User", UserSchema)

