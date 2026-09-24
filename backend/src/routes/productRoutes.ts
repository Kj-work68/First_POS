import { Router } from "express";
import {
    getProducts,
  getProductById,
  createProduct,
  updateProduct,
  adjustStock,
  getStockLogs,
  deleteProduct,
} from '../controllers/product.js'
import { authenToken, authorizaRols } from "../middlewares/auth.js";

const router = Router();

router.use(authenToken);

// Cashier, Stock, Owner สามารถดูรายการสินค้าได้
router.get('/', getProducts);
router.get('/logs', authorizaRols('Owner', 'Stock'), getStockLogs);
router.get('/:id', getProductById);

// เฉพาะ Owner และ Stock เท่านั้นที่เพิ่ม/แก้ไข/ปรับสต็อกได้
router.post('/', authorizaRols('Owner', 'Stock'), createProduct);
router.put('/:id', authorizaRols('Owner', 'Stock'), updateProduct);
router.patch('/:id/stock', authorizaRols('Owner', 'Stock'), adjustStock);

router.delete('/:id', authorizaRols('Owner'), deleteProduct);

export default router;