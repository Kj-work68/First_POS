export interface User {
    id: number;
    username: string;
    fullName: string;
    role: 'Owner' | 'Stock' | 'Cashier';
}

export interface LoginResponse {
    message: string;
    token: string;
    user: User;
}