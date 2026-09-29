import { Router } from "express";
import { saleResult } from "../controllers/pos.js";
import { authenToken, authorizaRols } from "../middlewares/auth.js";

const router = Router();

router.post('/', authenToken, authorizaRols('Owner', 'Stock', 'Cashier'), saleResult);

export default router;