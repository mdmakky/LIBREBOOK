import express from 'express';
import { register, login, verifyEmail,logout, getUser,forgetPassword, resetPasswordUpdate, passwordUpdate  } from '../controllers/auth.controller.js';
import { isAuthenticated } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/verify-email', verifyEmail); 
router.post('/password/forgot', forgetPassword);
router.put('/password/reset/:token', resetPasswordUpdate);
router.put('/password/update', isAuthenticated, passwordUpdate);
router.get('/logout', logout);
router.get('/me', isAuthenticated, getUser);
export default router;