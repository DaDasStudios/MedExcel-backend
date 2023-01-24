import mongoose from 'mongoose';
import { DB_PASS, DB_URI, DB_USER } from './config'

mongoose.set("strictQuery", true)

export function connectDatabase() {
    mongoose.connect(DB_URI, {
        user: DB_USER,
        pass: DB_PASS,
        dbName: "medexcel"
    })
        .then(res => {
            console.info(">>> 🚀 MedExcel database is connected")
        })
        .catch(err => {
            console.error(err)
        })
}