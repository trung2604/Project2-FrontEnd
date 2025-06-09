import { useContext, useEffect, useState } from "react";
import { Button, Row, Col, message, Spin, Popconfirm, Empty, Pagination } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { getAllBookAPI, deleteBookAPI, getAllCategoriesAPI } from "../../services/api-service";
import { useCart } from "../context/cart-context.jsx";
import { useNavigate } from "react-router-dom";
import BookForm from "./BookForm";
import BookCard from "./BookCard";
import BookDetailDrawer from "./BookDetailDrawer";
import { AuthContext } from "../context/auth-context";

const BookList = ({ data, loadBooks, current, pageSize, total, setCurrent, setPageSize, setRefreshTrigger, refreshTrigger }) => {
    const { user } = useContext(AuthContext);
    const { addToCart } = useCart();
    const navigate = useNavigate();
    const isAdmin = user?.role === 'ROLE_ADMIN';
    const [categories, setCategories] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [bookData, setBookData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showDrawer, setShowDrawer] = useState(false);
    const [selectedBook, setSelectedBook] = useState(null);
    const [actionLoading, setActionLoading] = useState({});

    useEffect(() => {
        loadCategories();
    }, [refreshTrigger]);

    const loadCategories = async () => {
        try {
            const response = await getAllCategoriesAPI();
            if (response?.data) {
                const categoriesData = Array.isArray(response.data)
                    ? response.data
                    : Array.isArray(response.data.result)
                        ? response.data.result
                        : [];
                setCategories(categoriesData);
            }
        } catch (error) {
            console.error("Error loading categories:", error);
            message.error("Không thể tải danh sách thể loại");
        }
    };

    const handleEdit = (book) => {
        console.log('Book khi click edit từ BookList:', book);
        console.log('Category của book từ BookList:', book.category);
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
        console.log('EditBookData từ BookList:', editBookData);
        setBookData(editBookData);
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

    const handlePageChange = (page, pageSize) => {
        setCurrent(page);
        setPageSize(pageSize);
    };

    return (
        <div className="book-list-bg" style={{
            padding: "32px 0",
            minHeight: "100vh",
            background: "linear-gradient(135deg, #f7faff 0%, #e3e9f7 100%)"
        }}>
            {/* Header Section */}
            <div style={{
                width: '100%',
                maxWidth: 1400,
                margin: '0 auto 32px auto',
                padding: '0 24px',
                display: "flex",
                flexDirection: 'row',
                justifyContent: "space-between",
                alignItems: "center"
            }}>
                <div>
                    <h1 style={{
                        margin: 0,
                        fontWeight: 800,
                        fontSize: 28,
                        color: '#1a1a1a',
                        letterSpacing: '-0.5px'
                    }}>
                        {isAdmin ? "Quản lý sách" : "Cửa hàng sách"}
                    </h1>
                    <p style={{
                        margin: '8px 0 0 0',
                        fontSize: 16,
                        color: '#666',
                        fontWeight: 400
                    }}>
                        {isAdmin ? "Quản lý và cập nhật thông tin sách" : "Khám phá bộ sưu tập sách mới nhất"}
                    </p>
                </div>
                {isAdmin && (
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={handleCreate}
                        style={{
                            fontWeight: 600,
                            fontSize: 16,
                            height: '44px',
                            padding: '0 28px',
                            borderRadius: '8px',
                            boxShadow: '0 2px 8px rgba(24,144,255,0.15)'
                        }}
                    >
                        Thêm sách mới
                    </Button>
                )}
            </div>

            {/* Main Content */}
            <div style={{
                width: '100%',
                maxWidth: 1400,
                margin: '0 auto',
                padding: '0 24px'
            }}>
                <Spin spinning={loading} tip="Đang tải sách..." size="large">
                    <Row
                        gutter={[32, 32]}
                        justify="start"
                        style={{ margin: '0 -12px' }}
                    >
                        {Array.isArray(data) && data.map((book) => (
                            <Col
                                xs={24}
                                sm={12}
                                md={8}
                                lg={6}
                                xl={6}
                                xxl={4}
                                key={book.id}
                                style={{
                                    padding: '0 12px',
                                    display: 'flex',
                                    justifyContent: 'center'
                                }}
                            >
                                <BookCard
                                    book={normalizeBook(book)}
                                    categories={categories}
                                    isAdmin={isAdmin}
                                    onEdit={handleEdit}
                                    onDelete={handleDelete}
                                    onAddToCart={handleAddToCart}
                                    onBuyNow={handleBuyNow}
                                    onClick={handleCardClick}
                                    loading={actionLoading[book.id]}
                                    style={{
                                        width: '100%',
                                        maxWidth: '280px',
                                        transition: 'all 0.3s ease'
                                    }}
                                />
                            </Col>
                        ))}
                    </Row>
                    {(!data || data.length === 0) && !loading && (
                        <div style={{
                            textAlign: 'center',
                            padding: '48px 0',
                            background: '#fff',
                            borderRadius: '12px',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                        }}>
                            <Empty
                                description="Chưa có sách nào"
                                image={Empty.PRESENTED_IMAGE_SIMPLE}
                            />
                        </div>
                    )}

                    {/* Pagination */}
                    {data && data.length > 0 && (
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