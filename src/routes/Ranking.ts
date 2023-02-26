import User from "../controllers/UsersController";
import { Router } from "express";

const router = Router();

router.get("/ranking", User.getRanking);

export default router;
