import type { Product } from "./inventory";

export interface CartItem {
    product: Product;
    quantity: number;
    subtotal: number;
}

export interface CheckoutPayload {
    items: {
        product_id: number;
        quantity: number;
        price: number;
    }[];
    total_amount: number;
    paid_amount: number;
    change_amount: number;
    payment_method: 'Cash' | 'PromptPay' | 'CreditCard';
}