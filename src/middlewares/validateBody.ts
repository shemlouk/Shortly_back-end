import { Request, Response, NextFunction } from "express";
import Schemas from "../schemas/index";

const validateBody = (req: Request, res: Response, next: NextFunction) => {
  const route = req.path.split("/")[1];
  const schema = Schemas[route];
  try {
    const parse = schema().safeParse(req.body);
    if (!parse.success) return res.status(422).send(parse.error.issues);
    next();
  } catch ({ message }) {
    console.log(message);
    res.status(500).json(message);
  }
};

export default validateBody;
