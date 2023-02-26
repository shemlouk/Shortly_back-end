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
}

export default new UserController();
