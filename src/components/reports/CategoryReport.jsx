import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, Table, Spin, message } from 'antd';
import { Pie } from '@ant-design/plots';
import { getCategoryReportAPI } from '../../services/api-service';
import { formatCurrency } from '../../utils/format';

const CategoryReport = ({ dateRange, loading }) => {
    const [categoryData, setCategoryData] = useState([]);
    const [summaryStats, setSummaryStats] = useState({
        totalRevenue: 0,
        totalBooks: 0,
        totalSold: 0,
    });

    useEffect(() => {
        const fetchCategoryReport = async () => {
            if (!dateRange || !dateRange[0] || !dateRange[1]) return;

            try {
                const response = await getCategoryReportAPI(dateRange[0], dateRange[1]);
                console.log('API category report data:', response.data);
                if (response.success) {
                    const data = response.data || [];
                    setCategoryData(data);

                    const totalRevenue = data.reduce((sum, item) => sum + (Number(item.totalRevenue) || 0), 0);
                    const totalBooks = data.reduce((sum, item) => sum + (Number(item.totalBooks) || 0), 0);
                    const totalSold = data.reduce((sum, item) => sum + (Number(item.totalSold) || 0), 0);

                    setSummaryStats({
                        totalRevenue,
                        totalBooks,
                        totalSold,
                    });
                } else {
                    message.error(response.message || 'Có lỗi xảy ra khi lấy báo cáo danh mục');
                }
            } catch (error) {
                console.error('Error fetching category report:', error);
                message.error('Có lỗi xảy ra khi lấy báo cáo danh mục');
            }
        };

        fetchCategoryReport();
    }, [dateRange]);

    const cleanCategoryData = Array.isArray(categoryData)
        ? categoryData.map(item => ({
            ...item,
            categoryName: item.categoryName && typeof item.categoryName === 'string' ? item.categoryName : 'Không xác định',
            totalRevenue: Number(item.totalRevenue) > 0 ? Number(item.totalRevenue) : 0,
            totalBooks: Number.isFinite(Number(item.totalBooks)) && Number(item.totalBooks) >= 0 ? Number(item.totalBooks) : 0,
            totalSold: Number.isFinite(Number(item.totalSold)) && Number(item.totalSold) >= 0 ? Number(item.totalSold) : 0,
            percentage: Number.isFinite(Number(item.percentage)) && Number(item.percentage) >= 0 ? Number(item.percentage) : 0,
        }))
        : [];

    // Log dữ liệu debug
    console.log('Raw categoryData:', categoryData);
    console.log('Clean categoryData:', cleanCategoryData);
    console.log('Pie data:', cleanCategoryData.filter(item => item.categoryName && item.totalRevenue > 0));

    const tableColumns = [
        {
            title: 'Danh mục',
            dataIndex: 'categoryName',
            key: 'categoryName',
            render: (text) => <span className="font-medium">{text}</span>,
        },
        {
            title: 'Số lượng sách',
            dataIndex: 'totalBooks',
            key: 'totalBooks',
            render: (value) => <span className="text-blue-600">{value}</span>,
            sorter: (a, b) => a.totalBooks - b.totalBooks,
        },
        {
            title: 'Số lượng đã bán',
            dataIndex: 'totalSold',
            key: 'totalSold',
            render: (value) => <span className="text-green-600">{value}</span>,
            sorter: (a, b) => a.totalSold - b.totalSold,
        },
        {
            title: 'Doanh thu',
            dataIndex: 'totalRevenue',
            key: 'totalRevenue',
            render: (value) => <span className="font-semibold text-orange-600">{formatCurrency(value)}</span>,
            sorter: (a, b) => a.totalRevenue - b.totalRevenue,
        },
        {
            title: 'Tỷ lệ doanh thu',
            dataIndex: 'percentage',
            key: 'percentage',
            render: (value) => (
                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                    {(value || 0).toFixed(2)}%
                </span>
            ),
            sorter: (a, b) => a.percentage - b.percentage,
        },
    ];

    const pieChartConfig = {
        data: cleanCategoryData.filter(item => item.categoryName && item.totalRevenue > 0),
        angleField: 'totalRevenue',
        colorField: 'categoryName',
        radius: 0.8,
        innerRadius: 0.4,
        label: {
            type: 'inner',
            content: (datum) => `${datum.categoryName}\n${formatCurrency(datum.totalRevenue)}`,
            style: {
                fontSize: 12,
                fontWeight: 500,
                textAlign: 'center',
            },
        },
        legend: {
            position: 'right',
            itemName: {
                style: {
                    fontSize: 14,
                    fontWeight: 500,
                },
            },
        },
        interactions: [
            {
                type: 'element-active',
            },
        ],
        color: ['#5B8FF9', '#5AD8A6', '#5D7092', '#F6BD16', '#E8684A', '#6DC8EC'],
    };

    if (!dateRange || !dateRange[0] || !dateRange[1]) {
        return (
            <div className="text-center p-8">
                <p className="text-gray-500 text-lg">Vui lòng chọn khoảng thời gian để xem báo cáo danh mục</p>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Spin size="large" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <Row gutter={[16, 16]}>
                <Col xs={24} sm={8}>
                    <Card className="text-center">
                        <Statistic
                            title="Tổng doanh thu"
                            value={summaryStats.totalRevenue}
                            formatter={(value) => formatCurrency(value)}
                            valueStyle={{ color: '#3f8600' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={8}>
                    <Card className="text-center">
                        <Statistic
                            title="Tổng số sách"
                            value={summaryStats.totalBooks}
                            valueStyle={{ color: '#1890ff' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={8}>
                    <Card className="text-center">
                        <Statistic
                            title="Tổng số đã bán"
                            value={summaryStats.totalSold}
                            valueStyle={{ color: '#722ed1' }}
                        />
                    </Card>
                </Col>
            </Row>

            <Card title="Phân bố doanh thu theo danh mục" className="shadow-sm">
                {console.log('Pie data:', cleanCategoryData.filter(item => item.categoryName && item.totalRevenue > 0))}
                <div style={{ height: 400 }}>
                    {cleanCategoryData.length > 0 ? (
                        <Pie {...pieChartConfig} />
                    ) : (
                        <div className="flex justify-center items-center h-full text-gray-500">
                            Không có dữ liệu để hiển thị
                        </div>
                    )}
                </div>
            </Card>

            <Card title="Chi tiết doanh thu theo danh mục" className="shadow-sm">
                <Table
                    columns={tableColumns}
                    dataSource={cleanCategoryData}
                    rowKey="categoryId"
                    pagination={false}
                    size="middle"
                    className="custom-table"
                />
            </Card>
        </div>
    );
};

export default CategoryReport;