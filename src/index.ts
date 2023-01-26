import { App } from "./app";
import { connectDatabase } from "./database";
import { configureCloudinary } from './lib/cloudinary'
import { setupDatabase } from "./lib/mongo";

async function main() {
    connectDatabase()
    await setupDatabase()
    configureCloudinary()
    const app = new App();
    app.run()
}

main()
