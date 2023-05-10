import express from 'express';

const router = express.Router();
// import middlewares
import { requireSignin } from '../middlewares/index.js';

// import controllers
import { register, login, logout, currentUser, sendEmail, forgotPassword, resetPassword } from '../controllers/auth.js';
// import { sendEmail } from '../controllers/semails.js';

router.post('/register', register);
router.post('/login', login);
router.get('/logout', logout);
router.get('/current-user', requireSignin, currentUser);
router.get('/send-email', sendEmail);
// router.post('/sendEmail', sendEmail);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

module.exports = router;