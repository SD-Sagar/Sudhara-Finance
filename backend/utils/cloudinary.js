const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadToCloudinary = async (fileBuffer, folder, originalname = '') => {
    return new Promise((resolve, reject) => {
        const options = { folder: folder, resource_type: 'auto' };
        
        if (originalname) {
            const ext = originalname.split('.').pop();
            options.public_id = `img_${Date.now()}_${Math.floor(Math.random() * 10000)}.${ext}`;
        }

        const uploadStream = cloudinary.uploader.upload_stream(
            options,
            (error, result) => {
                if (error) {
                    console.error('Cloudinary Upload Error:', error);
                    reject(error);
                } else {
                    resolve(result.secure_url);
                }
            }
        );
        uploadStream.end(fileBuffer);
    });
};

module.exports = { uploadToCloudinary };
