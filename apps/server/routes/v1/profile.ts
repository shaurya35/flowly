import express from "express";
import { getProfile } from "../../controllers/v1/profile";
import { isLoggedIn } from "../../middlewares/auth";

const router = express.Router();

router.get("/", isLoggedIn, getProfile);

export default router;



