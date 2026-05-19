import prisma from "../config/db.js";

import bcrypt from "bcrypt";

import jwt from "jsonwebtoken";

const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET,
    {
      expiresIn: "30d",
    }
  );
};

export const registerUser = async (req, res) => {
  try {

    const { name, email, password } = req.body;

    const userExists = await prisma.user.findUnique({
      where: { email },
    });

    if (userExists) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    res.status(201).json({

  token: generateToken(user.id),

  user: {
    id: user.id,
    name: user.name,
    email: user.email,
    college: user.college,
    age: user.age,
    bio: user.bio,
    github: user.github,
    linkedin: user.linkedin,
    resume: user.resume,
    resumeName: user.resumeName,
    careerGoal: user.careerGoal,
    profilePic: user.profilePic,
  },

});

  } catch (error) {

    res.status(500).json({
      message: error.message,
    });

  }
};

export const loginUser = async (req, res) => {
  try {

    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (
      user &&
      (await bcrypt.compare(password, user.password))
    ) {

      res.status(200).json({

  token: generateToken(user.id),

  user: {
    id: user.id,
    name: user.name,
    email: user.email,
    college: user.college,
    age: user.age,
    bio: user.bio,
    github: user.github,
    linkedin: user.linkedin,
    resume: user.resume,
    resumeName: user.resumeName,
    careerGoal: user.careerGoal,
    profilePic: user.profilePic,
  },

});

    } else {

      res.status(401).json({
        message: "Invalid email or password",
      });

    }

  } catch (error) {

    res.status(500).json({
      message: error.message,
    });

  }
};