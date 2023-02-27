import { Request, Response, NextFunction } from "express";
import repository from "../repositories/UrlRepository";

const findUrl = async (req: Request, res: Response, next: NextFunction) => {
  const { id, shortUrl } = req.params;
  try {
    const { rows, rowCount } =
      (await repository.findOne(Number(id), shortUrl)) ?? {};
    if (!rowCount) return res.sendStatus(404);
    res.locals.url = rows?.[0];
    next();
  } catch ({ message }) {
    console.log(message);
    res.status(500).json(message);
  }
};

export default findUrl;
