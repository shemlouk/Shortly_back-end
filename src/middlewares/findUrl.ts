import { Request, Response, NextFunction } from "express";
import db from "../config/database";

const findUrl = async (req: Request, res: Response, next: NextFunction) => {
  const { id, shortUrl } = req.params;
  try {
    const { rows, rowCount } = await db.query(
      'SELECT * FROM urls WHERE id = $1 OR "shortUrl" = $2',
      [id, shortUrl]
    );
    if (!rowCount) return res.sendStatus(404);
    res.locals = { url: rows[0] };
    next();
  } catch ({ message }) {
    console.log(message);
    res.status(500).json(message);
  }
};

export default findUrl;
