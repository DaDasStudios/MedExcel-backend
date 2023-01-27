import axios from "axios";
import { Response } from "express";
import { RequestUser } from "../@types/RequestUser";
import { HOST, PAYPAL_URL } from "../config";
import { authPaypal } from '../lib/paypal'

export const createOrder = async (req: RequestUser, res: Response) => {
    try {
        // * Get a token to be able to interact with paypal REST API
        const { access_token } = await authPaypal()
        console.log(access_token)
        // const { data } = await axios.post(`${PAYPAL_URL}/v2/checkout/orders`, {
        //     intent: "CAPTURE",
        //     purchase_units: [
        //         {
        //             amount: {
        //                 "currency_code": "GBP",
        //                 "value": "10.5"
        //             },
        //             description: "This is a product to buy"
        //         }
        //     ],
        //     application_context: {
        //         cancel_url: `${HOST}/payments/cancel`,
        //         return_url: `${HOST}/payments/capture`,
        //     }
        // }, {
        //     headers: {
        //         'Authorization': `Bearer ${access_token}`,
        //         "Content-Type": "application/json"
        //     }
        // })

        return res.status(200).json({ message: "Order created" })
    } catch (error) {
        console.log(error)
        return res.status(200).json({ message: "Internal server error" })
    }
}