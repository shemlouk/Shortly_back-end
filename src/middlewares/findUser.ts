import { Request, Response, NextFunction } from "express";
import repository from "../repositories/UserRepository";

const findUser = async (req: Request, res: Response, next: NextFunction) => {
  const route = req.path.split("/")[1];
  const { email } = req.body;
  try {
    const { rows, rowCount } = (await repository.findOne(email)) ?? {};
    if (route === "signup") {
      if (rowCount) return res.sendStatus(409);
      next();
    } else {
      if (!rowCount) return res.sendStatus(401);
      res.locals = { user: rows?.[0] };
      next();
    }
  } catch ({ message }) {
    console.log(message);
    res.status(500).json(message);
  }
};

export default findUser;
