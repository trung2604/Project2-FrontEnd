import { useContext, useEffect, useState } from "react";
import { Card, Button, Row, Col, Popconfirm, message, Spin, Space } from "antd";
import { EditOutlined, DeleteOutlined, PlusOutlined, ShoppingCartOutlined, ThunderboltOutlined } from "@ant-design/icons";
import { getAllBookAPI, deleteBookAPI } from "../../services/api-service";
import { useCart } from "../context/cart-context.jsx";
import { useNavigate } from "react-router-dom";
import BookForm from "./BookForm";
import BookImage from "./BookImage";
import '../../styles/book-card.css';
import BookDetailDrawer from "./BookDetailDrawer";
import { AuthContext } from "../context/auth-context";

const BookList = () => {
    const { user } = useContext(AuthContext);
    const { addToCart } = useCart();
    const navigate = useNavigate();
    const isAdmin = user?.role === 'ROLE_ADMIN';
    const [books, setBooks] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [bookData, setBookData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showDrawer, setShowDrawer] = useState(false);
    const [selectedBook, setSelectedBook] = useState(null);
    const [actionLoading, setActionLoading] = useState({});

    useEffect(() => {
        loadBooks();
    }, []);

    const loadBooks = async () => {
        setLoading(true);
        try {
            const response = await getAllBookAPI(1, 100);
            if (response.data) {
                setBooks(response.data.result || response.data);
            }
        } catch {
            message.error("Lỗi khi tải danh sách sách!");
        } finally {
            setLoading(false);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const handleEdit = (book) => {
        setIsModalOpen(true);
        setBookData(book);
    };

    const handleDelete = async (bookId) => {
        try {
            const response = await deleteBookAPI(bookId);
            if (response.status === 200 || response.status === 204) {
                message.success({
                    content: "Xóa sách thành công!",
                    description: "Sách đã được xóa khỏi hệ thống.",
                    duration: 3
                });
                loadBooks();
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

    const handleCreate = () => {
        setIsModalOpen(true);
        setBookData(null);
    };

    const handleCardClick = (book) => {
        setSelectedBook(book);
        setShowDrawer(true);
    };

    const handleAddToCart = async (book, e) => {
        e.stopPropagation(); // Ngăn chặn sự kiện click lan ra card
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
        e.stopPropagation(); // Ngăn chặn sự kiện click lan ra card
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
                <h3 style={{ margin: 0, fontWeight: 700, fontSize: 24, color: '#222' }}>{isAdmin ? "Book Management" : "Book Store"}</h3>
                {isAdmin && (
                    <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate} style={{ fontWeight: 600, fontSize: 16 }}>
                        Create Book
                    </Button>
                )}
            </div>
            <Spin spinning={loading} tip="Đang tải sách..." size="large">
                <Row gutter={[32, 32]} justify="center" style={{ padding: "0 16px" }}>
                    {books.map((book) => (
                        <Col xs={24} sm={12} md={8} lg={6} xl={6} xxl={4} key={book.id}>
                            <Card
                                className="book-card"
                                cover={
                                    <div onClick={() => handleCardClick(book)}>
                                        <BookImage image={book.image} alt={book.mainText} />
                                    </div>
                                }
                                actions={isAdmin ? [
                                    <Button icon={<EditOutlined />} onClick={() => handleEdit(book)}>Edit</Button>,
                                    <Popconfirm
                                        title="Bạn có chắc chắn muốn xóa sách này?"
                                        onConfirm={() => handleDelete(book.id)}
                                        okText="Xóa"
                                        cancelText="Hủy"
                                    >
                                        <Button danger icon={<DeleteOutlined />}>Delete</Button>
                                    </Popconfirm>
                                ] : [
                                    <Space direction="vertical" style={{ width: '100%', padding: '8px 0' }}>
                                        <Button
                                            type="primary"
                                            icon={<ShoppingCartOutlined />}
                                            onClick={(e) => handleAddToCart(book, e)}
                                            loading={actionLoading[book.id]}
                                            block
                                        >
                                            Thêm vào giỏ
                                        </Button>
                                        <Button
                                            type="primary"
                                            danger
                                            icon={<ThunderboltOutlined />}
                                            onClick={(e) => handleBuyNow(book, e)}
                                            loading={actionLoading[book.id]}
                                            block
                                        >
                                            Mua ngay
                                        </Button>
                                    </Space>
                                ]}
                                onClick={() => !isAdmin && handleCardClick(book)}
                                style={{ cursor: isAdmin ? 'default' : 'pointer' }}
                            >
                                <Card.Meta
                                    title={book.mainText}
                                    description={
                                        <>
                                            <div>Tác giả: {book.author}</div>
                                            <div style={{ color: '#f5222d', fontWeight: 600, fontSize: 16 }}>
                                                {book.price?.toLocaleString()}đ
                                            </div>
                                            <div style={{ color: book.quantity > 0 ? '#52c41a' : '#f5222d' }}>
                                                {book.quantity > 0 ? `Còn ${book.quantity} cuốn` : 'Hết hàng'}
                                            </div>
                                        </>
                                    }
                                />
                            </Card>
                        </Col>
                    ))}
                </Row>
            </Spin>
            <BookForm
                isModalOpen={isModalOpen}
                setIsModalOpen={setIsModalOpen}
                bookData={bookData}
                setBookData={setBookData}
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
                        handleDelete(book.id);
                    }, 300);
                }}
            />
        </div>
    );
};

export default BookList; 