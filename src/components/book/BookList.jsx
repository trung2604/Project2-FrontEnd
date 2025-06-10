import { useContext, useEffect, useState } from "react";
import { Button, Row, Col, message, Spin, Popconfirm, Empty, Pagination, List } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { getAllBookAPI, deleteBookAPI, getAllCategoriesAPI, searchBooksAPI, getNewBooksAPI, getBestSellersAPI } from "../../services/api-service";
import { useCart } from "../context/cart-context.jsx";
import { useNavigate } from "react-router-dom";
import BookForm from "./BookForm";
import BookCard from "./BookCard";
import BookDetailDrawer from "./BookDetailDrawer";
import BookSearchForm from "./BookSearchForm";
import { AuthContext } from "../context/auth-context";

const BookList = ({ setRefreshTrigger, refreshTrigger }) => {
    const { user } = useContext(AuthContext);
    const { addToCart } = useCart();
    const navigate = useNavigate();
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

    const loadBooks = async () => {
        setLoading(true);
        try {
            let response;
            if (isSearching && Object.keys(searchParams).length > 0) {
                response = await searchBooksAPI({ ...searchParams, page: current - 1, size: pageSize });
                if (response?.success && response?.data) {
                    const { content, totalElements, number, size } = response.data;
                    setBooks(content || []);
                    setTotal(totalElements || 0);
                    setCurrent((number || 0) + 1);
                    setPageSize(size || 10);
                } else {
                    setBooks([]);
                    setTotal(0);
                }
            } else {
                response = await getAllBookAPI(current - 1, pageSize);
                if (response?.success && response?.data) {
                    const { content, totalElements, number, size } = response.data;
                    setBooks(content || []);
                    setTotal(totalElements || 0);
                    setCurrent((number || 0) + 1);
                    setPageSize(size || 10);
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
            console.log('New Books API Response:', response);
            if (response?.success && Array.isArray(response.data)) {
                console.log('Setting new books:', response.data);
                setNewBooks(response.data);
            } else {
                console.log('No new books data or invalid format');
                setNewBooks([]);
            }
        } catch (error) {
            console.error('Error loading new books:', error);
            setNewBooks([]);
        }
    };

    const loadBestSellers = async () => {
        try {
            const response = await getBestSellersAPI();
            console.log('Best Sellers API Response:', response);
            if (response?.success && Array.isArray(response.data)) {
                console.log('Setting best sellers:', response.data);
                setBestSellers(response.data);
            } else {
                console.log('No best sellers data or invalid format');
                setBestSellers([]);
            }
        } catch (error) {
            console.error('Error loading best sellers:', error);
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
        setCurrent(page);
        setPageSize(size);
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
                <Spin spinning={loading}>
                    <Row gutter={[32, 32]} justify="start">
                        {Array.isArray(books) && books.length > 0 ? (
                            books.map((book) => {
                                return (
                                    <Col
                                        xs={24}
                                        sm={12}
                                        md={8}
                                        lg={6}
                                        xl={6}
                                        xxl={4}
                                        key={book.id}
                                        style={{
                                            display: 'flex',
                                            justifyContent: 'center'
                                        }}
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
                                            style={{ width: '100%', maxWidth: '280px', transition: 'all 0.3s ease' }}
                                        />
                                    </Col>
                                );
                            })
                        ) : (
                            <Col span={24}>
                                <Empty description="Không tìm thấy sách nào" />
                            </Col>
                        )}
                    </Row>

                    {/* Pagination */}
                    {Array.isArray(books) && books.length > 0 && (
                        <div style={{
                            marginTop: '32px',
                            display: 'flex',
                            justifyContent: 'center'
                        }}>
                            <Pagination
                                current={current}
                                pageSize={pageSize}
                                total={total}
                                onChange={handlePageChange}
                                showSizeChanger
                                showQuickJumper
                                showTotal={(total, range) => `${range[0]}-${range[1]} của ${total} sách`}
                                pageSizeOptions={['5', '10', '20', '50']}
                            />
                        </div>
                    )}
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
            />
        </div>
    );
};

export default BookList; 