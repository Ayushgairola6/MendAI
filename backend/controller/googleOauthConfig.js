// neccessary dependencies for google Oauth 2.0
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import dotenv from "dotenv";
dotenv.config();
import jwt from 'jsonwebtoken'
passport.use(
  new GoogleStrategy(
    {
        clientID:process.env.GOOGLE_OAUTH_CLIENT_ID,
        clientSecret:process.env.GOOGLE_OAUTH_CLIENT_SECRET,
        callbackURL:process.env.GOOGLE_OAUTH_CALLBACK_URL
    },async(accessToken,refreshToken,Profile,done)=>{
      const user = {
        googleId: Profile.id,
        name: Profile.displayName,
        email: Profile.emails[0].value,
        avatar: Profile.photos[0].value,
      }
      const token = jwt.sign(user, process.env.JWT_SECRET, { expiresIn: "1h" });

      return done(null, { user, token });
    }
  )

)