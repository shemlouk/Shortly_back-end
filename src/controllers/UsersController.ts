import { Request, Response } from "express";
import db from "../config/database";
import bcrypt from "bcrypt";

const SALT_ROUNDS = 10;

class UserController {
  async create(req: Request, res: Response) {
    const { name, email, password } = req.body;
    try {
      const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
      await db.query(
        "INSERT INTO users (name, email, password) VALUES ($1, $2, $3)",
        [name, email, hashedPassword]
      );
      res.sendStatus(201);
    } catch ({ message }) {
      console.log(message);
      res.status(500).json(message);
    }
  }
  async getById(req: Request, res: Response) {
    const { userId } = res.locals.session;
    try {
      const { rows } = await db.query(
        `SELECT
            users.id,
            users.name,
            COALESCE(sum("visitCount"), 0) AS "visitCount",
            CASE
              WHEN bool_or(urls.id IS NOT NULL)
                THEN  json_agg(
                        json_build_object(
                          'id', urls.id,
                          'shortUrl', urls."shortUrl",
                          'url', urls.url,
                          'visitCount', urls."visitCount"
                        )
                      )
                ELSE array_to_json(array[]::json[])
            END AS "shortenedUrls"
        FROM users
        LEFT JOIN urls
        ON urls."userId" = users.id
        WHERE users.id = $1
        GROUP BY users.id, users.name`,
        [userId]
      );
      res.send(rows[0]);
    } catch ({ message }) {
      console.log(message);
      res.status(500).json(message);
    }
  }
}

export default new UserController();
