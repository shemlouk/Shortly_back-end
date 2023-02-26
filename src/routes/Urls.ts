import authentication from "../middlewares/authentication";
import validateBody from "../middlewares/validateBody";
import Urls from "../controllers/UrlsController";
import { Router } from "express";

const router = Router();

router.get("/urls/open/:shortUrl");
router.post("/urls/shorten", authentication, validateBody, Urls.create);
router.delete("/urls/:id");
router.get("/urls/:id");

export default router;
