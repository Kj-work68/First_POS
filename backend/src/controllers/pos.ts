import { Response } from "express";
import { getDb } from "../config/database.js";
import { AuthenRequest } from "../middlewares/auth.js";

export const saleResult = async (req: AuthenRequest, res: Response): Promise<void> => {
    const { items, total_amount, paid_amount, change_amount, payment_method } = req.body;
    try {
        const db = await getDb();
        const result = await db.run(
            `INSERT INTO sales (total_amount, paid_amount, change_amount, payment_method, created_at)
       VALUES (?, ?, ?, ?, DATETIME('now'))`,
      [total_amount, paid_amount, change_amount, payment_method]
        )
    const saleId = result.lastID; // ดึง ID บิลที่เพิ่ง Insert

    // 2. วนลูปบันทึก รายการสินค้า (Sales Items) และ ตัดสต็อกสินค้า
    for (const item of items) {
      // 2.1 บันทึกรายการสินค้าลง sale_items
      await db.run(
        `INSERT INTO sale_items (sale_id, product_id, quantity, price)
         VALUES (?, ?, ?, ?)`,
        [saleId, item.product_id, item.quantity, item.price]
      );

      // 2.2 ตัดสต็อกสินค้าคงเหลือในตาราง products
      await db.run(
        `UPDATE products 
         SET stock_quantity = stock_quantity - ? 
         WHERE id = ?`,
        [item.quantity, item.product_id]
      );
    }

    res.status(201).json({ 
      success: true, 
      message: 'Sale recorded successfully', 
      sale_id: saleId 
    });

  } catch (error) {
    console.error('Error processing sale:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to process transaction' 
    });
  }
}