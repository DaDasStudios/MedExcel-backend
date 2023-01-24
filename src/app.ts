import express, { Application } from 'express'
import { PORT } from './config'

// * Routers
import { routerPing } from "./routes"

export interface IServerSettings {
    port: string | number;
}

export class App {
    private app: Application;

    constructor() {
        this.app = express();
        this.settings({
            port: PORT
        })
        this.middlewares()
        this.routes()
    }

    private settings({
        port
    }: IServerSettings) {
        this.app.set('port', port)
    }

    private middlewares() {
        this.app.use(express.json())
    }

    private routes() {
        this.app.use('/', routerPing)
    }

    public run() {
        this.app.listen(this.app.get('port'), () => {
            console.info(`>>> 🚀 Server running on port ${this.app.get('port')}`)
        })
    }
}