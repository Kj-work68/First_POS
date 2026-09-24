import { Response } from "express";
import { getDb } from "../config/database.js";
import { comparePassword, generateToken } from "../utils/security.js";
import { AuthenRequest } from "../middlewares/auth.js";

export const login = async (req: AuthenRequest, res: Response): Promise<void> => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            res.status(400).json({ message: "Username and password are required." });
            return;
        }

        const db = await getDb();

        // ดึงข้อมูล User พร้อม JOIN Role Name
        const user = await db.get(
            `SELECT u.id, u.username, u.password, u.full_name, r.name as role
            FROM users u
            JOIN roles r ON u.role_id = r.id
            WHERE u.username = ?`,
            [username]
        );

        if (!user) {
            res.status(401).json({ message: "Invalid username" });
            return;
        }

        // Password Hash (Bcrypt)
        const isPasswordValid = await comparePassword(password, user.password);
        if (!isPasswordValid){
            res.status(401).json({ message: "Invalid password."});
            return;
        }

        const token = generateToken({
            userId: user.id,
            username: user.username,
            role: user.role,
        });

        res.json({
            message: "Login successfully",
            token,
            user: {
                id: user.id,
                username: user.username,
                fullName: user.full_name,
                role: user.role,
            }
        });
    } catch (error) {
        console.error("Login error :", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const getMe = async (req: AuthenRequest, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }

        const db = await getDb();
        const user = await db.get(
            `SELECT u.id, u.username, u.full_name, r.name as role 
       FROM users u 
       JOIN roles r ON u.role_id = r.id 
       WHERE u.id = ?`,
      [req.user.userId]
        );

        if(!user) {
            res.status(404).json({ message: "User not Found"});
            return;
        }

        res.json ({
            id: user.id,
            username: user.username,
            fullname: user.full_name,
            role: user.role,
        });
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
}