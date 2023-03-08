import Role from "../models/Role";
import Site from "../models/Site";

export const setupDatabase = async function () {
    // ? Set up roles
    const foundRoles = await Role.find({ name: { $in: ["Admin", "User"] } })
    if (foundRoles.length <= 0) {
        console.info("⚠️ Roles not created yet ")
        console.info("✍️  Creating base role...")
        await new Role({ name: "Admin" }).save()
        await new Role({ name: "User" }).save()
    }

    // ? Set up site content
    const theresSite = await Site.findOne({ name: "Medexcel" })
    if (!theresSite) {
        console.info("⚠️ Website information not created yet ")
        console.info("✍️  Building site content...")
        new Site({ name: "Medexcel" }).save()
    }
}