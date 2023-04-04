import { Response, Request, } from 'express';
import { RequestUser } from '../@types/RequestUser';
import { mailTransporter } from '../lib/nodemailer';
import User from '../models/User';
import { emailHTMLBody } from '../util/email';
import { encryptPassword } from '../lib/bcryptjs';
import { signToken, verifyToken } from '../lib/jsonwebtoken';
import { CLIENT_HOST } from '../config';
import Role from '../models/Role';
import { IExamPerfomance, QuestionCategory, IStatisticResponse, IQuestion } from '../interfaces/';
import Question from '../models/Question';
import { ResponseStatus } from '../util/response';
import { getStatistics } from '../util/statistics';

export const users = async (req: Request, res: Response) => {
    try {
        const adminRoleId = (await Role.findOne({ name: "Admin" }).lean())._id
        if (req.query?.key && req.query?.value) {
            const { key, value } = req.query as { key: string, value: string }
            return res.status(200).json({ users: await User.find({ [key]: value, role: { $ne: adminRoleId } }) })
        } else {
            return res.status(200).json({ users: await User.find({ role: { $ne: adminRoleId } }) })
        }
    } catch (error) {
        return res.status(500).json({ message: "Internal server error" })
    }
}

export const user = async (req: Request, res: Response) => {
    try {
        const user = await User.findById(req.params.id).lean()

        if (!user) return res.status(404).json({ message: "User not found", status: ResponseStatus.NOT_FOUND_USER })

        const role = await Role.findById(user.role).lean()
        return res.status(200).json({ user: { ...user, role: role.name, password: null } })
    } catch (error) {
        return res.status(500).json({ message: "Internal server error" })
    }
}

export const deleteUser = async (req: Request, res: Response) => {
    try {
        const deletedUser = await User.findByIdAndDelete(req.params.id)
        if (!deletedUser) return res.status(404).json({ message: "User not found", status: ResponseStatus.NOT_FOUND_USER })
        return res.status(204).json({ user: deletedUser })
    } catch (error) {
        return res.status(500).json({ message: "Internal server error" })
    }
}

export const updateUser = async (req: Request, res: Response) => {
    try {
        const { username } = req.body
        if (!username) return res.status(403).json({ message: "Uncompleted information", status: ResponseStatus.BAD_REQUEST })
        const updatedUser = await User.findByIdAndUpdate(req.params.id, { username }, { new: true })
        return res.status(200).json({ message: "User updated", status: ResponseStatus.USER_UPDATED ,user: updatedUser })
    } catch (error) {
        return res.status(500).json({ message: "Internal server error" })
    }
}

export const recoverPassword = async (req: Request, res: Response) => {
    try {
        const { email } = req.body
        if (!email) return res.status(403).json({ message: "Uncompleted information", status: ResponseStatus.BAD_REQUEST })
        const foundUser = await User.findOne({ email })
        if (!foundUser) res.status(404).json({ message: "User not found", status: ResponseStatus.NOT_FOUND_USER })
        const token = signToken({ permission: foundUser._id.toString() + foundUser.password.length }, '5m')
        await User.findByIdAndUpdate(foundUser._id, { token })
        await mailTransporter.sendMail({
            subject: `📫 Recover your password ${foundUser.username} - Click on the link below to do it`,
            to: foundUser.email,
            html: emailHTMLBody(`
		<div>
			<h3>
				Please save your password in some safe place in order to you don't forget it. You just have five minutes to do this action.
			</h3>
			<p>
				Go to this link to change your password
				<a href="${CLIENT_HOST}/recover/auth?token=${token}">
					Update password
				</a>
			</p>
		</div>
        `)
        })
        return res.status(200).json({ message: "Waiting for email confirmation", status: ResponseStatus.WAITING_FOR_AUTHENTICATION })
    } catch (error) {
        return res.status(500).json({ message: "Internal server error" })
    }
}

export const updatePassword = async (req: RequestUser, res: Response) => {
    try {
        const newPassword: string = req.body.password
        const userWithToken = await User.findOne({ token: req.params.permissionToken })

        if (!newPassword) return res.status(403).json({ message: "Uncompleted information", status: ResponseStatus.BAD_REQUEST })
        const { permission } = verifyToken(userWithToken.token) as { permission: string }

        if (!(permission === userWithToken._id.toString() + userWithToken.password.length)) return res.status(401).json({ message: "Not authorized", status: ResponseStatus.UNAUTHORIZED })

        if (newPassword.length < 8) return res.status(403).json({ message: "Invalid password", status: ResponseStatus.INVALID_CREDENTIALS })
        const newEncryptedPassword = await encryptPassword(newPassword)
        const newToken = signToken({ id: userWithToken._id })
        await User.findByIdAndUpdate(userWithToken._id, { password: newEncryptedPassword, token: newToken })

        return res.status(200).json({ message: "Password updated", status: ResponseStatus.USER_UPDATED, token: newToken, id: userWithToken._id })
    } catch (error) {
        if (error.name === "TokenExpiredError") return res.status(403).json({ message: "Token expired" })
        return res.status(403).json({ message: "Invalid credentials" })
    }
}

export const setSubscriptionPlan = async (req: RequestUser, res: Response) => {
    try {
        const { days } = req.body as {
            days: number
        }

        if (!days) return res.status(400).json({ message: "Uncompleted information" })

        const user = await User.findById(req.params.id)
        const limitDay = new Date()
        limitDay.setDate(limitDay.getDate() + days)
        user.subscription = {
            hasSubscription: true,
            purchaseDate: new Date(),
            access: limitDay
        }
        await user.save()

        return res.status(200).json({ message: "Subscription actived", status: ResponseStatus.USER_UPDATED })

    } catch (error) {
        if (error.name === "TokenExpiredError") return res.status(403).json({ message: "Token expired" })
        return res.status(403).json({ message: "Invalid credentials" })
    }
}

export const resetExamHistory = async (req: RequestUser, res: Response) => {
    try {
        await User.findByIdAndUpdate(req.params.id, {
            $set: {
                'exam.scoresHistory': []
            }
        })

        return res.status(200).json({ message: "History reseted", status: ResponseStatus.USER_UPDATED })

    } catch (error) {
        if (error.name === "TokenExpiredError") return res.status(403).json({ message: "Token expired" })
        return res.status(403).json({ message: "Invalid credentials" })
    }
}

export const resetPerformanceHistory = async (req: Request, res: Response) => {
    try {
        await User.findByIdAndUpdate(req.params.id, {
            $set: {
                'exam.correctAnswers': []
            }
        })

        return res.status(200).json({ message: "Statistics reseted", status: ResponseStatus.USER_UPDATED })

    } catch (error) {
        if (error.name === "TokenExpiredError") return res.status(403).json({ message: "Token expired" })
        return res.status(403).json({ message: "Invalid credentials" })
    }
}

export const calculateGeneralStatistics = async (req: Request, res: Response) => {
    try {
        const user = await User.findById(req.params.id).lean()
        const { exam } = user

        const questions = await Question.find({ _id: { $in: exam.correctAnswers } }).select('type category topic parent').lean() as IQuestion<any>[]

        if (questions.length === 0) return res.status(404).json({ message: "Unavailable to calculate statistics due to user does not have correct answers yet", status: ResponseStatus.NOT_FOUND_QUESTIONS})

        const statistics = getStatistics(questions)

        return res.status(200).json({ status: ResponseStatus.CORRECT, statistics })

    } catch (error) {
        if (error.name === "TokenExpiredError") return res.status(403).json({ message: "Token expired" })
        return res.status(403).json({ message: "Invalid credentials" })
    }
}

export const calculateSpecificStatistics = async (req: Request, res: Response) => {
    try {
        const { questionsId, correctQuestionsId } = req.body as {
            questionsId: string[], correctQuestionsId: string[]
        }

        if (!correctQuestionsId || !questionsId) return res.status(400).json({ message: "Requires the IDs of questions to calculate the statistics", status: ResponseStatus.BAD_REQUEST })

        const questions = await Question.find({ _id: { $in: correctQuestionsId } }).select('type category topic parent').lean() as IQuestion<any>[]

        if (questions.length === 0) return res.status(404).json({ message: "The provided IDs list doesn't match with any question", status: ResponseStatus.NOT_FOUND_QUESTIONS })

        const statistics = getStatistics(questions)

        return res.status(200).json({ status: ResponseStatus.CORRECT, statistics })

    } catch (error) {
        if (error.name === "TokenExpiredError") return res.status(403).json({ message: "Token expired" })
        return res.status(403).json({ message: "Invalid credentials" })
    }
}