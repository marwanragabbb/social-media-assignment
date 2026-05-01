import passport from 'passport';
import { Strategy as GoogleStrategy, Profile } from 'passport-google-oauth20';
import UserModel from '../models/user.model';
import { env } from './env';
import { passwordService } from '../services/password.service';

passport.use(
  new GoogleStrategy(
    {
      clientID: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      callbackURL: env.GOOGLE_CALLBACK_URL,
    },
    async (_accessToken: string, _refreshToken: string, profile: Profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;
        if (!email) {
          return done(new Error('Google account did not provide an email'), undefined);
        }

        const hashedPassword = await passwordService.hashPassword(Math.random().toString(36).slice(-10));
        const user = await UserModel.findOneAndUpdate(
          { email },
          {
            googleId: profile.id,
            isVerified: true,
            name: profile.displayName,
            password: hashedPassword,
          },
          { upsert: true, new: true, setDefaultsOnInsert: true }
        ).exec();

        return done(null, user);
      } catch (error) {
        return done(error as Error, undefined);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, (user as { id: string }).id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await UserModel.findById(id).exec();
    done(null, user);
  } catch (error) {
    done(error as Error);
  }
});
