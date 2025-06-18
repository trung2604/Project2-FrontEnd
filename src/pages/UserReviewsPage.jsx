import React, { useState, useEffect } from 'react';
import { Card, List, Button, Rate, Tag, Popconfirm, message, Pagination, Empty, Modal, Select } from 'antd';
import { EditOutlined, DeleteOutlined, CheckCircleOutlined, BookOutlined } from '@ant-design/icons';
import { getUserReviewsAPI, deleteReviewAPI, getUserOrdersAPI } from '../services/api-service';
import { formatDate } from '../utils/format';
import ReviewForm from '../components/review/ReviewForm';
import { useContext } from 'react';
import { AuthContext } from '../components/context/auth-context';
import { useNavigate } from 'react-router-dom';

const UserReviewsPage = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0
    });
    const [editingReview, setEditingReview] = useState(null);
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [selectBookModalOpen, setSelectBookModalOpen] = useState(false);
    const [booksToReview, setBooksToReview] = useState([]);
    const [selectedBook, setSelectedBook] = useState(null);

    useEffect(() => {
        if (!user?.id || user.role !== 'ROLE_USER') {
            navigate('/login'); // hoặc navigate('/') nếu muốn về trang chủ
        }
    }, [user, navigate]);

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

    const fetchBooksToReview = async () => {
        try {
            const ordersRes = await getUserOrdersAPI({ page: 0, size: 100 });
            if (ordersRes.success && ordersRes.data) {
                const orders = ordersRes.data.result || [];
                let deliveredBooks = [];
                orders.forEach(order => {
                    if (order.status === 'DELIVERED') {
                        (order.items || []).forEach(item => {
                            deliveredBooks.push({
                                bookId: item.bookId,
                                bookName: item.bookTitle || item.bookName,
                                bookImage: item.bookImage || (item.book && item.book.image),
                                orderId: order.id
                            });
                        });
                    }
                });
                const reviewedBookIds = reviews.map(r => String(r.bookId));
                const booksCanReview = deliveredBooks.filter(b => !reviewedBookIds.includes(String(b.bookId)));
                setBooksToReview(booksCanReview);
            }
        } catch (error) {
            setBooksToReview([]);
        }
    };

    const handleOpenSelectBook = async () => {
        await fetchBooksToReview();
        setSelectBookModalOpen(true);
    };

    const handleSelectBook = (bookId) => {
        const book = booksToReview.find(b => b.bookId === bookId);
        setSelectedBook(book);
        setSelectBookModalOpen(false);
        setShowReviewForm(true);
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
                        onClick={handleOpenSelectBook}
                    >
                        Viết đánh giá mới
                    </Button>
                }
            >
                <Modal
                    title="Chọn sách để đánh giá"
                    open={selectBookModalOpen}
                    onCancel={() => setSelectBookModalOpen(false)}
                    footer={null}
                >
                    <Select
                        showSearch
                        placeholder="Chọn sách..."
                        style={{ width: '100%' }}
                        optionFilterProp="children"
                        onChange={handleSelectBook}
                    >
                        {booksToReview.map(book => (
                            <Select.Option key={book.bookId} value={book.bookId}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    {book.bookImage && <img src={book.bookImage} alt={book.bookName} style={{ width: 32, height: 40, objectFit: 'cover', borderRadius: 3 }} />}
                                    <span>{book.bookName}</span>
                                </span>
                            </Select.Option>
                        ))}
                    </Select>
                    {booksToReview.length === 0 && <div style={{ marginTop: 16, color: '#888' }}>Bạn không có sách nào để đánh giá.</div>}
                </Modal>
                {showReviewForm && (
                    <div className="mb-6">
                        <ReviewForm
                            bookId={editingReview ? editingReview.bookId : selectedBook?.bookId}
                            orderId={editingReview ? editingReview.orderId : selectedBook?.orderId}
                            bookName={editingReview ? editingReview.bookName : selectedBook?.bookName}
                            bookImage={editingReview ? editingReview.bookImage : selectedBook?.bookImage}
                            existingReview={editingReview}
                            onSubmit={handleReviewSuccess}
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