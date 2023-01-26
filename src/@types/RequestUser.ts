import { Request } from "express-jwt"
import { FileArray, UploadedFile } from 'express-fileupload'
import { IUser } from "../interfaces"

interface IFile extends FileArray {
    image: UploadedFile
    explanation: UploadedFile
    scenario: UploadedFile
}

export interface RequestUser extends Request {
    user: IUser
    files: IFile
}
