import { config } from 'dotenv'
config()

export const PORT = process.env.PORT || 5000
export const NODE_ENV = process.env.NODE_ENV || 'development'
export const DB_URI = process.env.DB_URI || ''
export const DB_USER = process.env.DB_USER || ''
export const DB_PASS = process.env.DB_PASS || ''
export const TOKEN_SECRET = process.env.TOKEN_SECRET || ''
