import { request, Response } from "express";
import { RequestUser } from "../@types/RequestUser";
import { uploadCloudFile } from "../lib/cloudinary";
import Question from "../models/Question";
import fs from 'fs-extra'
import { IQuestion, SBAQuestion } from "../interfaces";

export const postQuestion = async (req: RequestUser, res: Response) => {
    try {
        const { type, content, explanation, scenario, category, subcategory } = req.body as IQuestion<SBAQuestion>
        if (!type || !content || !category || !explanation || !scenario) return res.status(400).json({ mesage: "Uncompleted information" })

        const newQuestion = new Question({
            type, content, explanation, scenario, category, subcategory
        })

        const savedQuestion = await newQuestion.save()
        console.log(savedQuestion)

        res.status(200).json({ message: "New question saved", question: savedQuestion })
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: "Internal server error" })
    }
}