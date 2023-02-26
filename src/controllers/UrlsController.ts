import { customAlphabet, urlAlphabet } from "nanoid";
import { Request, Response } from "express";
import db from "../config/database";

const nanoid = customAlphabet(urlAlphabet, 8);

class UrlsController {
  async create(req: Request, res: Response) {
    const { userId } = res.locals.session;
    const { url } = req.body;
    const shortUrl = nanoid();
    try {
      await db.query(
        'INSERT INTO urls (url, "shortUrl", "userId") VALUES ($1, $2, $3)',
        [url, shortUrl, userId]
      );
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
    const { id, url, shortUrl } = res.locals.url;
    res.send({ id, url, shortUrl });
  }
  async openUrl(req: Request, res: Response) {
    const { id, url } = res.locals.url;
    await db.query(
      'UPDATE urls SET "visitCount" = "visitCount" + 1 WHERE id = $1',
      [id]
    );
    res.redirect(url);
  }
  async delete(req: Request, res: Response) {
    const {
      url: { id },
      session: { userId },
    } = res.locals;
    const { rowCount } = await db.query(
      'DELETE FROM urls WHERE id = $1 AND "userId" = $2',
      [id, userId]
    );
    if (!rowCount) return res.sendStatus(401);
    res.sendStatus(204);
  }
}

export default new UrlsController();
