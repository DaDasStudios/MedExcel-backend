import { createTransport } from 'nodemailer'
import { MAIL_APP_PWD, MAIL_USER } from '../config';

export const mailTransporter = createTransport({
    service: "gmail",
    secure: false,
    auth: {
        user: MAIL_USER,
        pass: MAIL_APP_PWD
    },
});