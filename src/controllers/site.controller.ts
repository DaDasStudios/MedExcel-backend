import { Response, Request } from 'express';
import { RequestUser } from '../@types/RequestUser'
import fs from 'fs-extra'
import { uploadCloudFile } from '../lib/cloudinary'
import Site from '../models/Site';

export const updateImage = async (req: RequestUser, res: Response) => {
    try {
        const { image } = req.files
        const imgRes = await uploadCloudFile(image.tempFilePath, { public_id: "medexcel-logo" })
        await Site.findOneAndUpdate({
            name: "Medexcel",
            image: {
                url: imgRes.url,
                public_id: imgRes.id
            }
        })
        await fs.remove(image.tempFilePath)
        res.status(200).json({ message: "Website imaged updated", image: imgRes })
    } catch (error) {
        res.status(500).json({ message: "Internal server error" })
    }
}

export const getSite = async (req: Request, res: Response) => {
    try {
        const siteInformation = await Site.findOne({ name: "Medexcel" })
        const { name, image } = siteInformation
        res.status(200).json({
            name,
            image: {
                url: image.url
            }
        })
    } catch (error) {
        res.status(500).json({ message: "Internal server error" })
    }
}