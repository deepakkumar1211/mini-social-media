import { v2 as cloudinary } from 'cloudinary';
import streamifier from 'streamifier';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

/**
 * Uploads a buffer (from multer memoryStorage) to Cloudinary.
 * @param {Buffer} buffer
 * @param {string} folder - optional folder name
 * @returns {Promise<object>} - cloudinary response
 */
export const uploadBufferToCloudinary = (buffer, folder = 'mini_social_posts') => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
        { folder, resource_type: 'auto' },
        (error, result) => {
            if (error) return reject(error);
            resolve(result);
        }
        );
        streamifier.createReadStream(buffer).pipe(uploadStream);
    });
};

export default cloudinary;
