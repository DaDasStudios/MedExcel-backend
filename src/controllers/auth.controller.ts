import { Request, Response } from 'express';
import { emailRegExp } from '../util/regExp';
import User from '../models/User';
import Role from '../models/Role';
import { comparePassword, encryptPassword } from '../util/password'
import { signToken, verifyToken } from '../util/token';
import { emailHTMLBody } from '../util/email'
import { mailTransporter } from '../lib/nodemailer';
import { IUser } from '../interfaces'


export const signIn = async (req: Request, res: Response) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(403).json({ message: "Uncompleted information" })
    const foundUser = await User.findOne({ email })
    if (!foundUser) return res.status(403).json({ message: "Invalid credentials" })

    if (!await comparePassword(password, foundUser?.password)) return res.status(403).json({ message: "Invalid credentials" })

    return res.status(200).json({ token: signToken({ id: foundUser._id.toString() }) })
}

export const signUp = async (req: Request, res: Response) => {
    const { username, email, password } = req.body as { username: string, email: string, password: string }
    if (!username || !email || !password) return res.status(403).json({ message: "Uncompleted information" })

    if (username.length < 5 || !emailRegExp.test(email) || password.length < 8) {
        return res.status(403).json({ message: "Invalid credentials" })
    }

    const USER_ROLE = await Role.findOne({ name: "User" })
    const newUser = new User({
        username,
        email,
        password: await encryptPassword(password),
        role: USER_ROLE?._id
    })
    const token = signToken({ user: newUser })
    await mailTransporter.sendMail({
        subject: `⚕️ Hi ${username}, from MedExcel! - Please confirm your email address <${email}>`,
        to: email,
        html: emailHTMLBody(`
		<div>
			<h3>
				To access to our services we need to know that you actually are
				using a valid email address
			</h3>
			<p>
				Go to this link to get started with our services.
				<a href="http://localhost:5000/auth/signup/${token}">
					Get authenticated
				</a>
			</p>
		</div>
`)

    })
    return res.status(100).json({ message: "Waiting for email confirmation" })
}

export const confirmEmail = async (req: Request, res: Response) => {
    try {
        const authorizationToken = req.params.authorization as string
        const { user } = verifyToken(authorizationToken) as { user: IUser }
        const { email, password, role, username } = user
        const savedUser = await new User({ username, email, password, role }).save()

        return res.status(200).json(
            {
                message: "User created",
                user: { username: savedUser.username, email: savedUser.email },
                token: signToken({ id: savedUser._id })
            })
    } catch (error) {
        return res.status(403).json({ message: "Invalid credentials" })
    }
}
