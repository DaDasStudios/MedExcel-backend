import { Response, Request, NextFunction } from 'express';
import { RequestUser } from '../@types/RequestUser';
import { mailTransporter } from '../lib/nodemailer';
import User from '../models/User';
import { emailHTMLBody } from '../util/email';
import { encryptPassword } from '../util/password';
import { signToken, verifyToken } from '../util/token';

export const users = async (req: Request, res: Response) => {
    const users = await User.find()
    return res.status(200).json({ users })
}

export const confirmUpdatePassword = async (req: RequestUser, res: Response, next: NextFunction) => {
    const token = signToken({ permission: req.user._id + req.user.password.length }, '5m')
    await User.findByIdAndUpdate(req.user._id, { token })
    await mailTransporter.sendMail({
        subject: `⚠️ Update your password ${req.user.username} - Click on the link below to do it`,
        to: req.user.email,
        html: emailHTMLBody(`
		<div>
			<h3>
				Updating your password is a dangerous action, so please save your password in some safe place in order to you don't forget it. You just have five minutes to do this action.
			</h3>
			<p>
				Go to this link to change your password
				<a href="http://localhost:5000/users/password/${token}">
					Update password
				</a>
			</p>
		</div>
        `)
    })
    return res.status(200).json({ message: "Waiting for email confirmation" })
}

export const updatePassword = async (req: RequestUser, res: Response) => {
    try {
        const newPassword: string = req.body.password
        const userWithToken = await User.findOne({ token: req.params.permissionToken })
        if (!newPassword) return res.status(403).json({ message: "Uncompleted information" })
        const { permission } = verifyToken(userWithToken.token) as { permission: string }
        if (!(permission === req.user._id + req.user.password.length)) return res.status(401).json({ message: "Not authorized" })

        const newEncryptedPassword = await encryptPassword(newPassword)
        await User.findByIdAndUpdate(req.user._id, { password: newEncryptedPassword, token: null })

        return res.status(200).json({ message: "Password updated" })
    } catch (error) {
        return res.status(403).json({ message: "Invalid credentials" })
    }
}