import validateBody from "../middlewares/validateBody";
import Users from "../controllers/UsersController";
import findUser from "../middlewares/findUser";
import { Router } from "express";

const router = Router();

router.post("/signup", validateBody, findUser, Users.create);

export default router;
