import { Response } from 'express'
import { getDb } from '../config/database.js'
import { AuthenRequest } from '../middlewares/auth.js'
import { promises } from 'node:dns'
import { allowedNodeEnvironmentFlags } from 'node:process';

export const getProducts = async (req: AuthenRequest, res: Response): Promise<void> => {
    try {
        const db = await getDb();
        const products = await db.all(`
      SELECT p.*, c.name as category_name 
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      ORDER BY p.id DESC
    `);
    res.json(products);

    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch products' });
    }
};

export const getProductById = async (req: AuthenRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const db = await getDb();
        const product = await db.get(`
            SELECT p.*, c.name as category_name 
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.id = ?`, [id]);

      if (!product) {
        res.status(404).json({ message: "Product not found"});
        return;
      }

      res.json(product);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch product"});

    }
};

export const  createProduct = async (req: AuthenRequest, res: Response): Promise<void> => {
    try {
        const { sku, name, category_id, cost_price, sell_price, stock_quantity } = req.body;

        if (!sku || !name || !category_id) {
            res.status(400).json({ message: "SKU, Name, and Category ID are required"});
            return;
        }

        const db = await getDb();
        const result = await db.run(`INSERT INTO products (sku, name, category_id, cost_price, sell_price, stock_quantity)
      VALUES (?, ?, ?, ?, ?, ?)`, [sku, name, category_id, cost_price || 0, sell_price || 0, stock_quantity || 0]);

      // บันทึก Stock Log เริ่มต้น ถ้ามีจำนวนสต็อกตั้งต้น
      if (stock_quantity && stock_quantity > 0 && req.user) {
        await db.run(`
            INSERT INTO stock_logs (product_id, user_id, change_amount, reason)
        VALUES (?, ?, ?, ?)
            `, [result.lastID, req.user.userId, stock_quantity, 'Initial stock']);
      }

      res.status(201).json({
        message: "Product created successfully",
        productId: result.lastID,
      });
    } catch (error: any) {
        if (error?.message?.includes('UNIQUE constraint failed')) {
      res.status(400).json({ message: 'SKU already exists' });
      return;
    }
    res.status(500).json({ message: 'Failed to create product' });
  }
    
};

export const updateProduct = async (req: AuthenRequest, res: Response): Promise<void> => {
    try {
        const {id} = req.params;
        const { sku, name, category_id, cost_price, sell_price } = req.body;

        const db = await getDb();
        const product = await db.get('SELECT id FROM products WHERE id = ?', [id]);
        if (!product) {
            res.status(404).json({ message: 'Product not Found' });
            return;
        }
        
        await db.run(
            `
      UPDATE products 
      SET sku = ?, name = ?, category_id = ?, cost_price = ?, sell_price = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [sku, name, category_id, cost_price, sell_price, id]
        );

        res.json({ message: 'Product update successfully' });
    } catch (error: any) {
        res.status(500).json({ message: "Failed to update product" });
    }
};

export const adjustStock = async (req: AuthenRequest, res: Response): Promise<void> => {
    try {
        const {id} = req.params;
        const { change_amount, reason } = req.body;

        if (change_amount === undefined || !reason) {
            res.status(400).json({ message: "change_amount and reason are required"});
            return;
        }

        const db = await getDb();
        const product  = await db.get('SELECT stock_quantity FROM products WHERE id = ?', [id]);
        if (!product) {
            res.status(404).json({ message: "Product not found" });
            return;
        }

        const newQuantity = product.stock_quantity + change_amount;
        if (newQuantity < 0) {
            res.status(400).json({ message: 'Insufficient stock' });
            return;
        }

        // อัปเดตสต็อกสินค้า
        await db.run(
            `
      UPDATE products 
      SET stock_quantity = ?, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `, [newQuantity, id]);

    await db.run(
        `
      INSERT INTO stock_logs (product_id, user_id, change_amount, reason)
      VALUES (?, ?, ?, ?)
    `, [id, req.user!.userId, change_amount, reason]);

    res.json({
        message: 'Stock adjusted successfully',
        previousStock: product.stock_quantity,
        newStock: newQuantity,
    });
    } catch (error) {
        res.status(500).json({ message: "Failed to adjust stock"});
    }
};

export const getStockLogs = async (req: AuthenRequest, res: Response):Promise<void> => {
    try {
        const db = await getDb();
        const logs = await db.all(`
            SELECT sl.*, p.name as product_name, p.sku, u.full_name as user_name
      FROM stock_logs sl
      JOIN products p ON sl.product_id = p.id
      JOIN users u ON sl.user_id = u.id
      ORDER BY sl.id DESC
            `);
            res.json(logs);
    } catch (error) {
        res.status(500).json({ message: "Failed to adjust stock" });
    }
};

export const deleteProduct = async (req: AuthenRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const db = await getDb();

        await db.run('DELETE FROM products WHERE id = ?', [id]);
        res.json({ message: "Product delete successfully" });

    } catch (error) {
        res.status(500).json({ message: 'Failed to delete product' });
    }
}

