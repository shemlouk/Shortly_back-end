import authentication from "../middlewares/authentication";
import validateBody from "../middlewares/validateBody";
import Urls from "../controllers/UrlsController";
import findUrl from "../middlewares/findUrl";
import { Router } from "express";

const router = Router();

router.get("/urls/open/:shortUrl", findUrl, Urls.openUrl);
router.post("/urls/shorten", authentication, validateBody, Urls.create);
router.delete("/urls/:id");
router.get("/urls/:id", findUrl, Urls.getById);

export default router;
