import { Request } from "express-jwt"
import { FileArray, UploadedFile } from 'express-fileupload'
import { IUser } from "../interfaces"

interface IImage<> extends UploadedFile {
    
}

interface IFile extends FileArray {
    image: IImage
}

export interface RequestUser extends Request {
    user: IUser
    files: IFile
}
