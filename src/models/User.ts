import { Schema, model } from 'mongoose';

const userSchema = new Schema({
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
    }
}, {
    timestamps: true
})

export default model("User", userSchema)

