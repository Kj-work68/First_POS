import { Response } from "express";
import { getDb } from "../config/database.js";
import { AuthenRequest } from "../middlewares/auth.js";

export const getCategories = async (req: AuthenRequest, res: Response): Promise<void> => {
  try {
    const db = await getDb();
    const categories = await db.all('SELECT * FROM categories ORDER BY id DESC');
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch categories' });
  }
};

export const createCategory = async (req: AuthenRequest, res: Response): Promise<void> => {
  try {
    const { name, description } = req.body;
    if (!name) {
      res.status(400).json({ message: 'Category name is required' });
      return; 
    }

    const db = await getDb();
    const result = await db.run(
      'INSERT INTO categories (name, description) VALUES (?, ?)',
      [name, description || '']
    );

    res.status(201).json({
      message: 'Category created successfully',
      categoryId: result.lastID,
    });
  } catch (error: any) {
    if (error?.message?.includes('UNIQUE constraint failed')) {
      res.status(400).json({ message: 'Category name already exists' });
      return;
    }
    res.status(500).json({ message: 'Failed to create category' });
  }
};
