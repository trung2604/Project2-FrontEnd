import React, { useState } from 'react';
import { Tabs, Card, DatePicker, Space } from 'antd';
import RevenueReport from '../components/reports/RevenueReport';
import OrderStatusReport from '../components/reports/OrderStatusReport';
import TopSellingBooksReport from '../components/reports/TopSellingBooksReport';
import CategoryReport from '../components/reports/CategoryReport';
import InventoryReport from '../components/reports/InventoryReport';

const { RangePicker } = DatePicker;

const ReportsPage = () => {
    const [activeTab, setActiveTab] = useState('revenue');
    const [dateRange, setDateRange] = useState([null, null]);
    const [loading, setLoading] = useState(false);

    const handleDateRangeChange = (dates) => {
        setDateRange(dates);
    };

    const items = [
        {
            key: 'revenue',
            label: 'Báo cáo doanh thu',
            children: <RevenueReport dateRange={dateRange} loading={loading} />
        },
        {
            key: 'order-status',
            label: 'Trạng thái đơn hàng',
            children: <OrderStatusReport dateRange={dateRange} loading={loading} />
        },
        {
            key: 'top-selling',
            label: 'Sách bán chạy',
            children: <TopSellingBooksReport dateRange={dateRange} loading={loading} />
        },
        {
            key: 'category',
            label: 'Báo cáo danh mục',
            children: <CategoryReport dateRange={dateRange} loading={loading} />
        },
        {
            key: 'inventory',
            label: 'Báo cáo tồn kho',
            children: <InventoryReport loading={loading} />
        }
    ];

    return (
        <div className="p-6">
            <Card>
                <Space direction="vertical" size="large" style={{ width: '100%' }}>
                    <div className="flex justify-between items-center">
                        <h1 className="text-2xl font-bold">Báo cáo thống kê</h1>
                        <RangePicker
                            onChange={handleDateRangeChange}
                            format="YYYY-MM-DD"
                            placeholder={['Ngày bắt đầu', 'Ngày kết thúc']}
                        />
                    </div>
                    <Tabs
                        activeKey={activeTab}
                        onChange={setActiveTab}
                        items={items}
                        size="large"
                    />
                </Space>
            </Card>
        </div>
    );
};

export default ReportsPage; 