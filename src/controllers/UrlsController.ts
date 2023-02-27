import { customAlphabet, urlAlphabet } from "nanoid";
import { Request, Response } from "express";
import db from "../config/database";
import repository from "../repositories/UrlRepository";

const nanoid = customAlphabet(urlAlphabet, 8);

class UrlsController {
  async create(req: Request, res: Response) {
    const { userId } = res.locals.session;
    const { url } = req.body;
    const shortUrl = nanoid();
    try {
      await repository.create(url, shortUrl, userId);
      const { id } = await repository.getOne(shortUrl);
      res.status(201).send({ id, shortUrl });
    } catch ({ message }) {
      console.error(message);
      res.status(500).json(message);
    }
  }
  async getById(req: Request, res: Response) {
    const { id, url, shortUrl } = res.locals.url;
    res.send({ id, url, shortUrl });
  }
  async openUrl(req: Request, res: Response) {
    const { id, url } = res.locals.url;
    await repository.updateVisitCount(id);
    res.redirect(url);
  }
  async delete(req: Request, res: Response) {
    const {
      url: { id },
      session: { userId },
    } = res.locals;
    const rowCount = await repository.delete(id, userId);
    if (!rowCount) return res.sendStatus(401);
    res.sendStatus(204);
  }
}

export default new UrlsController();
