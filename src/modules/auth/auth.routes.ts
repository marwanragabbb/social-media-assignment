import { Router } from 'express';
import passport from 'passport';
import { authController } from './auth.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { authorize } from '../../middlewares/authorization.middleware';

const router = Router();

router.post('/signup', (req, res, next) => authController.signup(req, res, next));
router.post('/confirm-email', (req, res, next) => authController.confirmEmail(req, res, next));
router.post('/login', (req, res, next) => authController.login(req, res, next));
router.post('/forgot-password', (req, res, next) => authController.forgotPassword(req, res, next));
router.post('/reset-password', (req, res, next) => authController.resetPassword(req, res, next));
router.post('/google/token', (req, res, next) => authController.googleTokenLogin(req, res, next));
router.post('/update-password', authMiddleware, authorize('user', 'admin'), (req, res, next) => authController.updatePassword(req, res, next));
router.post('/logout', authMiddleware, (req, res, next) => authController.logout(req, res, next));

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get(
  '/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/api/auth/google/failure' }),
  (req, res, next) => authController.googleAuthCallback(req, res, next)
);

router.get('/google/failure', (req, res) => {
  res.status(401).json({ message: 'Google authentication failed' });
});

export default router;
