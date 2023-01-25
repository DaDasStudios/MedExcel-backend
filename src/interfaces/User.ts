
export interface IUser {
    username: string
    email: string
    password: string
    createdAt: NativeDate
    updatedAt: NativeDate
    role: string
    _id: string
    token?: string
}