import express from 'express';

const router = express.Router();
// import middlewares
import { requireSignin, isInstructor } from '../middlewares/index.js';

// import controllers
import { 
    uploadImage,
    removeImage,
    create
 } from '../controllers/course.js';
// import { sendEmail } from '../controllers/semails.js';

// import Multer middleware
const { upload } = require('../server.js');

// image
router.post('/course/upload-image', upload.single('image'), uploadImage);
router.post('/course/remove-image', removeImage);
// course
router.post('/course', requireSignin, isInstructor, create);

module.exports = router;