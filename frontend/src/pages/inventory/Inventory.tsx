import React, { useState, useEffect, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { Dropdown } from 'primereact/dropdown';
import { Dialog } from 'primereact/dialog';
import { Toast } from 'primereact/toast';
import { Tag } from 'primereact/tag';
import { Paginator } from 'primereact/paginator';

import services from '../../services/axios';
import type { Product, Category, ProductFormData } from '../../types/inventory';
// import './Inventory.css';

const initialForm: ProductFormData = {
  sku: '',
  name: '',
  category_id: null,
  sell_price: 0,
  cost_price: 0,
  stock_quantity: 0,
  min_stock_alert: 5,
};

export const Inventory: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [globalFilter, setGlobalFilter] = useState<string>('');

  const [productDialog, setProductDialog] = useState<boolean>(false);
  const [formData, setFormData] = useState<ProductFormData>(initialForm);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [saving, setSaving] = useState<boolean>(false);

  const toast = useRef<Toast>(null);
  const [first, setFirst] = useState<number>(0);
  const [rows, setRows] = useState<number>(5);

  const onPageChange = (e: any) => {
    setFirst(e.first);
    setRows(e.rows);
  };

  // ดึงข้อมูลสินค้าและหมวดหมู่
  const fetchData = async () => {
    setLoading(true);
    try {
      const [resProducts, resCategories] = await Promise.all([
        services.get<Product[]>('/products'),
        services.get<Category[]>('/categories'),
      ]);
      setProducts(resProducts.data);
      setCategories(resCategories.data);
    } catch (error: any) {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to fetch inventory data',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openNew = () => {
    setFormData(initialForm);
    setSelectedProductId(null);
    setProductDialog(true);
  };

  const openEdit = (product: Product) => {
    setFormData({
      sku: product.sku,
      name: product.name,
      category_id: product.category_id,
      sell_price: product.sell_price,
      cost_price: product.cost_price,
      stock_quantity: product.stock_quantity,
      min_stock_alert: product.min_stock_alert,
    });
    setSelectedProductId(product.id);
    setProductDialog(true);
  };

  const handleSave = async () => {
    if (!formData.sku || !formData.name || !formData.category_id) {
      toast.current?.show({
        severity: 'warn',
        summary: 'Warning',
        detail: 'Please fill in required fields',
      });
      return;
    }

    setSaving(true);
    try {
      if (selectedProductId) {
        // Update Product
        await services.put(`/products/${selectedProductId}`, formData);
        toast.current?.show({
          severity: 'success',
          summary: 'Success',
          detail: 'Product updated successfully',
        });
      } else {
        // Create Product
        await services.post('/products', formData);
        toast.current?.show({
          severity: 'success',
          summary: 'Success',
          detail: 'Product created successfully',
        });
      }
      setProductDialog(false);
      fetchData();
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Save operation failed';
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: errorMsg,
      });
    } finally {
      setSaving(false);
    }
  };

  // Render Status badge สำหรับสต็อก
  const stockBodyTemplate = (rowData: Product) => {
    const isLow = rowData.stock_quantity <= rowData.min_stock_alert;
    return (
      <Tag
        value={`${rowData.stock_quantity} units`}
        severity={isLow ? 'danger' : 'success'}
      />
    );
  };

  // Render ปุ่มจัดการในตาราง
  const actionBodyTemplate = (rowData: Product) => {
    return (
      <Button
        icon="pi pi-pencil"
        rounded
        outlined
        severity="info"
        onClick={() => openEdit(rowData)}
      />
    );
  };

  const header = (
    <div className="table-header">
      <span className="p-input-icon-left">
        <InputText
          type="search"
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          placeholder="Search products..."
        />
      </span>
      <Button
        label="Add New Product"
        icon="pi pi-plus"
        severity="success"
        onClick={openNew}
      />
    </div>
  );

  return (
    <div className="inventory-container">
      <Toast ref={toast} />

      <div className="inventory-header">
        <h2>Inventory Management</h2>
      </div>

      <DataTable
        value={products.slice(first, first + rows)}
        first={first}
        rows={rows}
        loading={loading}
        header={header}
        globalFilter={globalFilter}
        emptyMessage="No products found."
        responsiveLayout="scroll"
      >
        {/* <Column field="code" header="Barcode/Code" sortable /> */}
        <Column field="name" header="Name" sortable />
        <Column field="category_name" header="Category" sortable />
        <Column
          field="price"
          header="Price"
          body={(row: Product) => `฿${(row.sell_price ?? 0).toLocaleString()}`}
          sortable
        />
        <Column
          field="cost"
          header="Cost"
          body={(row: Product) => `฿${(row.cost_price ?? 0).toLocaleString()}`}
          sortable
        />
        <Column header="Stock" body={stockBodyTemplate} sortable />
        <Column body={actionBodyTemplate} exportable={false} style={{ width: '5rem' }} />
      </DataTable>

      <Paginator
        first={first}
        rows={rows}
        totalRecords={products.length}
        rowsPerPageOptions={[5, 10, 20, 30]}
        onPageChange={onPageChange}
        style={{ justifyContent: 'flex-end' }}
      />

      {/* Modal Dialog สำหรับเพิ่ม/แก้ไข สินค้า */}
      <Dialog
        visible={productDialog}
        style={{ width: '450px' }}
        header={selectedProductId ? 'Edit Product' : 'Add New Product'}
        modal
        className="p-fluid"
        onHide={() => setProductDialog(false)}
      >
        <div className="dialog-form">
          {/* <div className="form-field">
            <label htmlFor="code">Barcode / Product Code *</label>
            <InputText
              id="code"
              value={formData.sku}
              onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
              placeholder="e.g. 885123456789"
            />
          </div> */}

          <div className="form-field">
            <label htmlFor="sku">SKU*</label>
              <InputText
                id="sku"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                placeholder="e.g. 885123456789"
            />
          </div>

          <div className="form-field">
            <label htmlFor="name">Product Name *</label>
            <InputText
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter product name"
            />
          </div>

          <div className="form-field">
            <label htmlFor="category">Category *</label>
            <Dropdown
              id="category"
              value={formData.category_id}
              options={categories}
              optionLabel="name"
              optionValue="id"
              onChange={(e) => setFormData({ ...formData, category_id: e.value })}
              placeholder="Select a Category"
            />
          </div>

          <div className="form-grid">
            <div className="form-field">
              <label htmlFor="cost">Cost Price (฿)</label>
              <InputNumber
                id="cost"
                value={formData.cost_price}
                onValueChange={(e) => setFormData({ ...formData, cost_price: e.value || 0 })}
                mode="decimal"
                minFractionDigits={2}
              />
            </div>

            <div className="form-field">
              <label htmlFor="price">Selling Price (฿) *</label>
              <InputNumber
                id="price"
                value={formData.sell_price}
                onValueChange={(e) => setFormData({ ...formData, sell_price: e.value || 0 })}
                mode="decimal"
                minFractionDigits={2}
              />
            </div>
          </div>

          <div className="form-grid">
            <div className="form-field">
              <label htmlFor="stock">Initial Stock</label>
              <InputNumber
                id="stock"
                value={formData.stock_quantity}
                onValueChange={(e) => setFormData({ ...formData, stock_quantity: e.value || 0 })}
                disabled={!!selectedProductId} // ถ้าเป็น Edit ให้ปรับผ่าน Stock Log แทน
              />
            </div>

            <div className="form-field">
              <label htmlFor="min_stock">Min Stock Alert</label>
              <InputNumber
                id="min_stock"
                value={formData.min_stock_alert}
                onValueChange={(e) => setFormData({ ...formData, min_stock_alert: e.value || 0 })}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
            <Button
              label="Cancel"
              icon="pi pi-times"
              outlined
              onClick={() => setProductDialog(false)}
            />
            <Button
              label="Save"
              icon="pi pi-check"
              loading={saving}
              onClick={handleSave}
            />
          </div>
        </div>
      </Dialog>
    </div>
  );
};

export default Inventory;