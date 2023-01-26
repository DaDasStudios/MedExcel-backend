import { genSalt, hash, compare } from "bcryptjs"

export const encryptPassword = async (password: string) => {
    const salt = await genSalt(10)
    return hash(password, salt)
}

export const comparePassword = async (password: string, savedPassword: string) => {
    return compare(password, savedPassword)
}