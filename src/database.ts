import mongoose from 'mongoose';
import { DB_URI, NODE_ENV } from './config'

mongoose.set("strictQuery", true)

export function connectDatabase() {
    mongoose.connect(DB_URI, {
        dbName: "medexcel"
    })
        .then(res => {
            if (NODE_ENV === "development") {
                console.info(`
>>> 🚀 Medexcel database configuration: {
    name: ${res.connection.name}
    port: ${res.connection.port}
    host: ${res.connection.host}
}`)
            } else {
                console.info(">>> 🚀 MedExcel database is connected")
            }
        })
        .catch(err => {
            console.error(err)
        })
}