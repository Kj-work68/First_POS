import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET!;
const SALT_ROUNDS = parseInt(process.env.SALT_ROUNDS!, 10);


export interface TokenPayload {
    userId: number;
    username: string;
    role: string;
}

export const hashPassword = async (password: string): Promise<string> => {
    const salt = await bcrypt.genSalt(SALT_ROUNDS);
    // console.log("SALT Value: ", SALT_ROUNDS);
    return bcrypt.hash(password,salt);
};

export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
    return bcrypt.compare(password, hash);
};

export const generateToken = (payload: TokenPayload): string => {
    return jwt.sign(payload, JWT_SECRET, {
        algorithm: 'HS512',
        expiresIn: process.env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn']
    });
};

export const verifyToken = (token:string): TokenPayload => {
    return jwt.verify(token, JWT_SECRET, {
        algorithms: ['HS512'],
    }) as TokenPayload;
};
