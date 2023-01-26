import { Schema, model } from 'mongoose';

const siteSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    image: {
        url: String,
        public_id: String
    },
    discounts: {
        name: String,
        amount: Number
    }
})

export default model("Site", siteSchema)