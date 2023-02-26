import { Request, Response, NextFunction } from "express";
import db from "../config/database";

const authentication = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.header("authorization")?.replace(/(Bearer )/g, "");
  try {
    const { rowCount } = await db.query(
      "SELECT * FROM sessions WHERE token = $1",
      [token]
    );
    if (!rowCount) return res.sendStatus(401);
    next();
  } catch ({ message }) {
    console.log(message);
    res.status(500).json(message);
  }
};

export default authentication;
