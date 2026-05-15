import prisma from "../config/db.js";

export const getUserProfile = async (req, res) => {

  try {

    const user = await prisma.user.findUnique({

      where: {
        id: req.user.id,
      },

      include: {
        aiAnalysis: true,
      },

    });

    if (!user) {

      return res.status(404).json({
        message: "User not found",
      });

    }

    res.status(200).json({
      user,
    });

  } catch (error) {

    res.status(500).json({
      message: error.message,
    });

  }

};

export const updateUserProfile = async (req, res) => {

  try {

    const {
      college,
      age,
      bio,
      github,
      linkedin,
      resume,
    } = req.body;

    const updatedUser = await prisma.user.update({

      where: {
        id: req.user.id,
      },

      data: {
        college,
        age: age ? Number(age) : null,
        bio,
        github,
        linkedin,
        resume,
      },

    });

    res.status(200).json(updatedUser);

  } catch (error) {

    res.status(500).json({
      message: error.message,
    });

  }

};
import bcrypt from "bcrypt";

export const changePassword = async (req, res) => {

  try {

    const {
      currentPassword,
      newPassword,
    } = req.body;

    const user = await prisma.user.findUnique({
      where: {
        id: req.user.id,
      },
    });

    const isMatch = await bcrypt.compare(
      currentPassword,
      user.password
    );

    if (!isMatch) {

      return res.status(400).json({
        message: "Current password is incorrect",
      });

    }

    const hashedPassword = await bcrypt.hash(
      newPassword,
      10
    );

    await prisma.user.update({

      where: {
        id: req.user.id,
      },

      data: {
        password: hashedPassword,
      },

    });

    res.status(200).json({
      message: "Password updated successfully",
    });

  } catch (error) {

    res.status(500).json({
      message: error.message,
    });

  }

};