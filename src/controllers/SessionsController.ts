import { Request, Response } from "express";
import db from "../config/database";
import { nanoid } from "nanoid";
import bcrypt from "bcrypt";

class SessionsController {
  async create(req: Request, res: Response) {
    const { password } = req.body;
    const { id: userId, password: userPassword } = res.locals.user;
    try {
      if (!bcrypt.compareSync(password, userPassword))
        return res.sendStatus(401);
      const token = nanoid();
      await db.query('INSERT INTO sessions ("userId", token) VALUES ($1, $2)', [
        userId,
        token,
      ]);
      res.send({ token });
    } catch ({ message }) {
      console.log(message);
      res.status(500).json(message);
    }
  }
}

export default new SessionsController();
