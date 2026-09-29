import express from "express";
import cors from 'cors';
import dotenv from 'dotenv';
import { getDb } from "./config/database.js";
import authRoutes from './routes/authRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import productRoutes from './routes/productRoutes.js'
import saleResultRoutes from './routes/posRoutes.js';

dotenv.config();

console.log('Starting Application Script...')

const app = express();
const PORT = process.env.PORT!

app.use(cors());
app.use(express.json());    

app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/sales', saleResultRoutes);

app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'SmartStore API is running' });
});

const startServer = async () => {
    try{
        await getDb();
        app.listen(PORT, () => {
            console.log(`Server listening on http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
    }
}

startServer();