import repository from "../repositories/UserRepository";
import { Request, Response } from "express";
import bcrypt, { hash } from "bcrypt";

const SALT_ROUNDS = 10;

class UserController {
  async create(req: Request, res: Response) {
    const { name, email, password } = req.body;
    try {
      const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
      await repository.create(name, email, hashedPassword);
      res.sendStatus(201);
    } catch ({ message }) {
      console.error(message);
      res.status(500).json(message);
    }
  }
  async getById(req: Request, res: Response) {
    const { userId } = res.locals.session;
    try {
      const result = await repository.getOne(userId);
      res.send(result);
    } catch ({ message }) {
      console.error(message);
      res.status(500).json(message);
    }
  }
  async getRanking(req: Request, res: Response) {
    try {
      const result = await repository.getMany();
      res.send(result);
    } catch ({ message }) {
      console.error(message);
      res.status(500).json(message);
    }
  }
}

export default new UserController();
