import { useEffect, useState, useContext } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Typography, Spin, Empty, Row, Col, Modal, message, Button } from 'antd';
import { getBooksByCategoryAPI, deleteBookAPI, getAllCategoriesAPI } from '../services/api-service';
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
    const navigate = useNavigate();
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
            setBooks(mappedBooks);
        } catch (error) {
            console.error("Error loading books:", error);
            message.error("Lỗi khi tải danh sách sách!");
        } finally {
            setLoading(false);
            window.scrollTo({ top: 0, behavior: 'smooth' });
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
        setSelectedBook(book);
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
            await addToCart(book.id, 1);
            navigate('/cart');
        } finally {
            setActionLoading(prev => ({ ...prev, [book.id]: false }));
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
                    <div style={{ background: '#fff', padding: '24px', borderRadius: '8px', maxWidth: 1200, margin: '0 auto', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
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
                                                    book={mappedBook}
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
            />
        </div>
    );
};

export default CategoryBooksPage; 