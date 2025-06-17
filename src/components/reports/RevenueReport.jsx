import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, Table, Spin, message } from 'antd';
import { Line } from '@ant-design/plots';
import { getRevenueReportAPI } from '../../services/api-service';
import { formatCurrency } from '../../utils/format';

const RevenueReport = ({ dateRange, loading }) => {
    const [reportData, setReportData] = useState(null);
    const [dailyStats, setDailyStats] = useState([]);

    useEffect(() => {
        const fetchRevenueReport = async () => {
            if (!dateRange || !dateRange[0] || !dateRange[1]) return;

            try {
                const response = await getRevenueReportAPI(dateRange[0], dateRange[1]);
                if (response.success) {
                    setReportData(response.data);
                    setDailyStats(response.data.dailyStats || []);
                } else {
                    message.error(response.message || 'Có lỗi xảy ra khi lấy báo cáo doanh thu');
                }
            } catch (error) {
                console.error('Error fetching revenue report:', error);
                message.error('Có lỗi xảy ra khi lấy báo cáo doanh thu');
            }
        };

        fetchRevenueReport();
    }, [dateRange]);

    const cleanDailyStats = Array.isArray(dailyStats)
        ? dailyStats.map(item => ({
            ...item,
            date: item.date ? new Date(item.date).toISOString().split('T')[0] : '-',
            revenue: Number(item.revenue) > 0 ? Number(item.revenue) : 0,
            orderCount: Number.isFinite(Number(item.orderCount)) && Number(item.orderCount) >= 0 ? Number(item.orderCount) : 0,
            averageOrderValue: Number.isFinite(Number(item.averageOrderValue)) && Number(item.averageOrderValue) >= 0 ? Number(item.averageOrderValue) : 0,
        }))
        : [];

    const tableColumns = [
        {
            title: 'Ngày',
            dataIndex: 'date',
            key: 'date',
            render: (date) => date ? new Date(date).toLocaleDateString('vi-VN') : '-',
            sorter: (a, b) => new Date(a.date) - new Date(b.date),
        },
        {
            title: 'Doanh thu',
            dataIndex: 'revenue',
            key: 'revenue',
            render: (value) => formatCurrency(value),
            sorter: (a, b) => a.revenue - b.revenue,
        },
        {
            title: 'Số đơn hàng',
            dataIndex: 'orderCount',
            key: 'orderCount',
            sorter: (a, b) => a.orderCount - b.orderCount,
        },
        {
            title: 'Giá trị TB đơn',
            dataIndex: 'averageOrderValue',
            key: 'averageOrderValue',
            render: (value) => formatCurrency(value),
            sorter: (a, b) => a.averageOrderValue - b.averageOrderValue,
        },
    ];

    const lineChartConfig = {
        data: cleanDailyStats,
        xField: 'date',
        yField: 'revenue',
        smooth: true,
        point: {
            size: 5,
            shape: 'circle',
            style: {
                fill: 'white',
                stroke: '#5B8FF9',
                lineWidth: 2,
            },
        },
        xAxis: {
            label: {
                formatter: (date) => date ? new Date(date).toLocaleDateString('vi-VN') : '-',
            },
        },
        yAxis: {
            label: {
                formatter: (value) => formatCurrency(value),
            },
        },
        color: '#5B8FF9',
        animation: true,
    };

    if (!dateRange || !dateRange[0] || !dateRange[1]) {
        return (
            <div className="text-center p-8">
                <p className="text-gray-500 text-lg">Vui lòng chọn khoảng thời gian để xem báo cáo doanh thu</p>
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
                            value={reportData?.totalRevenue || 0}
                            formatter={(value) => formatCurrency(value)}
                            valueStyle={{ color: '#3f8600' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={8}>
                    <Card className="text-center">
                        <Statistic
                            title="Tổng số đơn hàng"
                            value={reportData?.totalOrders || 0}
                            valueStyle={{ color: '#1890ff' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={8}>
                    <Card className="text-center">
                        <Statistic
                            title="Giá trị TB đơn hàng"
                            value={reportData?.averageOrderValue || 0}
                            formatter={(value) => formatCurrency(value)}
                            valueStyle={{ color: '#722ed1' }}
                        />
                    </Card>
                </Col>
            </Row>

            <Card title="Biểu đồ doanh thu theo ngày" className="shadow-sm">
                {console.log('Line data:', cleanDailyStats)}
                <div style={{ height: 400 }}>
                    {cleanDailyStats.length > 0 ? (
                        <Line {...lineChartConfig} />
                    ) : (
                        <div className="flex justify-center items-center h-full text-gray-500">
                            Không có dữ liệu để hiển thị
                        </div>
                    )}
                </div>
            </Card>

            <Card title="Chi tiết doanh thu theo ngày" className="shadow-sm">
                <Table
                    columns={tableColumns}
                    dataSource={cleanDailyStats}
                    rowKey="date"
                    pagination={false}
                    size="middle"
                    className="custom-table"
                />
            </Card>
        </div>
    );
};

export default RevenueReport;