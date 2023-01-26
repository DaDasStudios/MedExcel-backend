import Role from "../models/Role";
import Site from "../models/Site";

export const setupDatabase = async function () {
    // ? Set up roles
    const foundRoles = await Role.find({ name: { $in: ["Admin", "User"] } })
    if (!foundRoles) {
        console.info("⚠️ Roles not created yet ")
        console.info("✍️  Creating base role...")
        new Role("Admin").save()
        new Role("User").save()
    }

    // ? Set up site content
    const theresSite = await Site.findOne({ name: "Medexcel" })
    if (!theresSite) {
        console.info("⚠️ Website information not created yet ")
        console.info("✍️  Building site content...")
        new Site({ name: "Medexcel" }).save()
    }
}