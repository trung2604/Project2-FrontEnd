import React, { useState, useEffect } from 'react';
import { Card, List, Button, Rate, Tag, Popconfirm, message, Pagination, Empty } from 'antd';
import { EditOutlined, DeleteOutlined, CheckCircleOutlined, BookOutlined } from '@ant-design/icons';
import { getUserReviewsAPI, deleteReviewAPI } from '../services/api-service';
import { formatDate } from '../utils/format';
import ReviewForm from '../components/review/ReviewForm';

const UserReviewsPage = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0
    });
    const [editingReview, setEditingReview] = useState(null);
    const [showReviewForm, setShowReviewForm] = useState(false);

    useEffect(() => {
        fetchUserReviews();
    }, [pagination.current]);

    const fetchUserReviews = async () => {
        setLoading(true);
        try {
            const response = await getUserReviewsAPI(pagination.current - 1, pagination.pageSize);
            if (response.success) {
                setReviews(response.data.result);
                setPagination({
                    ...pagination,
                    total: response.data.meta.total
                });
            }
        } catch (error) {
            console.error('Error fetching user reviews:', error);
            message.error('Không thể tải danh sách đánh giá');
        } finally {
            setLoading(false);
        }
    };

    const handlePageChange = (page) => {
        setPagination({ ...pagination, current: page });
    };

    const handleEdit = (review) => {
        setEditingReview(review);
        setShowReviewForm(true);
    };

    const handleDelete = async (reviewId) => {
        try {
            const response = await deleteReviewAPI(reviewId);
            if (response.success) {
                message.success('Xóa đánh giá thành công');
                fetchUserReviews();
            }
        } catch (error) {
            console.error('Error deleting review:', error);
            message.error('Không thể xóa đánh giá');
        }
    };

    const handleReviewSuccess = () => {
        setShowReviewForm(false);
        setEditingReview(null);
        fetchUserReviews();
    };

    const handleCancelEdit = () => {
        setShowReviewForm(false);
        setEditingReview(null);
    };

    const renderReviewItem = (review) => (
        <List.Item
            actions={[
                <Button
                    type="text"
                    icon={<EditOutlined />}
                    onClick={() => handleEdit(review)}
                >
                    Chỉnh sửa
                </Button>,
                <Popconfirm
                    title="Bạn có chắc muốn xóa đánh giá này?"
                    onConfirm={() => handleDelete(review.id)}
                    okText="Có"
                    cancelText="Không"
                >
                    <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                    >
                        Xóa
                    </Button>
                </Popconfirm>
            ]}
        >
            <List.Item.Meta
                avatar={<BookOutlined style={{ fontSize: '24px', color: '#1890ff' }} />}
                title={
                    <span className="font-medium">{review.bookName}</span>
                }
                description={
                    <div className="space-y-2">
                        <div className="flex items-center space-x-4">
                            <Rate disabled defaultValue={review.rating} />
                            {review.isVerifiedPurchase && (
                                <Tag color="green" icon={<CheckCircleOutlined />}>
                                    Đã mua
                                </Tag>
                            )}
                        </div>
                        <div className="text-gray-600">
                            <p className="mb-2">{review.comment}</p>
                            <div className="text-sm text-gray-500">
                                Đánh giá vào: {formatDate(review.createdAt)}
                            </div>
                        </div>
                    </div>
                }
            />
        </List.Item>
    );

    return (
        <div className="p-6">
            <Card
                title="Đánh giá của tôi"
                extra={
                    <Button
                        type="primary"
                        onClick={() => setShowReviewForm(true)}
                    >
                        Viết đánh giá mới
                    </Button>
                }
            >
                {showReviewForm && (
                    <div className="mb-6">
                        <ReviewForm
                            bookId={editingReview?.bookId}
                            orderId={editingReview?.orderId}
                            reviewId={editingReview?.id}
                            bookName={editingReview?.bookName}
                            onSuccess={handleReviewSuccess}
                            onCancel={handleCancelEdit}
                        />
                    </div>
                )}

                {loading ? (
                    <div className="text-center p-8">
                        <div>Đang tải...</div>
                    </div>
                ) : reviews.length > 0 ? (
                    <>
                        <List
                            dataSource={reviews}
                            renderItem={renderReviewItem}
                            pagination={false}
                        />
                        <div className="text-center mt-4">
                            <Pagination
                                current={pagination.current}
                                total={pagination.total}
                                pageSize={pagination.pageSize}
                                onChange={handlePageChange}
                                showSizeChanger={false}
                                showQuickJumper
                                showTotal={(total, range) =>
                                    `${range[0]}-${range[1]} của ${total} đánh giá`
                                }
                            />
                        </div>
                    </>
                ) : (
                    <Empty
                        description="Bạn chưa có đánh giá nào"
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                    />
                )}
            </Card>
        </div>
    );
};

export default UserReviewsPage; 