import React, { useEffect, useState } from 'react';
import { Card, Table, Spin, message, Rate } from 'antd';
import { getTopSellingBooksReportAPI } from '../../services/api-service';
import { formatCurrency } from '../../utils/format';

const TopSellingBooksReport = ({ dateRange, loading }) => {
    const [data, setData] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            if (!dateRange || !dateRange[0] || !dateRange[1]) return;

            try {
                const response = await getTopSellingBooksReportAPI(dateRange[0], dateRange[1]);
                if (response.success) {
                    setData(response.data || []);
                } else {
                    message.error(response.message);
                }
            } catch (error) {
                console.error('Error fetching top selling books report:', error);
                message.error(error.response?.message || 'Có lỗi xảy ra khi lấy báo cáo sách bán chạy');
            }
        };

        fetchData();
    }, [dateRange]);

    const columns = [
        {
            title: 'STT',
            dataIndex: 'rank',
            key: 'rank',
            width: 80,
            render: (_, __, index) => index + 1,
        },
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
            title: 'Đánh giá',
            dataIndex: 'averageRating',
            key: 'averageRating',
            render: (value) => <Rate disabled defaultValue={value} allowHalf />,
            sorter: (a, b) => a.averageRating - b.averageRating,
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
        <Card title="Top sách bán chạy">
            <Table
                columns={columns}
                dataSource={data}
                rowKey="bookId"
                pagination={false}
            />
        </Card>
    );
};

export default TopSellingBooksReport; 