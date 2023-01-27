import express, { Application } from 'express'
import { PORT, NODE_ENV } from './config'
import fs from 'fs'
import path from 'path'

// * Routers
import { authRouter, paymentRouter, pingRouter, questionRouter, siteRouter, usersRouter } from "./routes"

// * Middlewares
import morgan from "morgan"
import cookieParser from "cookie-parser"
import { errorHandler } from './middlewares'
import cors from 'cors'
import fileUpload from 'express-fileupload'

// * Util
import createError from 'http-errors'

export interface IServerSettings {
    port: string | number;
}

export class App {
    private app: Application;
    private accessLogStream = fs.createWriteStream(path.join(__dirname, '../access.log'), { flags: 'a' })

    constructor() {
        this.app = express();
        this.settings({
            port: PORT
        })
        this.middlewares()
        this.routes()
        this.static()
    }

    private settings({
        port
    }: IServerSettings) {
        this.app.set('port', port)
    }

    private middlewares() {
        this.app.use(cors())
        this.app.use(express.json())
        this.app.use(express.urlencoded({ extended: false }))
        this.app.use(fileUpload({
            useTempFiles: true,
            tempFileDir: path.join(__dirname, '../temp')
        }))
        this.app.use(morgan(NODE_ENV === "development" ? "dev" : "normal", {
            stream: this.accessLogStream
        }))
        this.app.use(cookieParser())

    }

    private routes() {
        // ? Normal routes
        this.app.use('/', pingRouter)
        this.app.use('/auth', authRouter)
        this.app.use('/users', usersRouter)
        this.app.use('/site', siteRouter)
        this.app.use("/question", questionRouter)
        this.app.use("/payments", paymentRouter)

        // todo: 404 Error Handler
        this.app.use((req, res, next) => {
            //next(createError(404))
            next()
        })
        // todo: General Error Handler
        this.app.use(errorHandler)
    }

    private static() {
        this.app.use(express.static(path.join(__dirname, "public")))
    }

    public run() {
        this.app.listen(this.app.get('port'), () => {
            console.info(`>>> 🚀 Server is running on port ${this.app.get('port')}`)
        })
    }
}