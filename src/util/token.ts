import { sign, verify } from 'jsonwebtoken'
import { TOKEN_SECRET } from '../config'

export const signToken = (payload: string) => {
    return sign({ id: payload }, TOKEN_SECRET, { expiresIn: 60 * 60 * 24 })
}

export const verifyToken = (token: string) => {
    return verify(token, TOKEN_SECRET)
}