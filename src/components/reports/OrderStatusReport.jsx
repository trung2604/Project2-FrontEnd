import React, { useEffect, useState } from 'react';
import { Card, Table, Tag, Spin, message } from 'antd';
import { getOrderStatusReportAPI, ORDER_STATUS, ORDER_STATUS_LABELS } from '../../services/api-service';
import { formatCurrency } from '../../utils/format';

const OrderStatusReport = ({ dateRange, loading }) => {
    const [data, setData] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            if (!dateRange || !dateRange[0] || !dateRange[1]) return;

            try {
                const response = await getOrderStatusReportAPI(dateRange[0], dateRange[1]);
                if (response.success) {
                    setData(response.data || []);
                } else {
                    message.error(response.message);
                }
            } catch (error) {
                console.error('Error fetching order status report:', error);
                message.error(error.response?.message || 'Có lỗi xảy ra khi lấy báo cáo trạng thái đơn hàng');
            }
        };

        fetchData();
    }, [dateRange]);

    const columns = [
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (status) => (
                <Tag color={
                    status === ORDER_STATUS.PENDING ? 'warning' :
                        status === ORDER_STATUS.CONFIRMED ? 'processing' :
                            status === ORDER_STATUS.SHIPPING ? 'blue' :
                                status === ORDER_STATUS.DELIVERED ? 'success' :
                                    status === ORDER_STATUS.CANCELLED ? 'error' :
                                        status === ORDER_STATUS.REFUNDED ? 'default' : 'default'
                }>
                    {ORDER_STATUS_LABELS[status] || status}
                </Tag>
            ),
        },
        {
            title: 'Số lượng đơn hàng',
            dataIndex: 'orderCount',
            key: 'orderCount',
            sorter: (a, b) => a.orderCount - b.orderCount,
        },
        {
            title: 'Tổng giá trị',
            dataIndex: 'totalAmount',
            key: 'totalAmount',
            render: (value) => formatCurrency(value),
            sorter: (a, b) => a.totalAmount - b.totalAmount,
        },
        {
            title: 'Tỷ lệ',
            dataIndex: 'percentage',
            key: 'percentage',
            render: (value) => `${value.toFixed(2)}%`,
            sorter: (a, b) => a.percentage - b.percentage,
        },
    ];

    if (!dateRange || !dateRange[0] || !dateRange[1]) {
        return (
            <div className="text-center p-4">
                Vui lòng chọn khoảng thời gian để xem báo cáo
            </div>
        );
    }

    if (loading) {
        return <Spin size="large" />;
    }

    return (
        <Card title="Báo cáo trạng thái đơn hàng">
            <Table
                columns={columns}
                dataSource={data}
                rowKey="status"
                pagination={false}
            />
        </Card>
    );
};

export default OrderStatusReport; 