import { Response, Request } from 'express';
import { RequestUser } from '../@types/RequestUser'
import fs from 'fs-extra'
import { uploadCloudFile } from '../lib/cloudinary'
import Site from '../models/Site';
import { ISubscription } from '../interfaces';
import { Types } from 'mongoose';

export const getSubscriptionPlans = async (req: RequestUser, res: Response) => {
    try {
        const siteInfo = await Site.findOne({ name: "Medexcel" })

        return res.status(200).json({
            subscriptionPlans: siteInfo.subscriptionPlans
        })
    } catch (error) {
        res.status(500).json({ message: "Internal server error" })
    }
}

export const deleteSubscriptionPlan = async (req: RequestUser, res: Response) => {
    try {
        const { id } = req.body;
        if (!id) return res.status(400).json({ message: "Uncompleted information" })
        const siteInfo = await Site.findOne({ name: "Medexcel" })
        const subscriptionPlans = siteInfo.subscriptionPlans

        siteInfo.subscriptionPlans = subscriptionPlans.filter(s => s._id != id)
        await siteInfo.save()

        return res.status(200).json({
            message: "Subscription deleted",
            subscription: subscriptionPlans.find(s => s._id == id)
        })
    } catch (error) {
        res.status(500).json({ message: "Internal server error" })
    }
}

export const updateSubscriptionPlan = async (req: RequestUser, res: Response) => {
    try {
        const { id, name, description, points, price } = req.body;
        if (!id) return res.status(400).json({ message: "Uncompleted information" })

        if (!name || !description || !points || !price) return res.status(400).json({ message: "Uncompleted information" })

        const siteInfo = await Site.findOne({ name: "Medexcel" })
        const subscriptionPlans = siteInfo.subscriptionPlans
        const idx = subscriptionPlans.findIndex(s => s._id == id)
        subscriptionPlans[idx] = {
            _id: subscriptionPlans[idx]._id, 
            createdAt: subscriptionPlans[idx].createdAt,
            updatedAt: new Date(),
            name, 
            description, 
            points, 
            price,
        }

        siteInfo.subscriptionPlans = subscriptionPlans
        await siteInfo.save()
    
        return res.status(200).json({
            message: "Subscription updated",
            subscriptionPlans
        })
    } catch (error) {
        res.status(500).json({ message: "Internal server error" })
    }
}

export const createSubcriptionPlan = async (req: RequestUser, res: Response) => {
    try {
        const { name, description, points, price } = req.body as ISubscription
        if (!name || !description || !points || !price) return res.status(400).json({ message: "Uncompleted information" })

        const siteInfo = await Site.findOne({
            name: "Medexcel",
        })

        siteInfo.subscriptionPlans.push({
            _id: new Types.ObjectId().toString(),
            name, 
            description, 
            points, price, 
            createdAt: new Date(), 
            updatedAt: new Date()
        })

        const savedSiteInfo = await siteInfo.save()
        return res.status(200).json({
            message: "Subscription pushed",
            subscriptionsPlans: savedSiteInfo.subscriptionPlans
        })

    } catch (error) {
        res.status(500).json({ message: "Internal server error" })
    }
}

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
        const { name, image, subscriptionPlans } = siteInformation
        res.status(200).json({
            name,
            image: {
                url: image.url
            },
            subscriptionPlans
        })
    } catch (error) {
        res.status(500).json({ message: "Internal server error" })
    }
}