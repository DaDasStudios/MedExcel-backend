import { Schema, model } from 'mongoose';

const roleSchema = new Schema({
    name: {
        type: String,
        required: true
    }
})

export default model("Role", roleSchema)