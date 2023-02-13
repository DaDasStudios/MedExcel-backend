import axios from "axios";
import { Request, Response } from "express";
import { RequestUser } from "../@types/RequestUser";
import { CLIENT_HOST, HOST, PAYPAL_URL } from "../config";
import { IDateSubscription } from "../interfaces";
import { signToken, verifyToken } from "../lib/jsonwebtoken";
import { authPaypal } from '../lib/paypal'
import Site from "../models/Site";
import User from "../models/User";

export const cancelOrder = async (req: Request, res: Response) => {
    try {
        const { token } = req.query
        if (!token) return res.status(400).json({ message: "Uncompleted information" })

        const user = await User.findOne({ payment_id: token })
        if (!user) return res.status(404).json({ message: "Checkout not found" })

        user.payment_token = null
        user.payment_id = null
        await user.save()

        return res.redirect(`${CLIENT_HOST}/subscription?status=CANCELLED`)
    } catch (error) {
        return res.status(500).json({ message: "Internal server error" })
    }
}

export const captureOrder = async (req: Request, res: Response) => {
    try {
        const { token, PayerID } = req.query
        if (!token || !PayerID) return res.status(400).json({ message: "Uncompleted information" })

        const user = await User.findOne({ payment_id: token })
        if (!user) return res.status(404).json({ message: "Checkout not found" })

        const { access_token } = await authPaypal()

        const { data } = await axios.post(`${PAYPAL_URL}/v2/checkout/orders/${token}/capture`, {}, {
            headers: {
                'Authorization': `Bearer ${access_token}`,
                "Content-Type": "application/json"
            }
        })

        if (data.status !== "COMPLETED") return res.status(500).json({ message: "Something went wrong with the payment" })

        // * Decode user token to access to the actual subscription plan
        const { subscription } = verifyToken(user.payment_token) as { subscription: IDateSubscription }
        const limitDay = new Date()
        limitDay.setDate(limitDay.getDate() + subscription.days)
        user.subscription = {
            hasSubscription: true,
            access: limitDay,
            purchaseDate: new Date()
        }
        const savedUser = await user.save()
        
        return res.redirect(`${CLIENT_HOST}/subscription?token=${savedUser.payment_token}`)
    } catch (error) {
        return res.status(500).json({ message: "Internal server error" })
    }
}

export const createOrder = async (req: RequestUser, res: Response) => {
    try {
        // * Get a token to be able to consume paypal REST API
        const { access_token } = await authPaypal()

        // ? Check whether user has payed the subscription
        const user = await User.findById(req.user._id)
        if (user.subscription?.hasSubscription) return res.status(401).json({ message: "Subscription already payed" })

        // ? Check a valid subscription price and content
        const siteInfo = await Site.findOne({ name: "Medexcel" })
        const subscriptionPlans = siteInfo.subscriptionPlans
        const subscription = subscriptionPlans.find(s => s._id == req.params.id)

        if (!subscription) return res.status(404).json({ message: "Subscription not found" })

        // ! Send a checkout order to Paypal server

        const { data } = await axios.post(`${PAYPAL_URL}/v2/checkout/orders`, {
            intent: "CAPTURE",
            purchase_units: [
                {
                    amount: {
                        currency_code: "GBP",
                        value: subscription.price.toString(),
                    },
                    description: subscription.description,
                }
            ],
            application_context: {
                cancel_url: `${HOST}/payments/cancel`,
                return_url: `${HOST}/payments/capture`,
            }
        }, {
            headers: {
                'Authorization': `Bearer ${access_token}`,
                "Content-Type": "application/json"
            }
        })

        if (data.status !== "CREATED") return res.status(500).json({
            message: "Something went wrong during the order creation",
            status: data.status
        })

        user.payment_id = data.id
        user.payment_token = signToken({ subscription }, "1h")
        await user.save()

        return res.status(200).json({
            message: "Order created",
            order: {
                status: data.status,
                links: data.links
            }
        })
    } catch (error) {
        return res.status(500).json({ message: "Internal server error" })
    }
}