import jwt from "jsonwebtoken";
import prisma from "../config/db.js";

const protect = async (req: any, res: any, next: any) => {

  let token;

  console.log("Auth middleware triggered");

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {

    try {

      token = req.headers.authorization.split(" ")[1];

      const decoded: any = jwt.verify(
        token,
        process.env.JWT_SECRET as string
      );

      req.user = await prisma.user.findUnique({
        where: {
          id: decoded.id,
        },
      });

      next();

    } catch (error) {

      console.log(error);

      res.status(401).json({
        message: "Not authorized",
      });

    }

  } else {

    res.status(401).json({
      message: "No token",
    });

  }
};

export default protect;
