import { config } from 'dotenv'
config()

export const PORT = process.env.PORT || 5000
export const NODE_ENV = process.env.NODE_ENV || 'development'
export const DB_URI = process.env.DB_URI || ''
export const DB_USER = process.env.DB_USER || ''
export const DB_PASS = process.env.DB_PASS || ''
export const TOKEN_SECRET = process.env.TOKEN_SECRET || ''
export const MAIL_APP_PWD = process.env.MAIL_APP_PWD || ''
export const MAIL_USER = process.env.MAIL_USER || ''
export const CLOUDINARY_URL = process.env.CLOUDINARY_URL || ''
export const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY || ''
export const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET || ''
export const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME || ''
export const PAYPAL_CLIENT = process.env.PAYPAL_CLIENT || ''
export const PAYPAL_SECRET = process.env.PAYPAL_SECRET || ''
export const PAYPAL_URL = process.env.PAYPAL_URL || "https://api-m.sandbox.paypal.com"
export const CLIENT_HOST = process.env.CLIENT_HOST || ""
export const HOST = process.env.HOST || ''