import express from 'express';

const router = express.Router();
// import middlewares
import { requireSignin } from '../middlewares/index.js';

// import controllers
import { 
    makeInstructor, 
    getAccountStatus, 
    currentInstructor ,
    instructorCourses
} from '../controllers/instructor.js';
// import { sendEmail } from '../controllers/semails.js';

router.post('/make-instructor', requireSignin, makeInstructor);
router.post('/get-account-status', requireSignin, getAccountStatus);
router.get('/current-instructor', requireSignin, currentInstructor);

router.get('/instructor-courses', requireSignin, instructorCourses);

module.exports = router;