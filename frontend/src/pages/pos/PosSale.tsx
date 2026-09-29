import React, { useState, useEffect, useRef } from 'react';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputNumber } from 'primereact/inputnumber';
import { Toast } from 'primereact/toast';
import { Tag } from 'primereact/tag';
import services from '../../services/axios';
import type { Product } from '../../types/inventory';
import type { CartItem } from '../../types/pos';
import './PosSale.css'

export const PosSale: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [search, setSearch] = useState<string>('');

    const [checkoutDialog, setCheckoutDialog] = useState<boolean>(false);
    const [paidAmount, setPaidAmount] = useState<number>(0);
    const [submitting, setSubmitting] = useState<boolean>(false);

    const toast = useRef<Toast>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);

    const fetchProducts = async () => {
        try {
            const res = await services.get('/products');
            setProducts(res.data);
            setFilteredProducts(res.data);
        } catch {
            toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Failed to load products'})
        }
    }

    useEffect(() => {
    fetchProducts();
  }, []);

  // กรองสินค้าตามการค้นหา/บาร์โค้ด
  useEffect(() => {
    if (!search.trim()) {
      setFilteredProducts(products);
      return;
    }
    const keyword = search.toLowerCase();
    const result = products.filter(
      (p) => p.name.toLowerCase().includes(keyword) || p.sku?.toLowerCase().includes(keyword)
    );
    setFilteredProducts(result);
  }, [search, products]);

  // ยิงบาร์โค้ดแล้วกด Enter เพิ่มเข้าตะกร้าทันที
  const handleBarcodeSubmit = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && filteredProducts.length === 1) {
      addToCart(filteredProducts[0]);
      setSearch('');
    }
  };

  // เพิ่มสินค้าเข้าตะกร้า
  const addToCart = (product: Product) => {
    if (product.stock_quantity <= 0) {
      toast.current?.show({ severity: 'warn', summary: 'Out of Stock', detail: 'Item is out of stock' });
      return;
    }

    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.product.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock_quantity) {
          toast.current?.show({ severity: 'warn', summary: 'Limit Reached', detail: 'Exceeds available stock' });
          return prevCart;
        }
        return prevCart.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1, subtotal: (item.quantity + 1) * item.product.sell_price }
            : item
        );
      }
      return [...prevCart, { product, quantity: 1, subtotal: product.sell_price }];
    });
  };

  // ปรับจำนวนสินค้าในตะกร้า
  const updateQuantity = (productId: number, delta: number) => {
    setCart((prevCart) =>
      prevCart
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            if (newQty > item.product.stock_quantity) {
              toast.current?.show({ severity: 'warn', summary: 'Limit Reached', detail: 'Exceeds available stock' });
              return item;
            }
            return newQty > 0
              ? { ...item, quantity: newQty, subtotal: newQty * item.product.sell_price }
              : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  // คำนวณราคารวม
  const totalAmount = cart.reduce((sum, item) => sum + item.subtotal, 0);
  const changeAmount = paidAmount - totalAmount;

  // เปิด Dialog ชำระเงิน
  const openCheckout = () => {
    if (cart.length === 0) return;
    setPaidAmount(totalAmount); // ตั้งค่าเริ่มต้นเงินที่จ่ายเท่ากับราคารวม
    setCheckoutDialog(true);
  };

  // ยืนยันการชำระเงิน
  const handleProcessPayment = async () => {
    if (paidAmount < totalAmount) {
      toast.current?.show({ severity: 'warn', summary: 'Insufficient Cash', detail: 'Paid amount is less than total' });
      return;
    }

    setSubmitting(true);
    try {
      await services.post('/sales', {
        items: cart.map((i) => ({
          product_id: i.product.id,
          quantity: i.quantity,
          price: i.product.sell_price,
        })),
        total_amount: totalAmount,
        paid_amount: paidAmount,
        change_amount: changeAmount,
        payment_method: 'Cash',
      });

      toast.current?.show({ severity: 'success', summary: 'Sale Complete', detail: 'Transaction successful' });
      setCart([]);
      setCheckoutDialog(false);
      fetchProducts(); // Refresh สต็อกใหม่
    } catch {
      toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Transaction failed' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="pos-wrapper">
      <Toast ref={toast} />

      {/* ฝั่งซ้าย: Catalog & Search */}
      <div className="pos-catalog">
        <div className="pos-search-bar">
          <InputText
            ref={searchInputRef}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleBarcodeSubmit}
            placeholder="Scan barcode or search product..."
            className="w-full"
            autoFocus
          />
        </div>

        <div className="product-grid">
          {filteredProducts.map((product) => (
            <div key={product.id} className="product-card" onClick={() => addToCart(product)}>
              <div>
                <div className="p-title">{product.name}</div>
                <div className="p-stock">SKU: {product.sku}</div>
              </div>
              <div style={{ marginTop: '0.5rem' }}>
                <div className="p-price">฿{product.sell_price.toLocaleString()}</div>
                <Tag
                  severity={product.stock_quantity > 0 ? 'success' : 'danger'}
                  value={`Stock: ${product.stock_quantity}`}
                  style={{ fontSize: '0.7rem' }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ฝั่งขวา: Cart */}
      <div className="pos-cart">
        <h3>Current Order</h3>

        <div className="cart-items">
          {cart.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--text)', marginTop: '2rem' }}>Cart is empty</div>
          ) : (
            cart.map((item) => (
              <div key={item.product.id} className="cart-item-row">
                <div>
                  <div style={{ fontWeight: 600 }}>{item.product.name}</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text)' }}>
                    ฿{item.product.sell_price} x {item.quantity}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Button icon="pi pi-minus" rounded text onClick={() => updateQuantity(item.product.id, -1)} />
                  <span style={{ fontWeight: 600 }}>{item.quantity}</span>
                  <Button icon="pi pi-plus" rounded text onClick={() => updateQuantity(item.product.id, 1)} />
                  <span style={{ fontWeight: 700, minWidth: '60px', textAlign: 'right' }}>
                    ฿{item.subtotal.toLocaleString()}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="cart-summary">
          <div className="summary-row total">
            <span>Total</span>
            <span>฿{totalAmount.toLocaleString()}</span>
          </div>
          <Button
            label="Checkout"
            icon="pi pi-shopping-bag"
            severity="success"
            size="large"
            disabled={cart.length === 0}
            onClick={openCheckout}
            style={{ marginTop: '0.5rem' }}
          />
        </div>
      </div>

      {/* Modal ชำระเงิน */}
      <Dialog
        header="Checkout Payment"
        visible={checkoutDialog}
        style={{ width: '400px' }}
        onHide={() => setCheckoutDialog(false)}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', paddingTop: '0.5rem' }}>
          <div>
            <label style={{ fontSize: '0.9rem', color: 'var(--text)' }}>Total Amount</label>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent)' }}>
              ฿{totalAmount.toLocaleString()}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label htmlFor="paid">Cash Received (฿)</label>
            <InputNumber
              id="paid"
              value={paidAmount}
              onValueChange={(e) => setPaidAmount(e.value || 0)}
              mode="decimal"
              minFractionDigits={2}
              className="w-full"
              autoFocus
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.1rem', fontWeight: 700 }}>
            <span>Change:</span>
            <span style={{ color: changeAmount >= 0 ? '#137333' : '#c5221f' }}>
              ฿{changeAmount >= 0 ? changeAmount.toLocaleString() : '0'}
            </span>
          </div>

          <Button
            label="Confirm Payment"
            icon="pi pi-check"
            severity="success"
            loading={submitting}
            onClick={handleProcessPayment}
            disabled={paidAmount < totalAmount}
          />
        </div>
      </Dialog>
    </div>
  );
}

export default PosSale;
