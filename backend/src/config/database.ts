import sqlite3 from "sqlite3";
import { open, Database} from 'sqlite';
import path from "path";
import { hashPassword } from "../utils/security.js";

let dbInstance: Database | null = null;

export const getDb = async (): Promise<Database> => {
  if (dbInstance) return dbInstance;

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
      password_hash TEXT NOT NULL,
      full_name TEXT NOT NULL,
      role_id INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (role_id) REFERENCES roles (id)
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
    await db.run(
      `INSERT INTO users (username, password_hash, full_name, role_id) VALUES (?, ?, ?, ?)`,
      ['admin', defaultPasswordHash, 'Store Owner', 1]
    );
    console.log('✅ Initialized default roles and admin user (admin / adminpassword)');
  }
};