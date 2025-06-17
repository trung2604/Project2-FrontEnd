import React, { useState, useEffect } from 'react';
import { Card, Table, Input, Button, Space, Avatar, Rate, Tag, Tooltip, Modal, message } from 'antd';
import { UserOutlined, EyeOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { getAllReviewsAPI } from '../services/api-service';
import { formatDate } from '../utils/format';

const { Search } = Input;

const AdminReviewsPage = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0
    });
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchReviews();
    }, [pagination.current, searchTerm]);

    const fetchReviews = async () => {
        setLoading(true);
        try {
            const response = await getAllReviewsAPI(
                pagination.current - 1,
                pagination.pageSize,
                searchTerm
            );
            if (response.success) {
                setReviews(response.data.result);
                setPagination({
                    ...pagination,
                    total: response.data.meta.total
                });
            }
        } catch (error) {
            console.error('Error fetching reviews:', error);
            message.error('Không thể tải danh sách đánh giá');
        } finally {
            setLoading(false);
        }
    };

    const handleTableChange = (paginationInfo) => {
        setPagination({
            ...pagination,
            current: paginationInfo.current,
            pageSize: paginationInfo.pageSize
        });
    };

    const handleSearch = (value) => {
        setSearchTerm(value);
        setPagination({ ...pagination, current: 1 });
    };

    const columns = [
        {
            title: 'Người đánh giá',
            dataIndex: 'userName',
            key: 'userName',
            render: (userName, record) => (
                <div className="flex items-center">
                    <Avatar icon={<UserOutlined />} size="small" className="mr-2" />
                    <div>
                        <div className="font-medium">{userName}</div>
                        <div className="text-xs text-gray-500">{record.userEmail}</div>
                    </div>
                </div>
            ),
        },
        {
            title: 'Sách',
            dataIndex: 'bookName',
            key: 'bookName',
            render: (bookName) => (
                <div className="font-medium">{bookName}</div>
            ),
        },
        {
            title: 'Đánh giá',
            dataIndex: 'rating',
            key: 'rating',
            render: (rating) => (
                <Rate disabled defaultValue={rating} />
            ),
        },
        {
            title: 'Nhận xét',
            dataIndex: 'comment',
            key: 'comment',
            render: (comment) => (
                <Tooltip title={comment}>
                    <div className="max-w-xs truncate">{comment}</div>
                </Tooltip>
            ),
        },
        {
            title: 'Xác thực',
            dataIndex: 'isVerifiedPurchase',
            key: 'isVerifiedPurchase',
            render: (isVerified) => (
                isVerified ? (
                    <Tag color="green" icon={<CheckCircleOutlined />}>
                        Đã mua
                    </Tag>
                ) : (
                    <Tag color="default">Chưa xác thực</Tag>
                )
            ),
        },
        {
            title: 'Ngày tạo',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (date) => formatDate(date),
        },
        {
            title: 'Thao tác',
            key: 'actions',
            render: (_, record) => (
                <Space>
                    <Tooltip title="Xem chi tiết">
                        <Button
                            type="text"
                            icon={<EyeOutlined />}
                            size="small"
                            onClick={() => handleViewDetail(record)}
                        />
                    </Tooltip>
                </Space>
            ),
        },
    ];

    const handleViewDetail = (review) => {
        Modal.info({
            title: 'Chi tiết đánh giá',
            width: 600,
            content: (
                <div>
                    <p><strong>Người đánh giá:</strong> {review.userName}</p>
                    <p><strong>Email:</strong> {review.userEmail}</p>
                    <p><strong>Sách:</strong> {review.bookName}</p>
                    <p><strong>Đánh giá:</strong> <Rate disabled defaultValue={review.rating} /></p>
                    <p><strong>Nhận xét:</strong></p>
                    <div className="p-3 bg-gray-50 rounded">{review.comment}</div>
                    <p><strong>Xác thực mua hàng:</strong> {review.isVerifiedPurchase ? 'Có' : 'Không'}</p>
                    <p><strong>Ngày tạo:</strong> {formatDate(review.createdAt)}</p>
                </div>
            ),
        });
    };

    return (
        <div className="p-6">
            <Card title="Quản lý đánh giá">
                <div className="mb-4 flex flex-wrap gap-4">
                    <Search
                        placeholder="Tìm kiếm theo tên sách, người đánh giá..."
                        allowClear
                        onSearch={handleSearch}
                        style={{ width: 300 }}
                    />
                </div>

                <Table
                    columns={columns}
                    dataSource={reviews}
                    rowKey="id"
                    loading={loading}
                    pagination={{
                        current: pagination.current,
                        pageSize: pagination.pageSize,
                        total: pagination.total,
                        showSizeChanger: true,
                        showQuickJumper: true,
                        showTotal: (total, range) =>
                            `${range[0]}-${range[1]} của ${total} đánh giá`,
                    }}
                    onChange={handleTableChange}
                    scroll={{ x: 1200 }}
                />
            </Card>
        </div>
    );
};

export default AdminReviewsPage; 