import { sign, verify } from 'jsonwebtoken'
import { TOKEN_SECRET } from '../config'

export const signToken = (payload: any, expirationTime: string | number = 60 * 60 * 24) => {
    return sign(payload, TOKEN_SECRET, { expiresIn: expirationTime, algorithm: "HS256" })
}

export const verifyToken = (token: string) => {
    return verify(token, TOKEN_SECRET)
}