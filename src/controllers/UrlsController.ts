import { Request, Response } from "express";
import db from "../config/database";
import { nanoid } from "nanoid";

class UrlsController {
  async create(req: Request, res: Response) {
    const { url } = req.body;
    const shortUrl = nanoid();
    try {
      await db.query('INSERT INTO urls (url, "shortUrl") VALUES ($1, $2)', [
        url,
        shortUrl,
      ]);
      const { id } = (
        await db.query('SELECT id FROM urls WHERE "shortUrl" = $1', [shortUrl])
      ).rows[0];
      res.status(201).send({ id, shortUrl });
    } catch ({ message }) {
      console.log(message);
      res.status(500).json(message);
    }
  }
  async getById(req: Request, res: Response) {
    const data = res.locals.url;
    delete data.createdAt;
    delete data.visitsCount;
    res.send(data);
  }
  async openUrl(req: Request, res: Response) {
    const { id, url } = res.locals.url;
    await db.query(
      'UPDATE urls SET "visitsCount" = "visitsCount" + 1 WHERE id = $1',
      [id]
    );
    res.redirect(url);
  }
}

export default new UrlsController();
