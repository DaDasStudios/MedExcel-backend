import { Response } from "express";
import { RequestUser } from "../@types/RequestUser";


export const getExam = async (req: RequestUser, res: Response) => {
    try {
        const { categories, filter } = req.body;
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: "Internal server error"})
    }
}