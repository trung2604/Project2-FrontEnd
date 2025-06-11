import { Drawer, Descriptions, Tag, Button, Popconfirm } from "antd";
import { Link, useParams } from 'react-router-dom';

const BookDetailDrawer = ({ open, onClose, book, onEdit, onDelete, isAdmin }) => {
    const { id: categoryId } = useParams(); // Lấy id danh mục từ URL
    if (!book) return null;
    console.log('Book in Drawer:', book);
    console.log('Book category in Drawer:', book.category);
    // Helper để lấy id và name của category - highlight nếu trùng categoryId
    const renderCategoryTag = (cat) => {
        const catId = typeof cat === 'object' && cat !== null ? cat.id : cat;
        const catName = typeof cat === 'object' && cat !== null ? cat.name || cat.id : catId;
        const isActive = categoryId && String(catId) === String(categoryId);
        return (
            <Tag
                key={catId}
                color={isActive ? "red" : "blue"}
                style={isActive ? { fontWeight: 'bold', border: '2px solid red' } : {}}
            >
                <Link
                    to={`/categories/${catId}`}
                    className={`category-link${isActive ? ' active' : ''}`}
                    onClick={e => e.stopPropagation()}
                >
                    {catName}
                </Link>
            </Tag>
        );
    };
    return (
        <Drawer
            title={book.mainText || "Chi tiết sách"}
            open={open}
            onClose={onClose}
            width={420}
            bodyStyle={{ padding: 24 }}
            extra={isAdmin && (
                <>
                    <Button
                        type="primary"
                        style={{ marginRight: 8 }}
                        onClick={() => onEdit && onEdit(book)}
                    >
                        Edit
                    </Button>
                    <Popconfirm
                        title="Bạn có chắc chắn muốn xóa sách này?"
                        onConfirm={() => onDelete && onDelete(book)}
                        okText="Xóa"
                        cancelText="Hủy"
                    >
                        <Button danger>Xóa</Button>
                    </Popconfirm>
                </>
            )}
        >
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 24 }}>
                <img
                    src={book.image?.medium || book.image?.original || book.image?.thumbnail || '/no-image.png'}
                    alt={book.mainText}
                    style={{
                        width: 220,
                        height: 220,
                        objectFit: 'cover',
                        borderRadius: 16,
                        boxShadow: '0 2px 12px rgba(0,0,0,0.10)',
                        background: '#f5f5f5'
                    }}
                />
            </div>
            <Descriptions column={1} bordered size="small">
                <Descriptions.Item label="Tác giả">{book.author}</Descriptions.Item>
                <Descriptions.Item label="Giá">
                    {book.price?.toLocaleString()} đ
                </Descriptions.Item>
                <Descriptions.Item label="Số lượng">{book.quantity}</Descriptions.Item>
                <Descriptions.Item label="Đã bán">{book.sold}</Descriptions.Item>
                <Descriptions.Item label="Thể loại">
                    <div className="book-categories" style={{ marginTop: 4 }}>
                        {Array.isArray(book.category) && book.category.length > 0 ? (
                            book.category.map(renderCategoryTag)
                        ) : book.category && typeof book.category === 'object' ? (
                            renderCategoryTag(book.category)
                        ) : book.category && typeof book.category === 'string' ? (
                            <Tag color="blue">{book.category}</Tag>
                        ) : (
                            <span style={{ color: '#aaa' }}>Không có</span>
                        )}
                    </div>
                </Descriptions.Item>
                {/* Thêm các trường khác nếu cần */}
            </Descriptions>
        </Drawer>
    );
};

export default BookDetailDrawer; 