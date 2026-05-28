import passport from "passport";

import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      callbackURL: "http://localhost:5000/api/auth/google/callback",
    },

    async (accessToken: string, refreshToken: string, profile: any, done: any) => {

  try {

    const email = profile.emails[0].value;

    let user: any = await prisma.user.findUnique({
      where: { email },
    });

    // IF USER DOESN'T EXIST → CREATE

    if (!user) {

      user = await prisma.user.create({

        data: {
          name: profile.displayName,
          email,
          password: "google-auth-user",
        },

      });

      user.isNewUser = true;

    } else {

      user.isNewUser = false;

    }

    return done(null, user);

  } catch (error) {

    return done(error, null);

  }

}

  )
);

export default passport;
