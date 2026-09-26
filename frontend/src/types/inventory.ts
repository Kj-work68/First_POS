export interface Category {
    id: number;
    name: string;
}

export interface Product {
    id: number;
    sku: string;
    name: string;
    category_id: number;
    category_name: string;
    sell_price: number;
    cost_price: number;
    stock_quantity: number;
    min_stock_alert: number;
    is_active: number;
}

export interface ProductFormData {
    sku: string;
    name: string;
    category_id: number | null;
    sell_price: number;
    cost_price: number;
    stock_quantity: number;
    min_stock_alert: number;
}

