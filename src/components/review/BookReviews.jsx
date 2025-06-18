import React, { useState, useEffect, useContext } from 'react';
import { Card, Rate, Avatar, List, Tag, Spin, Empty, Pagination, Progress, Row, Col, Statistic, Button, message, Popconfirm } from 'antd';
import { UserOutlined, CheckCircleOutlined, EditOutlined, ShoppingOutlined, ThunderboltOutlined } from '@ant-design/icons';
import { getBookReviewsAPI, getBookReviewSummaryAPI, getUserReviewForBookAPI, getUserOrdersAPI, deleteReviewAPI } from '../../services/api-service';
import { formatDate } from '../../utils/format';
import { AuthContext } from '../context/auth-context';
import { useCart } from '../context/cart-context';
import { useNavigate } from 'react-router-dom';
import ReviewForm from './ReviewForm';
import './review.css';

const BookReviews = ({ bookId, bookInfo, onReviewSubmitted }) => {
    const { user } = useContext(AuthContext);
    const { addToCart } = useCart();
    const navigate = useNavigate();
    const [reviews, setReviews] = useState([]);
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(false);
    const [summaryLoading, setSummaryLoading] = useState(false);
    const [userReview, setUserReview] = useState(null);
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [hasPurchasedBook, setHasPurchasedBook] = useState(false);
    const [checkingPurchase, setCheckingPurchase] = useState(false);
    const [purchaseLoading, setPurchaseLoading] = useState(false);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0
    });

    useEffect(() => {
        if (bookId) {
            fetchReviewSummary();
            fetchReviews(1);
            if (user?.id) {
                fetchUserReview();
                checkUserPurchase();
            }
        }
    }, [bookId, user?.id]);

    const checkUserPurchase = async () => {
        setCheckingPurchase(true);
        try {
            const response = await getUserOrdersAPI({ page: 0, size: 100 });
            if (response.success && response.data) {
                // Dữ liệu thực tế nằm ở response.data.result
                const orders = response.data.result || [];
                // Chỉ kiểm tra đơn hàng DELIVERED
                const hasPurchased = orders.some(order => {
                    if (order.status !== 'DELIVERED') return false;
                    const items = order.items || [];
                    if (!Array.isArray(items)) return false;
                    return items.some(item => String(item.bookId) === String(bookId));
                });
                setHasPurchasedBook(hasPurchased);
            }
        } catch (error) {
            setHasPurchasedBook(false);
        } finally {
            setCheckingPurchase(false);
        }
    };

    const handleBuyNow = async () => {
        if (!user?.id) {
            message.warning("Vui lòng đăng nhập để mua hàng");
            navigate('/login');
            return;
        }

        setPurchaseLoading(true);
        try {
            // Tạo dữ liệu sách cho checkout
            const bookForCheckout = {
                bookId: bookId,
                bookTitle: bookInfo?.mainText || 'Sách',
                bookImage: bookInfo?.image,
                price: bookInfo?.price || 0,
                quantity: 1,
                totalPrice: bookInfo?.price || 0
            };

            // Chuyển đến trang checkout với sách này
            navigate('/checkout', {
                state: {
                    cart: [bookForCheckout],
                    isBuyNow: true // Flag để biết đây là mua ngay
                }
            });
        } catch (error) {
            console.error('Error in buy now:', error);
            message.error('Không thể thực hiện mua ngay');
        } finally {
            setPurchaseLoading(false);
        }
    };

    const fetchUserReview = async () => {
        try {
            const response = await getUserReviewForBookAPI(bookId);
            if (response.success) {
                setUserReview(response.data);
            }
        } catch (error) {
            // User chưa đánh giá sách này
            setUserReview(null);
        }
    };

    const fetchReviewSummary = async () => {
        setSummaryLoading(true);
        try {
            const response = await getBookReviewSummaryAPI(bookId);
            if (response.success) {
                setSummary(response.data);
            }
        } catch (error) {
            console.error('Error fetching review summary:', error);
        } finally {
            setSummaryLoading(false);
        }
    };

    const fetchReviews = async (page = 1) => {
        setLoading(true);
        try {
            const response = await getBookReviewsAPI(bookId, page - 1, pagination.pageSize);
            if (response.success) {
                setReviews(response.data.result);
                setPagination({
                    ...pagination,
                    current: page,
                    total: response.data.meta.total
                });
            }
        } catch (error) {
            console.error('Error fetching reviews:', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePageChange = (page) => {
        fetchReviews(page);
    };

    const handleReviewSubmit = async () => {
        await fetchUserReview();
        await fetchReviewSummary();
        await fetchReviews(pagination.current);
        setShowReviewForm(false);
        if (onReviewSubmitted) {
            onReviewSubmitted();
        }
    };

    const handleReviewUpdate = async () => {
        await fetchUserReview();
        await fetchReviewSummary();
        await fetchReviews(pagination.current);
        setShowReviewForm(false);
        if (onReviewSubmitted) {
            onReviewSubmitted();
        }
    };

    const renderUserReviewSection = () => {
        const isUser = user?.role === "USER";
        if (!user?.id) {
            return (
                <Card title="Viết đánh giá" className="mb-4">
                    <div className="text-center p-4">
                        <p>Vui lòng <Button type="link" onClick={() => navigate('/login')}>đăng nhập</Button> để viết đánh giá</p>
                    </div>
                </Card>
            );
        }

        if (checkingPurchase) {
            return (
                <Card title="Kiểm tra quyền đánh giá" className="mb-4">
                    <div className="text-center p-4">
                        <Spin size="small" />
                        <p>Đang kiểm tra...</p>
                    </div>
                </Card>
            );
        }

        // Nếu đã mua sách
        if (hasPurchasedBook) {
            if (userReview) {
                return (
                    <Card title="Đánh giá của bạn" className="mb-4">
                        <div className="user-review">
                            <div className="review-header">
                                <div className="reviewer-info">
                                    <Avatar icon={<UserOutlined />} />
                                    <div className="reviewer-details">
                                        <div className="reviewer-name">{user.fullName}</div>
                                        <div className="review-date">{formatDate(userReview.createdAt)}</div>
                                    </div>
                                </div>
                                <div className="review-rating">
                                    <Rate disabled defaultValue={userReview.rating} />
                                    <Tag color="green" icon={<CheckCircleOutlined />}>
                                        Đã mua
                                    </Tag>
                                </div>
                            </div>
                            <div className="review-content">
                                <p>{userReview.comment}</p>
                            </div>
                            <div className="review-actions">
                                <Button
                                    type="primary"
                                    icon={<EditOutlined />}
                                    onClick={() => setShowReviewForm(true)}
                                >
                                    Chỉnh sửa đánh giá
                                </Button>
                                <Popconfirm
                                    title="Bạn có chắc muốn xóa đánh giá này?"
                                    okText="Xóa"
                                    cancelText="Hủy"
                                    onConfirm={async () => {
                                        try {
                                            const response = await deleteReviewAPI(userReview.id);
                                            if (response.success) {
                                                message.success('Xóa đánh giá thành công');
                                                await fetchUserReview();
                                                await fetchReviewSummary();
                                                await fetchReviews(pagination.current);
                                                if (onReviewSubmitted) onReviewSubmitted();
                                            } else {
                                                message.error('Không thể xóa đánh giá');
                                            }
                                        } catch (error) {
                                            message.error('Không thể xóa đánh giá');
                                        }
                                    }}
                                >
                                    <Button danger style={{ marginLeft: 8 }}>
                                        Xóa đánh giá
                                    </Button>
                                </Popconfirm>
                            </div>
                        </div>
                    </Card>
                );
            }
            // Nếu đã mua nhưng chưa review
            return (
                <Card title="Viết đánh giá" className="mb-4">
                    <div className="text-center p-4">
                        <CheckCircleOutlined style={{ fontSize: 48, color: '#52c41a', marginBottom: 16 }} />
                        <p>Bạn đã mua sách này và có thể viết đánh giá</p>
                        <Button
                            type="primary"
                            onClick={() => setShowReviewForm(true)}
                        >
                            Viết đánh giá ngay
                        </Button>
                    </div>
                </Card>
            );
        }

        // Nếu chưa mua sách
        if (isUser) {
            return (
                <Card title="Viết đánh giá" className="mb-4">
                    <div className="text-center p-4">
                        <ShoppingOutlined style={{ fontSize: 48, color: '#d9d9d9', marginBottom: 16 }} />
                        <p>Bạn cần mua sách này trước khi có thể đánh giá</p>
                        <Button
                            type="primary"
                            danger
                            icon={<ThunderboltOutlined style={{ fontSize: 16 }} />}
                            loading={purchaseLoading}
                            onClick={handleBuyNow}
                        >
                            Mua ngay
                        </Button>
                    </div>
                </Card>
            );
        }
        // Nếu không phải user thường (admin/shipper) thì không hiển thị gì
        return null;
    };

    const renderRatingDistribution = () => {
        if (!summary?.ratingDistribution) return null;

        const { ratingDistribution } = summary;
        const total = summary.totalReviews;

        // Đảm bảo luôn có giá trị số, nếu không có thì là 0
        const safe = (val) => typeof val === 'number' && !isNaN(val) ? val : 0;

        const stars = [
            { key: '5', label: '5 sao', count: safe(ratingDistribution['5']) },
            { key: '4', label: '4 sao', count: safe(ratingDistribution['4']) },
            { key: '3', label: '3 sao', count: safe(ratingDistribution['3']) },
            { key: '2', label: '2 sao', count: safe(ratingDistribution['2']) },
            { key: '1', label: '1 sao', count: safe(ratingDistribution['1']) }
        ];

        return (
            <div className="rating-distribution">
                {stars.map((star) => (
                    <div key={star.key} className="rating-bar">
                        <span className="star-label">{star.label}</span>
                        <Progress
                            percent={total > 0 ? Math.round((star.count / total) * 100) : 0}
                            size="small"
                            showInfo={false}
                            strokeColor="#faad14"
                        />
                        <span className="star-count">{star.count}</span>
                    </div>
                ))}
            </div>
        );
    };

    const renderReviewItem = (review) => (
        <List.Item>
            <div className="review-item">
                <div className="review-header">
                    <div className="reviewer-info">
                        <Avatar icon={<UserOutlined />} />
                        <div className="reviewer-details">
                            <div className="reviewer-name">{review.userName}</div>
                            <div className="review-date">{formatDate(review.createdAt)}</div>
                        </div>
                    </div>
                    <div className="review-rating">
                        <Rate disabled defaultValue={review.rating} />
                        {review.isVerifiedPurchase && (
                            <Tag color="green" icon={<CheckCircleOutlined />}>
                                Đã mua
                            </Tag>
                        )}
                    </div>
                </div>
                <div className="review-content">
                    <p>{review.comment}</p>
                </div>
            </div>
        </List.Item>
    );

    if (summaryLoading) {
        return (
            <Card title="Đánh giá sách">
                <div className="text-center p-8">
                    <Spin size="large" />
                </div>
            </Card>
        );
    }

    return (
        <div className="book-reviews">
            {/* Review Form - chỉ hiển thị khi showReviewForm=true */}
            {showReviewForm && (
                <Card title={userReview ? "Chỉnh sửa đánh giá" : "Viết đánh giá"} className="mb-4">
                    <ReviewForm
                        bookId={bookId}
                        existingReview={userReview}
                        onSubmit={userReview ? handleReviewUpdate : handleReviewSubmit}
                        onCancel={() => setShowReviewForm(false)}
                    />
                </Card>
            )}

            {/* User Review Section */}
            {userReview && !showReviewForm && (
                <Card title="Đánh giá của bạn" className="mb-4">
                    <div className="user-review">
                        <div className="review-header">
                            <div className="reviewer-info">
                                <Avatar icon={<UserOutlined />} />
                                <div className="reviewer-details">
                                    <div className="reviewer-name">{user.fullName}</div>
                                    <div className="review-date">{formatDate(userReview.createdAt)}</div>
                                </div>
                            </div>
                            <div className="review-rating">
                                <Rate disabled defaultValue={userReview.rating} />
                                <Tag color="green" icon={<CheckCircleOutlined />}>
                                    Đã mua
                                </Tag>
                            </div>
                        </div>
                        <div className="review-content">
                            <p>{userReview.comment}</p>
                        </div>
                        <div className="review-actions">
                            <Button
                                type="primary"
                                icon={<EditOutlined />}
                                onClick={() => setShowReviewForm(true)}
                            >
                                Chỉnh sửa đánh giá
                            </Button>
                            <Popconfirm
                                title="Bạn có chắc muốn xóa đánh giá này?"
                                okText="Xóa"
                                cancelText="Hủy"
                                onConfirm={async () => {
                                    try {
                                        const response = await deleteReviewAPI(userReview.id);
                                        if (response.success) {
                                            message.success('Xóa đánh giá thành công');
                                            await fetchUserReview();
                                            await fetchReviewSummary();
                                            await fetchReviews(pagination.current);
                                            if (onReviewSubmitted) onReviewSubmitted();
                                        } else {
                                            message.error('Không thể xóa đánh giá');
                                        }
                                    } catch (error) {
                                        message.error('Không thể xóa đánh giá');
                                    }
                                }}
                            >
                                <Button danger style={{ marginLeft: 8 }}>
                                    Xóa đánh giá
                                </Button>
                            </Popconfirm>
                        </div>
                    </div>
                </Card>
            )}
            {!userReview && !showReviewForm && renderUserReviewSection()}

            {/* Review Summary */}
            {summary && (
                <Card title="Thống kê đánh giá" className="mb-4">
                    <Row gutter={16}>
                        <Col xs={24} sm={8}>
                            <Statistic
                                title="Điểm trung bình"
                                value={summary.averageRating}
                                precision={1}
                                suffix="⭐"
                                valueStyle={{ color: '#faad14' }}
                            />
                        </Col>
                        <Col xs={24} sm={8}>
                            <Statistic
                                title="Tổng đánh giá"
                                value={summary.totalReviews}
                                suffix="đánh giá"
                            />
                        </Col>
                    </Row>

                    <div className="mt-4">
                        <h4>Phân bố đánh giá</h4>
                        {renderRatingDistribution()}
                    </div>
                </Card>
            )}

            {/* Reviews List */}
            <Card title={`Đánh giá (${pagination.total})`}>
                {loading ? (
                    <div className="text-center p-8">
                        <Spin size="large" />
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
                        description="Chưa có đánh giá nào cho sách này"
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                    />
                )}
            </Card>
        </div>
    );
};

export default BookReviews; 