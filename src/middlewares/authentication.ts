import repository from "../repositories/SessionRepository";
import { Request, Response, NextFunction } from "express";

const authentication = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.header("authorization")?.replace(/(Bearer )/g, "");
  try {
    const result = await repository.getOne(token);
    if (!result?.rowCount) return res.sendStatus(401);
    res.locals.session = result.rows[0];
    next();
  } catch ({ message }) {
    console.log(message);
    res.status(500).json(message);
  }
};

export default authentication;
