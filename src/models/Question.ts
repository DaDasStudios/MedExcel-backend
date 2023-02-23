import { Schema, model } from 'mongoose';

const questionSchema = new Schema({
    type: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    topic: {
        type: String,
        required: false
    },
    parent: {
        type: String,
        required: false
    },
    scenario: {
        type: String,
        required: false
    },
    content: {
        type: Schema.Types.Mixed,
        required: true
    },
    explanation: {
        type: String,
        required: false
    },
}, {
    timestamps: true
})

export default model("Question", questionSchema)