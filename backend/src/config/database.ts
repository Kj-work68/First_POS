import sqlite3 from "sqlite3";
import { open, Database} from 'sqlite';
import path from "path";
import { hashPassword } from "../utils/security.js";

let dbInstance: Database | null = null;

export const getDb = async (): Promise<Database> => {
  if (dbInstance) return dbInstance;

  console.log('Opening SQLite file at:', path.join(process.cwd(), 'database.sqlite'));

  dbInstance = await open({
    filename: path.join(process.cwd(), 'database.sqlite'),
    driver: sqlite3.Database,
  });

  // เปิดใช้งาน Foreign Key Constraints ใน SQLite
  await dbInstance.run('PRAGMA foreign_keys = ON;');

  await initTables(dbInstance);
  return dbInstance;
};

const initTables = async (db: Database) => {
  // 1. Roles Table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS roles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      description TEXT
    );
  `);

  // 2. Users Table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      full_name TEXT NOT NULL,
      role_id INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (role_id) REFERENCES roles (id)
    );
  `);

  // 3. Categories Table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 4. Products Table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sku TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      category_id INTEGER NOT NULL,
      cost_price REAL NOT NULL DEFAULT 0.0,
      sell_price REAL NOT NULL DEFAULT 0.0,
      stock_quantity INTEGER NOT NULL DEFAULT 0,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (category_id) REFERENCES categories (id)
    );
  `);

  // 5. Stock Logs Table (สำหรับบันทึกการปรับปรุงสต็อก - Audit Log)
  await db.exec(`
    CREATE TABLE IF NOT EXISTS stock_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      change_amount INTEGER NOT NULL, -- เช่น +10 หรือ -5
      reason TEXT NOT NULL,           -- เช่น 'Stock In', 'Damaged', 'Correction'
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (product_id) REFERENCES products (id),
      FOREIGN KEY (user_id) REFERENCES users (id)
    );
  `);

  // 6. Sales Table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS sales (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      total_amount REAL NOT NULL,
      paid_amount REAL NOT NULL,
      change_amount REAL NOT NULL,
      payment_method TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

// 7. Sale Items Table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS sale_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sale_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      quantity INTEGER NOT NULL,
      price REAL NOT NULL,
      FOREIGN KEY (sale_id) REFERENCES sales (id) ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products (id)
    );
`);

  // Seed Default Roles & Owner User
  const roleCount = await db.get('SELECT COUNT(*) as count FROM roles');
  if (roleCount.count === 0) {
    await db.run("INSERT INTO roles (id, name, description) VALUES (1, 'Owner', 'Full system access');");
    await db.run("INSERT INTO roles (id, name, description) VALUES (2, 'Stock', 'Inventory management');");
    await db.run("INSERT INTO roles (id, name, description) VALUES (3, 'Cashier', 'POS and sales creation');");

    // สร้าง Default Owner account (Username: admin / Password: adminpassword)
    const defaultPasswordHash = await hashPassword('adminpassword');
    const defaultPasswordHashUser = await hashPassword('password');
    const defaultPasswordHashStock = await hashPassword('1234');
    await db.run(
      `INSERT INTO users (username, password, full_name, role_id) VALUES (?, ?, ?, ?), (?, ?, ?, ?), (?, ?, ?, ?)`,
      [
        'admin', defaultPasswordHash, 'Store Owner', 1,
        'stock', defaultPasswordHashStock, 'Test Stock', 2,
        'user', defaultPasswordHashUser, 'Test User', 3
      ]
    );

    // Seed Sample Categories
    await db.run("INSERT INTO categories (name, description) VALUES ('General', 'General items');");
    await db.run("INSERT INTO categories (name, description) VALUES ('Beverages', 'Drinks and beverages');");

    console.log('Initialized default roles, admin user, and initial categories');
  }
};