import { useContext, useEffect, useState } from "react";
import { Button, Row, Col, message, Spin, Popconfirm, Empty, Pagination, List } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { getAllBookAPI, deleteBookAPI, getAllCategoriesAPI, searchBooksAPI, getNewBooksAPI, getBestSellersAPI, getBookReviewSummaryAPI } from "../../services/api-service";
import { useCart } from "../context/cart-context.jsx";
import { useNavigate, useLocation } from "react-router-dom";
import BookForm from "./BookForm";
import BookCard from "./BookCard";
import BookDetailDrawer from "./BookDetailDrawer";
import BookSearchForm from "./BookSearchForm";
import { AuthContext } from "../context/auth-context";
import '../../styles/book-card.css';

const BookList = ({ setRefreshTrigger, refreshTrigger }) => {
    const { user } = useContext(AuthContext);
    const { addToCart } = useCart();
    const navigate = useNavigate();
    const location = useLocation();
    const isAdmin = user?.role === 'ROLE_ADMIN';

    // State management
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(false);
    const [current, setCurrent] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [total, setTotal] = useState(0);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [bookData, setBookData] = useState(null);
    const [showDrawer, setShowDrawer] = useState(false);
    const [selectedBook, setSelectedBook] = useState(null);
    const [actionLoading, setActionLoading] = useState({});
    const [isSearching, setIsSearching] = useState(false);
    const [searchParams, setSearchParams] = useState({});
    const [newBooks, setNewBooks] = useState([]);
    const [bestSellers, setBestSellers] = useState([]);

    useEffect(() => {
        loadBooks();
        loadNewBooks();
        loadBestSellers();
    }, [current, pageSize, searchParams, isSearching, refreshTrigger]);

    // Force refresh khi user thay đổi (đăng nhập/đăng xuất)
    useEffect(() => {
        console.log('User changed, refreshing data...', user?.id);
        loadBooks();
        loadNewBooks();
        loadBestSellers();
    }, [user?.id]);

    // Force refresh khi component mount
    useEffect(() => {
        console.log('BookList mounted, loading fresh data...');
        loadBooks();
        loadNewBooks();
        loadBestSellers();
    }, []);

    // Force refresh ngay khi component mount lần đầu (chỉ chạy 1 lần)
    useEffect(() => {
        const timer = setTimeout(() => {
            console.log('Initial load completed, forcing refresh...');
            loadBooks();
            loadNewBooks();
            loadBestSellers();
        }, 100); // Delay 100ms để đảm bảo component đã mount hoàn toàn

        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        const handleResize = () => {
            let newPageSize = 4; // mặc định
            const width = window.innerWidth;
            if (width >= 1600) newPageSize = 12;
            else if (width >= 1200) newPageSize = 8;
            else if (width >= 900) newPageSize = 6;
            else if (width >= 600) newPageSize = 4;
            else newPageSize = 2;
            setPageSize(newPageSize);
        };
        window.addEventListener('resize', handleResize);
        handleResize();
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const fetchBooksWithRating = async (books) => {
        try {
            const booksWithRating = await Promise.all(
                books.map(async (book) => {
                    try {
                        const ratingResponse = await getBookReviewSummaryAPI(book.id);
                        if (ratingResponse?.success && ratingResponse?.data) {
                            return {
                                ...book,
                                averageRating: ratingResponse.data.averageRating || 0,
                                reviewCount: ratingResponse.data.totalReviews || 0
                            };
                        }
                        return {
                            ...book,
                            averageRating: 0,
                            reviewCount: 0
                        };
                    } catch (error) {
                        return {
                            ...book,
                            averageRating: 0,
                            reviewCount: 0
                        };
                    }
                })
            );
            return booksWithRating;
        } catch (error) {
            return books.map(book => ({ ...book, averageRating: 0, reviewCount: 0 }));
        }
    };

    const loadBooks = async () => {
        setLoading(true);
        try {
            let response;
            if (isSearching && Object.keys(searchParams).length > 0) {
                response = await searchBooksAPI({ ...searchParams, page: current - 1, size: pageSize });
                if (response?.success && response?.data) {
                    const { content, totalElements } = response.data;
                    const booksWithRating = await fetchBooksWithRating(content || []);
                    setBooks(booksWithRating);
                    setTotal(totalElements || 0);
                } else {
                    setBooks([]);
                    setTotal(0);
                }
            } else {
                response = await getAllBookAPI(current - 1, pageSize);
                if (response?.success && response?.data) {
                    const { content, totalElements } = response.data;
                    const booksWithRating = await fetchBooksWithRating(content || []);
                    setBooks(booksWithRating);
                    setTotal(totalElements || 0);
                } else {
                    setBooks([]);
                    setTotal(0);
                }
            }
        } catch (error) {
            setBooks([]);
            setTotal(0);
        } finally {
            setLoading(false);
        }
    };

    const loadNewBooks = async () => {
        try {
            const response = await getNewBooksAPI();
            if (response?.success && Array.isArray(response.data)) {
                const booksWithRating = await fetchBooksWithRating(response.data);
                setNewBooks(booksWithRating);
            } else {
                setNewBooks([]);
            }
        } catch (error) {
            setNewBooks([]);
        }
    };

    const loadBestSellers = async () => {
        try {
            const response = await getBestSellersAPI();
            if (response?.success && Array.isArray(response.data)) {
                const booksWithRating = await fetchBooksWithRating(response.data);
                setBestSellers(booksWithRating);
            } else {
                setBestSellers([]);
            }
        } catch (error) {
            setBestSellers([]);
        }
    };

    useEffect(() => {
        console.log('Current newBooks state:', newBooks);
        console.log('Current bestSellers state:', bestSellers);
    }, [newBooks, bestSellers]);

    const handleSearch = (params) => {
        setIsSearching(true);
        setSearchParams(params);
        setCurrent(1); // Reset to first page on new search
    };

    const handlePageChange = (page, size) => {
        if (page && !isNaN(page)) {
            setCurrent(page);
            setPageSize(size);
        }
    };

    const handleReset = () => {
        setIsSearching(false);
        setSearchParams({});
        setCurrent(1);
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
            if (response.success === true) {
                message.success({
                    content: "Xóa sách thành công!",
                    description: "Sách đã được xóa khỏi hệ thống.",
                    duration: 3
                });
                setRefreshTrigger(prev => prev + 1);
            }
        } catch (error) {
            message.error({
                content: "Xóa sách thất bại!",
                description: error?.response?.data?.message || "Có lỗi xảy ra khi xóa sách.",
                duration: 3
            });
        }
    };

    const handleCreate = () => {
        setIsModalOpen(true);
        setBookData(null);
    };

    const handleCardClick = (book) => {
        setSelectedBook(book);
        setShowDrawer(true);
    };

    const handleBookUpdate = () => {
        // Refresh dữ liệu sách sau khi có đánh giá mới
        loadBooks();
        loadNewBooks();
        loadBestSellers();
    };

    const updateBookRating = async (bookId) => {
        try {
            const ratingResponse = await getBookReviewSummaryAPI(bookId);
            console.log(`Updating rating for book ${bookId}:`, ratingResponse);
            if (ratingResponse?.success && ratingResponse?.data) {
                // Cập nhật rating cho sách cụ thể trong danh sách
                setBooks(prevBooks =>
                    prevBooks.map(book =>
                        book.id === bookId
                            ? {
                                ...book,
                                averageRating: ratingResponse.data.averageRating || 0,
                                reviewCount: ratingResponse.data.totalReviews || 0
                            }
                            : book
                    )
                );

                // Cập nhật rating cho sách trong newBooks
                setNewBooks(prevBooks =>
                    prevBooks.map(book =>
                        book.id === bookId
                            ? {
                                ...book,
                                averageRating: ratingResponse.data.averageRating || 0,
                                reviewCount: ratingResponse.data.totalReviews || 0
                            }
                            : book
                    )
                );

                // Cập nhật rating cho sách trong bestSellers
                setBestSellers(prevBooks =>
                    prevBooks.map(book =>
                        book.id === bookId
                            ? {
                                ...book,
                                averageRating: ratingResponse.data.averageRating || 0,
                                reviewCount: ratingResponse.data.totalReviews || 0
                            }
                            : book
                    )
                );
            }
        } catch (error) {
            console.error('Error updating book rating:', error);
        }
    };

    const handleAddToCart = async (book, e) => {
        if (!user?.id) {
            message.destroy();
            message.warning("Vui lòng đăng nhập để thêm vào giỏ hàng");
            navigate('/login');
            return;
        }
        setActionLoading(prev => ({ ...prev, [book.id]: true }));
        try {
            const response = await addToCart(book.id, 1);
            message.destroy();
            if (response && response.success === true) {
                message.success(response && response.message ? response.message : 'Đã thêm vào giỏ hàng!');
            } else {dasnh 
                message.error(response && response.message ? response.message : 'Thêm vào giỏ hàng thất bại!');
            }
        } catch (error) {
            message.destroy();
            message.error(error && error.message ? error.message : 'Thêm vào giỏ hàng thất bại!');
        } finally {
            setActionLoading(prev => ({ ...prev, [book.id]: false }));
        }
    };

    const handleBuyNow = async (book, e) => {
        if (!user?.id) {
            message.destroy();
            message.warning("Vui lòng đăng nhập để mua hàng");
            navigate('/login');
            return;
        }
        setActionLoading(prev => ({ ...prev, [book.id]: true }));
        try {
            // Tạo dữ liệu sách cho checkout
            const bookForCheckout = {
                bookId: book.id,
                bookTitle: book.mainText,
                bookImage: book.image,
                price: book.price,
                quantity: 1,
                totalPrice: book.price
            };

            // Chuyển đến trang checkout với sách này
            navigate('/checkout', {
                state: {
                    cart: [bookForCheckout],
                    isBuyNow: true // Flag để biết đây là mua ngay
                }
            });
        } catch (error) {
            message.destroy();
            message.error('Không thể thực hiện mua ngay');
        } finally {
            setActionLoading(prev => ({ ...prev, [book.id]: false }));
        }
    };

    const normalizeBook = (book) => {
        if (book.category && typeof book.category === 'object') {
            return { ...book, category: [book.category] };
        }
        if (!book.category && book.categoryId && categories.length > 0) {
            const found = categories.find(c => String(c.id) === String(book.categoryId));
            return { ...book, category: found ? [found] : [] };
        }
        return { ...book, category: [] };
    };

    console.log('Rendering with newBooks:', newBooks);
    console.log('Rendering with bestSellers:', bestSellers);

    return (
        <div className="book-list-container" style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
            {/* Search Form */}
            <BookSearchForm
                onSearch={handleSearch}
                onReset={handleReset}
                loading={loading}
            />

            {/* Admin Actions */}
            {isAdmin && (
                <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={handleCreate}
                    >
                        Thêm sách mới
                    </Button>
                </div>
            )}

            {/* Main Book List */}
            <div style={{ background: '#fff', padding: '24px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                <Spin spinning={loading} tip="Đang tải dữ liệu..." size="large">
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <Row gutter={[32, 32]} justify="center" style={{ width: '100%' }}>
                            {Array.isArray(books) && books.length > 0 ? (
                                books.map((book) => (
                                    <Col
                                        xs={24}
                                        sm={12}
                                        md={12}
                                        lg={8}
                                        xl={6}
                                        xxl={6}
                                        key={book.id}
                                        style={{ display: 'flex', justifyContent: 'center' }}
                                    >
                                        <BookCard
                                            book={{
                                                ...book,
                                                title: book.mainText,
                                                category: book.category || { id: book.categoryId, name: book.categoryName }
                                            }}
                                            isAdmin={isAdmin}
                                            onEdit={handleEdit}
                                            onDelete={handleDelete}
                                            onAddToCart={handleAddToCart}
                                            onBuyNow={handleBuyNow}
                                            onClick={handleCardClick}
                                            loading={actionLoading[book.id]}
                                        />
                                    </Col>
                                ))
                            ) : (
                                <Col span={24}>
                                    <Empty description="Không tìm thấy sách nào" />
                                </Col>
                            )}
                        </Row>
                        {/* Pagination */}
                        {Array.isArray(books) && books.length > 0 && (
                            <div style={{ display: 'flex', justifyContent: 'center', width: '100%', marginTop: 32 }}>
                                <Pagination
                                    current={current}
                                    pageSize={pageSize}
                                    total={total}
                                    onChange={handlePageChange}
                                    showSizeChanger
                                    showQuickJumper
                                    showTotal={(total, range) => `${range[0]}-${range[1]} của ${total} sách`}
                                    pageSizeOptions={['5', '10', '20', '50']}
                                    disabled={loading}
                                />
                            </div>
                        )}
                    </div>
                </Spin>
            </div>

            {/* Modals and Drawers */}
            <BookForm
                isModalOpen={isModalOpen}
                setIsModalOpen={setIsModalOpen}
                bookData={bookData}
                setBookData={setBookData}
                setRefreshTrigger={setRefreshTrigger}
                loadBooks={loadBooks}
            />

            <BookDetailDrawer
                open={showDrawer}
                onClose={() => setShowDrawer(false)}
                book={selectedBook}
                isAdmin={isAdmin}
                onEdit={(book) => {
                    setShowDrawer(false);
                    setTimeout(() => {
                        handleEdit(book);
                    }, 300);
                }}
                onDelete={(book) => {
                    setShowDrawer(false);
                    setTimeout(() => {
                        handleDelete(book);
                    }, 300);
                }}
                onBookUpdate={() => {
                    if (selectedBook?.id) {
                        updateBookRating(selectedBook.id);
                    }
                    handleBookUpdate();
                }}
            />
        </div>
    );
};

export default BookList; 