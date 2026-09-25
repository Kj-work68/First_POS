import { Request, Response, NextFunction, response } from "express";
import { verifyToken, TokenPayload } from "../utils/security.js";

export interface AuthenRequest extends Request {
    user?: TokenPayload;
}

export const authenToken = (
    req: AuthenRequest,
    res: Response,
    next: NextFunction,
): void => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        res.status(401).json({ message: 'Access denied. No token provided.' });
        return;
    }

    try {
        const decoded = verifyToken(token);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(403).json({ message: 'Invalid or expired token.' });
        return;
    }
};

export const authorizaRols = (...allowedRoles: string[]) => {
    return (req: AuthenRequest, res: Response, next: NextFunction): void => {
        if (!req.user) {
            res.status(401).json({ message: 'Unauthenticated user.' });
            return;
        }

        if (!allowedRoles.includes(req.user.role)) {
            res.status(403).json({
                message: `Forbidden: Access restricted to roles [${allowedRoles.join(', ')}]`
            });
            return;
        }

        next();
    };
};