import { Schema, model, Types, mongo } from 'mongoose';

const siteSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    image: {
        url: String,
        public_id: String
    },
    subscriptionPlans: [{
        name: String,
        description: String,
        price: Number,
        points: Number,
        createdAt: Date,
        updatedAt: Date,
        _id: String
    }]
})

export default model("Site", siteSchema)