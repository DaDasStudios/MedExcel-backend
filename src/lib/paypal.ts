import { PAYPAL_CLIENT, PAYPAL_SECRET, PAYPAL_URL } from "../config";
import axios from "axios"

export const authPaypal = async () => {
    try {
        const { data } = await axios.post(
            `${PAYPAL_URL}/v1/oauth2/token`,
            new URLSearchParams({ "grant_type": "client_credentials" }),
            {
                auth: {
                    username: PAYPAL_CLIENT,
                    password: PAYPAL_SECRET
                }
            }
        )
        return data
    } catch (error) {
        console.error("Paypal authentication failed")
    }
}