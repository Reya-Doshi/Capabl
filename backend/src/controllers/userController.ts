import prisma from "../config/db.js";
import bcrypt from "bcrypt";



/* GET USER PROFILE */

export const getUserProfile = async (req: any, res: any) => {

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

    res.status(200).json(user);

  } catch (error: any) {

    res.status(500).json({
      message: error.message,
    });

  }

};



/* UPDATE PROFILE */

export const updateUserProfile = async (req: any, res: any) => {

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

  } catch (error: any) {

    res.status(500).json({
      message: error.message,
    });

  }

};



/* CHANGE PASSWORD */

export const changePassword = async (req: any, res: any) => {

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

    if (!user) {

      return res.status(404).json({
        message: "User not found",
      });

    }

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

  } catch (error: any) {

    res.status(500).json({
      message: error.message,
    });

  }

};



/* DELETE ACCOUNT */

export const deleteAccount = async (req: any, res: any) => {

  try {

    const user = await prisma.user.findUnique({

      where: {
        id: req.user.id,
      },

    });

    if (!user) {

      return res.status(404).json({
        message: "User not found",
      });

    }

    await prisma.user.delete({

      where: {
        id: req.user.id,
      },

    });

    res.status(200).json({
      message: "Account deleted successfully",
    });

  } catch (error: any) {

    res.status(500).json({
      message: error.message,
    });

  }

};
