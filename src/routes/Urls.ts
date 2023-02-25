import { Router } from "express";

const router = Router();

router.get("/urls/open/:shortUrl");
router.post("/urls/shorten");
router.delete("/urls/:id");
router.get("/urls/:id");

export default router;
