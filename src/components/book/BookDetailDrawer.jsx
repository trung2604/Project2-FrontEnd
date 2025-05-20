import { Drawer, Descriptions, Tag, Button, Popconfirm } from "antd";
import BookImage from "./BookImage";

const BookDetailDrawer = ({ open, onClose, book, onEdit, onDelete, isAdmin }) => {
    if (!book) return null;
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
                <BookImage image={book.image} alt={book.mainText} />
            </div>
            <Descriptions column={1} bordered size="small">
                <Descriptions.Item label="Tác giả">{book.author}</Descriptions.Item>
                <Descriptions.Item label="Giá">
                    {book.price?.toLocaleString()} đ
                </Descriptions.Item>
                <Descriptions.Item label="Số lượng">{book.quantity}</Descriptions.Item>
                <Descriptions.Item label="Đã bán">{book.sold}</Descriptions.Item>
                <Descriptions.Item label="Thể loại">
                    {Array.isArray(book.category)
                        ? book.category.map(cat => <Tag key={cat}>{cat}</Tag>)
                        : <Tag>{book.category}</Tag>}
                </Descriptions.Item>
                {/* Thêm các trường khác nếu cần */}
            </Descriptions>
        </Drawer>
    );
};

export default BookDetailDrawer; 