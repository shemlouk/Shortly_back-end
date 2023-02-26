import Sessions from "../controllers/SessionsController";
import validateBody from "../middlewares/validateBody";
import findUser from "../middlewares/findUser";
import { Router } from "express";

const router = Router();

router.post("/signin", validateBody, findUser, Sessions.create);

export default router;
