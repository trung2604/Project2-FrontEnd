import React, { useState, useEffect, useRef } from 'react';
import { Card, Table, Input, Button, Space, Avatar, Rate, Tag, Tooltip, Modal, message, Select } from 'antd';
import { UserOutlined, EyeOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { getAdminReviewsAPI } from '../services/api-service';
import { formatDate } from '../utils/format';

const { Search } = Input;
const { Option } = Select;

const AdminReviewsPage = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0
    });
    const [searchInput, setSearchInput] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [rating, setRating] = useState('');
    const debounceTimeout = useRef();

    useEffect(() => {
        fetchReviews();
    }, [pagination.current, searchTerm, rating]);

    useEffect(() => {
        if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
        debounceTimeout.current = setTimeout(() => {
            setSearchTerm(searchInput);
        }, 500);
        return () => clearTimeout(debounceTimeout.current);
    }, [searchInput]);

    const fetchReviews = async () => {
        setLoading(true);
        try {
            const response = await getAdminReviewsAPI({
                page: pagination.current - 1,
                size: pagination.pageSize,
                search: searchTerm || undefined,
                rating: rating || undefined,
                sort: 'createdAt,desc'
            });
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

    const handleSearchChange = (value) => {
        setSearchInput(value);
        setPagination({ ...pagination, current: 1 });
    };

    const handleRatingChange = (value) => {
        setRating(value);
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
                        placeholder="Tìm kiếm nhận xét, tên người đánh giá hoặc tên sách..."
                        allowClear
                        value={searchInput}
                        onChange={e => handleSearchChange(e.target.value)}
                        onSearch={handleSearchChange}
                        style={{ width: 340 }}
                    />
                    <Select
                        placeholder="Số sao"
                        allowClear
                        value={rating || undefined}
                        onChange={value => {
                            setRating(value);
                            setPagination({ ...pagination, current: 1 });
                        }}
                        style={{ width: 120 }}
                    >
                        <Option value="">Tất cả</Option>
                        <Option value="5">5 sao</Option>
                        <Option value="4">4 sao</Option>
                        <Option value="3">3 sao</Option>
                        <Option value="2">2 sao</Option>
                        <Option value="1">1 sao</Option>
                    </Select>
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