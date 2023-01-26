import { UploadApiOptions, v2 as cloudinary } from 'cloudinary'
import { CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET, CLOUDINARY_CLOUD_NAME, NODE_ENV } from '../config'

const OPTIONS: UploadApiOptions = {
    folder: "MedExcel"
}

export const configureCloudinary = () => {
    cloudinary.config({
        api_secret: CLOUDINARY_API_SECRET,
        api_key: CLOUDINARY_API_KEY,
        secure: true,
        cloud_name: CLOUDINARY_CLOUD_NAME,
    })
    if (NODE_ENV === "development") {
        console.info(`>>> ☁️  Cloudinary configuration`, cloudinary.config())
    } else {
        console.info(`>>> ☁️  Cloudinary is connected`)
    }
}

export const deleteImage = (id: string) => {
    return cloudinary.uploader.destroy(id)
}

export const uploadImage = async (fileName: string, options?: UploadApiOptions) => {
    const response = await cloudinary.uploader.upload(fileName, {
        use_filename: true,
        overwrite: true,
        ...options,
        ...OPTIONS
    })

    return {
        url: response.url,
        secureUrl: response.secure_url,
        id: response.public_id,
        originalFilename: response.original_filename
    }
}

