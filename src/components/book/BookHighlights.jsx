import React, { useEffect, useState, useContext } from 'react';
import { Row, Col, Card, Typography, Spin, Empty, message } from 'antd';
import { getTopSellingBooksAPI, getLatestBooksAPI, deleteBookAPI } from '../../services/api-service';
import BookCard from './BookCard';
import BookForm from './BookForm';
import { AuthContext } from '../../components/context/auth-context';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../components/context/cart-context';

const { Title } = Typography;

const BookHighlights = () => {
    const [topSellingBooks, setTopSellingBooks] = useState([]);
    const [latestBooks, setLatestBooks] = useState([]);
    const [loading, setLoading] = useState({ topSelling: true, latest: true });
    const [actionLoading, setActionLoading] = useState({});
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [bookData, setBookData] = useState(null);
    const { user } = useContext(AuthContext);
    const { addToCart } = useCart();
    const isAdmin = user?.role === 'ROLE_ADMIN';
    const navigate = useNavigate();

    useEffect(() => {
        const fetchBooks = async () => {
            try {
                const [topSellingRes, latestRes] = await Promise.all([
                    getTopSellingBooksAPI(),
                    getLatestBooksAPI()
                ]);

                if (topSellingRes.success) {
                    setTopSellingBooks(topSellingRes.data);
                }
                if (latestRes.success) {
                    setLatestBooks(latestRes.data);
                }
            } catch (error) {
                console.error('Error fetching books:', error);
                message.error('Không thể tải danh sách sách');
            } finally {
                setLoading({ topSelling: false, latest: false });
            }
        };

        fetchBooks();
    }, []);

    const handleAddToCart = async (book) => {
        if (!user?.id) {
            message.warning("Vui lòng đăng nhập để thêm vào giỏ hàng");
            navigate('/login');
            return;
        }
        setActionLoading(prev => ({ ...prev, [book.id]: true }));
        try {
            await addToCart(book.id, 1);
            message.success('Đã thêm vào giỏ hàng');
        } catch (error) {
            message.error(error?.response?.message || 'Không thể thêm vào giỏ hàng');
        } finally {
            setActionLoading(prev => ({ ...prev, [book.id]: false }));
        }
    };

    const handleBuyNow = async (book) => {
        if (!user?.id) {
            message.warning("Vui lòng đăng nhập để mua hàng");
            navigate('/login');
            return;
        }
        setActionLoading(prev => ({ ...prev, [book.id]: true }));
        try {
            await addToCart(book.id, 1);
            navigate('/cart');
        } catch (error) {
            message.error(error?.response?.message || 'Không thể thêm vào giỏ hàng');
        } finally {
            setActionLoading(prev => ({ ...prev, [book.id]: false }));
        }
    };

    const handleEdit = (book) => {
        setIsModalOpen(true);
        const editBookData = {
            id: book.id,
            mainText: book.mainText,
            author: book.author,
            price: book.price,
            sold: book.sold,
            quantity: book.quantity,
            category: book.category,
            image: book.image
        };
        setBookData(editBookData);
    };

    const handleDelete = async (book) => {
        try {
            const response = await deleteBookAPI(book.id);
            if (response.success) {
                message.success({
                    content: "Xóa sách thành công!",
                    description: response.message || "Sách đã được xóa khỏi hệ thống.",
                    duration: 3
                });
                // Refresh data
                const [topSellingRes, latestRes] = await Promise.all([
                    getTopSellingBooksAPI(),
                    getLatestBooksAPI()
                ]);
                if (topSellingRes.success) {
                    setTopSellingBooks(topSellingRes.data);
                }
                if (latestRes.success) {
                    setLatestBooks(latestRes.data);
                }
            } else {
                message.error({
                    content: "Không thể xóa sách!",
                    description: response.message || "Vui lòng thử lại sau.",
                    duration: 3
                });
            }
        } catch (error) {
            message.error({
                content: "Xóa sách thất bại!",
                description: error?.response?.message || "Có lỗi xảy ra khi xóa sách.",
                duration: 3
            });
        }
    };

    const loadBooks = async () => {
        try {
            const [topSellingRes, latestRes] = await Promise.all([
                getTopSellingBooksAPI(),
                getLatestBooksAPI()
            ]);

            if (topSellingRes.success) {
                setTopSellingBooks(topSellingRes.data);
            }
            if (latestRes.success) {
                setLatestBooks(latestRes.data);
            }
        } catch (error) {
            console.error('Error fetching books:', error);
            message.error('Không thể tải danh sách sách');
        }
    };

    const renderBookSection = (title, books, isLoading, type) => {
        return (
            <Card style={{ marginBottom: 24 }}>
                <Title level={4} style={{ marginBottom: 16 }}>{title}</Title>
                <Spin spinning={isLoading}>
                    {books.length > 0 ? (
                        <Row gutter={[16, 16]}>
                            {books.map(book => (
                                <Col xs={24} sm={12} md={8} lg={type === 'latest' ? 8 : 6} key={book.id}>
                                    <BookCard
                                        book={{
                                            ...book,
                                            title: book.mainText,
                                            category: book.category || { id: book.categoryId, name: book.categoryName }
                                        }}
                                        isAdmin={isAdmin}
                                        onEdit={isAdmin ? handleEdit : undefined}
                                        onDelete={isAdmin ? handleDelete : undefined}
                                        onAddToCart={!isAdmin ? handleAddToCart : undefined}
                                        onBuyNow={!isAdmin ? handleBuyNow : undefined}
                                        loading={actionLoading[book.id]}
                                        style={{ width: '100%', maxWidth: '280px', transition: 'all 0.3s ease' }}
                                    />
                                </Col>
                            ))}
                        </Row>
                    ) : (
                        <Empty description="Không có sách nào" />
                    )}
                </Spin>
            </Card>
        );
    };

    return (
        <div className="book-highlights">
            {renderBookSection(
                "Sách bán chạy",
                topSellingBooks,
                loading.topSelling,
                'topSelling'
            )}
            {renderBookSection(
                "Sách mới nhất",
                latestBooks,
                loading.latest,
                'latest'
            )}
            <BookForm
                isModalOpen={isModalOpen}
                setIsModalOpen={setIsModalOpen}
                bookData={bookData}
                setBookData={setBookData}
                onSuccess={loadBooks}
            />
        </div>
    );
};

export default BookHighlights; 