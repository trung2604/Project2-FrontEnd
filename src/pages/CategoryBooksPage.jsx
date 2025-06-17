import { useEffect, useState, useContext } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Typography, Spin, Empty, Row, Col, Modal, message, Button } from 'antd';
import { getBooksByCategoryAPI, deleteBookAPI, getAllCategoriesAPI, getBookReviewSummaryAPI } from '../services/api-service';
import BookCard from '../components/book/BookCard';
import CategoryBookList from '../components/book/CategoryBookList';
import BookForm from '../components/book/BookForm';
import BookDetailDrawer from '../components/book/BookDetailDrawer';
import { AuthContext } from '../components/context/auth-context';
import { useCart } from '../components/context/cart-context';
import '../styles/book-card.css';

const { Title } = Typography;

const CategoryBooksPage = () => {
    const { categoryId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    const isAdmin = user?.role === 'ROLE_ADMIN';
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(false);
    const [category, setCategory] = useState(location.state?.category || null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [bookData, setBookData] = useState(null);
    const [showDrawer, setShowDrawer] = useState(false);
    const [selectedBook, setSelectedBook] = useState(null);
    const [categories, setCategories] = useState([]);
    const { addToCart } = useCart();
    const [actionLoading, setActionLoading] = useState({});

    useEffect(() => {
        loadCategories();
    }, []);

    const loadCategories = async () => {
        try {
            const res = await getAllCategoriesAPI({ size: 100 });
            const cats = Array.isArray(res.data) ? res.data : res.data.result || [];
            setCategories(cats);
        } catch (e) {
            setCategories([]);
        }
    };

    useEffect(() => {
        if (categoryId && categories.length > 0) {
            const found = categories.find(c => String(c.id) === String(categoryId));
            setCategory(found || null);
        }
    }, [categoryId, categories]);

    useEffect(() => {
        if (categoryId && categories.length > 0) {
            loadBooksByCategory();
        }
        // eslint-disable-next-line
    }, [categoryId, categories]);

    // Force refresh khi user focus vào window (khi quay lại tab)
    useEffect(() => {
        const handleFocus = () => {
            console.log('Window focused, refreshing category books...');
            if (categoryId && categories.length > 0) {
                loadBooksByCategory();
            }
        };

        const handleBeforeUnload = () => {
            console.log('Page is about to unload, clearing cache...');
            // Clear any cached data
            sessionStorage.clear();
        };

        window.addEventListener('focus', handleFocus);
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => {
            window.removeEventListener('focus', handleFocus);
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [categoryId, categories]);

    // Force refresh khi component mount
    useEffect(() => {
        console.log('CategoryBooksPage mounted, loading fresh data...');
        if (categoryId && categories.length > 0) {
            loadBooksByCategory();
        }
    }, [categoryId, categories]);

    // Force refresh ngay khi component mount lần đầu (chỉ chạy 1 lần)
    useEffect(() => {
        const timer = setTimeout(() => {
            console.log('Initial load completed, forcing refresh...');
            if (categoryId && categories.length > 0) {
                loadBooksByCategory();
            }
        }, 100); // Delay 100ms để đảm bảo component đã mount hoàn toàn

        return () => clearTimeout(timer);
    }, [categoryId, categories]);

    // Force refresh khi user thay đổi (đăng nhập/đăng xuất)
    useEffect(() => {
        console.log('User changed in CategoryBooksPage, refreshing data...', user?.id);
        if (categoryId && categories.length > 0) {
            loadBooksByCategory();
        }
    }, [user?.id, categoryId, categories]);

    // Force refresh khi navigate đến trang này
    useEffect(() => {
        console.log('Location changed in CategoryBooksPage, refreshing data...', location.pathname);
        if (categoryId && categories.length > 0) {
            loadBooksByCategory();
        }
    }, [location.pathname, categoryId, categories]);

    const loadBooksByCategory = async () => {
        setLoading(true);
        try {
            const response = await getBooksByCategoryAPI(categoryId);
            const booksData = response?.data?.content || [];
            console.log('booksData:', booksData);
            console.log('categories:', categories);
            // Map category id sang object luôn khi load books
            const mappedBooks = booksData.map(book => {
                let mappedBook = { ...book };
                // Đảm bảo image là object có thumbnail, medium, original
                if (mappedBook.image) {
                    if (typeof mappedBook.image === 'string') {
                        mappedBook.image = {
                            thumbnail: mappedBook.image,
                            medium: mappedBook.image,
                            original: mappedBook.image
                        };
                    } else if (typeof mappedBook.image === 'object') {
                        mappedBook.image = {
                            thumbnail: mappedBook.image.thumbnail || mappedBook.image.medium || mappedBook.image.original || '',
                            medium: mappedBook.image.medium || mappedBook.image.original || mappedBook.image.thumbnail || '',
                            original: mappedBook.image.original || mappedBook.image.medium || mappedBook.image.thumbnail || ''
                        };
                    }
                }
                if (Array.isArray(book.categoryId) && categories) {
                    mappedBook.category = book.categoryId
                        .map(catId => categories.find(c => String(c.id) === String(catId)))
                        .filter(Boolean);
                } else if (book.categoryId && categories) {
                    const found = categories.find(c => String(c.id) === String(book.categoryId));
                    mappedBook.category = found ? [found] : [];
                } else {
                    mappedBook.category = [];
                }
                // Nếu category là object nhưng thiếu name, bổ sung name từ categories
                mappedBook.category = (mappedBook.category || []).map(cat => {
                    if (typeof cat === 'object' && cat !== null && cat.name && cat.id) return cat;
                    const found = categories.find(c => String(c.id) === String(cat.id || cat));
                    return found ? { id: found.id, name: found.name } : (typeof cat === 'object' ? cat : { id: cat, name: String(cat) });
                });
                return mappedBook;
            });

            // Fetch rating data cho tất cả sách
            const booksWithRating = await fetchBooksWithRating(mappedBooks);
            setBooks(booksWithRating);
        } catch (error) {
            console.error("Error loading books:", error);
            message.error("Lỗi khi tải danh sách sách!");
        } finally {
            setLoading(false);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const fetchBooksWithRating = async (books) => {
        try {
            const booksWithRating = await Promise.all(
                books.map(async (book) => {
                    try {
                        const ratingResponse = await getBookReviewSummaryAPI(book.id);
                        console.log(`Rating response for book ${book.id}:`, ratingResponse);
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
                        console.error(`Error fetching rating for book ${book.id}:`, error);
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
            console.error('Error fetching books with rating:', error);
            return books.map(book => ({
                ...book,
                averageRating: 0,
                reviewCount: 0
            }));
        }
    };

    const handleCategorySelect = (selectedCategory) => {
        setCategory(selectedCategory);
    };

    const handleEdit = (book) => {
        setIsModalOpen(true);
        setBookData(book);
    };

    const handleDelete = async (book) => {
        try {
            const response = await deleteBookAPI(book.id);
            if (response.status === 200 || response.status === 204) {
                message.success({
                    content: "Xóa sách thành công!",
                    description: "Sách đã được xóa khỏi hệ thống.",
                    duration: 3
                });
                loadBooksByCategory();
            } else {
                message.error({
                    content: "Không thể xóa sách!",
                    description: "Vui lòng thử lại sau.",
                    duration: 3
                });
            }
        } catch (error) {
            message.error({
                content: "Xóa sách thất bại!",
                description: error?.response?.data?.message || "Có lỗi xảy ra khi xóa sách. Vui lòng thử lại sau.",
                duration: 3
            });
        }
    };

    const handleCardClick = (book) => {
        let mappedCategory = [];
        if (categories && categories.length > 0) {
            if (Array.isArray(book.categoryId)) {
                mappedCategory = book.categoryId
                    .map(catId => categories.find(c => String(c.id) === String(catId)))
                    .filter(Boolean);
            } else if (book.categoryId) {
                const found = categories.find(c => String(c.id) === String(book.categoryId));
                mappedCategory = found ? [found] : [];
            }
        }
        // Nếu vẫn không có, fallback lấy từ book.category hoặc book.categoryName
        if ((!mappedCategory || mappedCategory.length === 0)) {
            if (Array.isArray(book.category) && book.category.length > 0) {
                mappedCategory = book.category;
            } else if (book.category && typeof book.category === 'object') {
                mappedCategory = [book.category];
            } else if (book.categoryName) {
                mappedCategory = [{ name: book.categoryName }];
            }
        }
        const bookForDrawer = { ...book, category: mappedCategory };
        console.log('Book khi xem chi tiết:', bookForDrawer);
        setSelectedBook(bookForDrawer);
        setShowDrawer(true);
    };

    const handleAddToCart = async (book, e) => {
        if (!user?.id) {
            message.warning("Vui lòng đăng nhập để thêm vào giỏ hàng");
            navigate('/login');
            return;
        }
        setActionLoading(prev => ({ ...prev, [book.id]: true }));
        try {
            await addToCart(book.id, 1);
        } finally {
            setActionLoading(prev => ({ ...prev, [book.id]: false }));
        }
    };

    const handleBuyNow = async (book, e) => {
        if (!user?.id) {
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
        } finally {
            setActionLoading(prev => ({ ...prev, [book.id]: false }));
        }
    };

    const handleBookUpdate = () => {
        // Refresh dữ liệu sách sau khi có đánh giá mới
        loadBooksByCategory();
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
            }
        } catch (error) {
            console.error('Error updating book rating:', error);
        }
    };

    return (
        <div className="book-list-bg" style={{ padding: "24px 0 0 0", minHeight: "100vh" }}>
            <div style={{ marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 32px" }}>
                <h3 style={{ margin: 0, fontWeight: 700, fontSize: 24, color: '#222' }}>
                    {category ? `Sách thuộc danh mục: ${category.name}` : 'Tất cả sách'}
                </h3>
            </div>
            <Row gutter={[24, 24]}>
                <Col xs={24} md={6}>
                    <div style={{ background: '#fff', padding: '24px', borderRadius: '8px' }}>
                        <CategoryBookList onCategorySelect={handleCategorySelect} />
                    </div>
                </Col>
                <Col xs={24} md={18}>
                    <div style={{ background: '#fff', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                        <Spin spinning={loading} tip="Đang tải sách..." size="large">
                            <Row gutter={[32, 32]} justify="start">
                                {books.length === 0 ? (
                                    <Empty description="Không có sách nào trong danh mục này" />
                                ) : (
                                    books.map(book => {
                                        let mappedBook = { ...book };
                                        if (Array.isArray(book.categoryId) && categories) {
                                            mappedBook.category = book.categoryId
                                                .map(catId => categories.find(c => String(c.id) === String(catId)))
                                                .filter(Boolean);
                                        } else if (book.categoryId && categories) {
                                            const found = categories.find(c => String(c.id) === String(book.categoryId));
                                            mappedBook.category = found ? [found] : [];
                                        }
                                        return (
                                            <Col
                                                xs={24}
                                                sm={12}
                                                md={8}
                                                lg={6}
                                                xl={6}
                                                xxl={4}
                                                key={book.id}
                                                style={{ display: 'flex', justifyContent: 'center', marginBottom: '32px' }}
                                            >
                                                <BookCard
                                                    book={{
                                                        ...mappedBook,
                                                        title: mappedBook.mainText,
                                                        category: mappedBook.category || { id: mappedBook.categoryId, name: mappedBook.categoryName }
                                                    }}
                                                    categories={categories}
                                                    isAdmin={isAdmin}
                                                    onEdit={isAdmin ? handleEdit : undefined}
                                                    onDelete={isAdmin ? handleDelete : undefined}
                                                    onAddToCart={!isAdmin ? handleAddToCart : undefined}
                                                    onBuyNow={!isAdmin ? handleBuyNow : undefined}
                                                    onClick={handleCardClick}
                                                    loading={actionLoading[mappedBook.id]}
                                                    style={{ width: '100%', maxWidth: '280px', transition: 'all 0.3s ease' }}
                                                />
                                            </Col>
                                        );
                                    })
                                )}
                            </Row>
                        </Spin>
                    </div>
                </Col>
            </Row>
            <BookForm
                isModalOpen={isModalOpen}
                setIsModalOpen={setIsModalOpen}
                bookData={bookData}
                setBookData={setBookData}
                loadBooks={loadBooksByCategory}
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

export default CategoryBooksPage; 