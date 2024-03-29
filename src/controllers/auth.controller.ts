import { Request, Response } from 'express';
import { emailRegExp } from '../util/regExp';
import User from '../models/User';
import Role from '../models/Role';
import { comparePassword, encryptPassword } from '../lib/bcryptjs'
import { signToken, verifyToken } from '../lib/jsonwebtoken';
import { emailHTMLBody } from '../util/email'
import { mailTransporter } from '../lib/nodemailer';
import { IUser } from '../interfaces'
import { CLIENT_HOST, HOST } from '../config';

export const signIn = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(403).json({ message: "Uncompleted information" })
        const foundUser = await User.findOne({ email })

        if (!foundUser) return res.status(403).json({ message: "Invalid credentials" })

        if (!await comparePassword(password, foundUser?.password)) return res.status(403).json({ message: "Invalid credentials" })

        // * Check subscription date
        if (foundUser.subscription.hasSubscription) {
            foundUser.subscription.hasSubscription = foundUser.subscription.access.getTime() > Date.now()
        }

        const token = signToken({ id: foundUser._id.toString() })
        foundUser.token = token
        await foundUser.save()

        return res.status(200).json({ token, id: foundUser._id })
    } catch (error) {
        return res.status(500).json({ message: "Internal server error" })
    }
}

export const signUp = async (req: Request, res: Response) => {
    try {
        const { username, email, password } = req.body as { username: string, email: string, password: string }
        if (!username || !email || !password) return res.status(403).json({ message: "Uncompleted information" })

        if (username.length < 5 || !emailRegExp.test(email) || password.length < 8) {
            return res.status(400).json({ message: "Invalid request body" })
        }

        // * Check whether email is already registered
        if (await User.findOne({ email })) return res.status(400).json({ status: "REGISTERED", message: "Email already registered" })

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
				<a href="${HOST}/auth/signup/${token}">
					Get authenticated
				</a>
			</p>
		</div>
`)

        })
        return res.status(200).json({ message: "Waiting for email confirmation" })
    } catch (error) {
        return res.status(500).json({ message: "Internal server error" })
    }
}

export const confirmEmail = async (req: Request, res: Response) => {
    try {
        const authorizationToken = req.params.authorization as string
        const { user } = verifyToken(authorizationToken) as { user: IUser }
        const { email, password, role, username } = user

        // * Add two week of trail access
        const dateLimit = new Date()
        dateLimit.setDate(dateLimit.getDate() + 14)

        const newUser = new User({
            username,
            email,
            password,
            role,
            subscription: {
                hasSubscription: false,
                access: dateLimit,
            },
            exam: {
                startedAt: null
            }
        })
        const token = signToken({ id: newUser._id })
        newUser.token = token
        const savedUser = await newUser.save()

        return res.redirect(`${CLIENT_HOST}/signin`)
    } catch (error) {
        return res.status(403).json({ message: "Invalid credentials" })
    }
}
