import { Request, Response } from 'express';
import { emailRegExp } from '../util/regExp';
import User from '../models/User';
import Role from '../models/Role';
import { comparePassword, encryptPassword } from '../util/password'
import { signToken } from '../util/token';


export const signIn = async (req: Request, res: Response) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(403).json({ message: "Uncompleted information" })
    const foundUser = await User.findOne({ email })
    if (!foundUser) return res.status(403).json({ message: "Invalid credentials" })

    if (!await comparePassword(password, foundUser?.password)) return res.status(403).json({ message: "Invalid credentials" })

    return res.status(200).json({ token: signToken(foundUser._id.toString()) })
}

export const signUp = async (req: Request, res: Response) => {
    const { username, email, password } = req.body as { username: string, email: string, password: string }
    if (!username || !email || !password) return res.status(403).json({ message: "Uncompleted information" })

    if (username.length < 5 || !emailRegExp.test(email) || password.length < 8) {
        return res.status(403).json({ message: "Invalid credentials" })
    }

    const USER_ROLE = await Role.findOne({ name: "User" })
    const savedUser = await new User({
        username,
        email,
        password: await encryptPassword(password),
        role: USER_ROLE?._id
    }).save();

    return res.status(200).json({ message: "User created", user: savedUser })
}