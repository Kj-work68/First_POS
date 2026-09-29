import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  type ChartOptions,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import { Card } from 'primereact/card';
import services from '../../services/axios';
import './Dashboard.css';

// 1. ต้อง Register โมดูลที่ต้องการใช้ของ Chart.js เสมอ
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export const Dashboard: React.FC = () => {
  const [salesChartData, setSalesChartData] = useState<any>({
    labels: [],
    datasets: [],
  });
  const [categoryChartData, setCategoryChartData] = useState<any>({
    labels: [],
    datasets: [],
  });

  const [barOptions, setBarOptions] = useState<ChartOptions<'bar'>>({});
  const [doughnutOptions, setDoughnutOptions] = useState<ChartOptions<'doughnut'>>({});

  useEffect(() => {
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--text-color') || '#495057';
    const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary') || '#6c757d';
    const surfaceBorder = documentStyle.getPropertyValue('--surface-border') || '#dfe7ef';

    // ข้อมูลยอดขายรายวัน (Bar Chart)
    setSalesChartData({
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      datasets: [
        {
          label: 'Total Sales (฿)',
          backgroundColor: '#6366F1',
          borderColor: '#6366F1',
          borderRadius: 6,
          data: [1200, 2100, 1800, 2400, 3200, 4500, 3800],
        },
      ],
    });

    // ข้อมูลสัดส่วนหมวดหมู่ (Doughnut Chart)
    setCategoryChartData({
      labels: ['Beverages', 'General', 'Snacks'],
      datasets: [
        {
          data: [300, 500, 100],
          backgroundColor: ['#10B981', '#3B82F6', '#F59E0B'],
          hoverBackgroundColor: ['#059669', '#2563EB', '#D97706'],
        },
      ],
    });

    // Options สำหรับ Bar Chart
    setBarOptions({
      responsive: true,
      maintainAspectRatio: false, // เปิดให้ยืดหดตาม .chart-container ใน CSS
      plugins: {
        legend: {
          labels: { color: textColor },
        },
      },
      scales: {
        x: {
          ticks: { color: textColorSecondary },
          grid: { color: surfaceBorder },
        },
        y: {
          ticks: { color: textColorSecondary },
          grid: { color: surfaceBorder },
        },
      },
    });

    // Options สำหรับ Doughnut Chart
    setDoughnutOptions({
      responsive: true,
      maintainAspectRatio: false, // เปิดให้ยืดหดตาม .chart-container ใน CSS
      plugins: {
        legend: {
          position: 'top',
          labels: { color: textColor },
        },
      },
    });
  }, []);

  return (
    <div className="dashboard-container">
      <h2 className="dashboard-title">POS Sales Dashboard</h2>

      <div className="dashboard-grid">
        {/* กราฟแท่งยอดขาย */}
        <Card title="Daily Sales Summary">
          <div className="chart-container">
            {salesChartData.labels.length > 0 && (
              <Bar data={salesChartData} options={barOptions} />
            )}
          </div>
        </Card>

        {/* กราฟวงกลมหมวดหมู่ */}
        <Card title="Sales by Category">
          <div className="chart-container">
            {categoryChartData.labels.length > 0 && (
              <Doughnut data={categoryChartData} options={doughnutOptions} />
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;