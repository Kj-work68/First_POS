import { Router } from "express";
import { getCategories, createCategory } from "../controllers/category.js";
import { authenToken, authorizaRols } from "../middlewares/auth.js";

const router = Router();

router.use(authenToken);

router.get('/', getCategories);
router.post('/', authorizaRols('Owner', 'Stock'), createCategory);

export default router;