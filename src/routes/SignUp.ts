import validateBody from "../middlewares/validateBody";
import Users from "../controllers/UsersController";
import { Router } from "express";

const router = Router();

router.post("/signup", validateBody, Users.create);

export default router;
