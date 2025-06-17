import React, { useEffect, useState } from 'react';
import { Card, Table, Tag, Spin, message } from 'antd';
import { getInventoryReportAPI, STOCK_STATUS, STOCK_STATUS_LABELS, STOCK_STATUS_COLORS } from '../../services/api-service';
import { formatCurrency } from '../../utils/format';

const InventoryReport = ({ loading }) => {
    const [data, setData] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await getInventoryReportAPI();
                if (response.success) {
                    setData(response.data || []);
                } else {
                    message.error(response.message);
                }
            } catch (error) {
                console.error('Error fetching inventory report:', error);
                message.error(error.response?.message || 'Có lỗi xảy ra khi lấy báo cáo tồn kho');
            }
        };

        fetchData();
    }, []);

    const columns = [
        {
            title: 'Tên sách',
            dataIndex: 'mainText',
            key: 'mainText',
        },
        {
            title: 'Tác giả',
            dataIndex: 'author',
            key: 'author',
        },
        {
            title: 'Danh mục',
            dataIndex: 'categoryName',
            key: 'categoryName',
        },
        {
            title: 'Số lượng tồn',
            dataIndex: 'currentStock',
            key: 'currentStock',
            sorter: (a, b) => a.currentStock - b.currentStock,
        },
        {
            title: 'Số lượng đã bán',
            dataIndex: 'totalSold',
            key: 'totalSold',
            sorter: (a, b) => a.totalSold - b.totalSold,
        },
        {
            title: 'Doanh thu',
            dataIndex: 'totalRevenue',
            key: 'totalRevenue',
            render: (value) => formatCurrency(value),
            sorter: (a, b) => a.totalRevenue - b.totalRevenue,
        },
        {
            title: 'Trạng thái',
            dataIndex: 'stockStatus',
            key: 'stockStatus',
            render: (status) => (
                <Tag className={`stock-status-tag stock-status-${status?.toLowerCase()}`} color={STOCK_STATUS_COLORS[status] || 'default'}>
                    {STOCK_STATUS_LABELS[status] || status}
                </Tag>
            ),
            filters: Object.entries(STOCK_STATUS).map(([value, _]) => ({
                text: STOCK_STATUS_LABELS[value],
                value: value,
            })),
            onFilter: (value, record) => record.stockStatus === value,
        },
    ];

    if (loading) {
        return <Spin size="large" />;
    }

    return (
        <Card title="Báo cáo tồn kho">
            <Table
                columns={columns}
                dataSource={data}
                rowKey="bookId"
            />
        </Card>
    );
};

export default InventoryReport; 