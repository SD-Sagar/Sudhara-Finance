const multer = require('multer');

// Configure multer to use memory storage since we upload directly to Cloudinary
const storage = multer.memoryStorage();

const upload = multer({
    storage,
    limits: {
        fileSize: 150 * 1024, // 150 KB limit as per requirements
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png|pdf|doc|docx)$/i)) {
            return cb(new Error('Please upload an image or PDF/Word document'));
        }
        cb(undefined, true);
    }
});

module.exports = upload;
