import { Router } from "express";
import { login, getMe } from "../controllers/auth.js";
import { authenToken } from "../middlewares/auth.js";

const router = Router();

router.post('/login', login);
router.get('/me', authenToken, getMe);

export default router;