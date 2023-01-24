import { App } from "./app";
import { connectDatabase } from "./database";

const app = new App();
connectDatabase()
app.run()