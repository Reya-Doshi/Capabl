import express from "express";
import passport from "passport";
import jwt from "jsonwebtoken";

import {
  registerUser,
  loginUser,
} from "../controllers/authController.js";

const router = express.Router();


// NORMAL AUTH

router.post("/register", registerUser);

router.post("/login", loginUser);


// GOOGLE LOGIN

router.get(
  "/google",

  passport.authenticate("google", {
    scope: ["profile", "email"],
    prompt: "select_account",
  })
);


// GOOGLE CALLBACK

router.get(
  "/google/callback",

  passport.authenticate("google", {
    session: false,
  }),

  async (req: any, res: any) => {

    try {

      const token = jwt.sign(

        {
          id: req.user.id,
          email: req.user.email,
        },

        process.env.JWT_SECRET as string,

        {
          expiresIn: "7d",
        }

      );

      // EXISTING USER

      if (
        req.user?.college &&
        req.user?.careerGoal &&
        req.user?.resume
      ) {

        return res.redirect(
          `http://localhost:3000/google-success?token=${token}&type=dashboard&name=${req.user.name}&email=${req.user.email}`
        );

      }

      // NEW USER / INCOMPLETE PROFILE

      return res.redirect(
        `http://localhost:3000/google-success?token=${token}&type=onboarding&name=${req.user.name}&email=${req.user.email}`
      );

    } catch (error) {

      console.log(error);

      res.status(500).json({
        message: "Google authentication failed",
      });

    }

  }
);

export default router;
