import authentication from "../middlewares/authentication";
import Users from "../controllers/UsersController";
import { Router } from "express";

const router = Router();

router.get("/users/me", authentication, Users.getById);

export default router;
