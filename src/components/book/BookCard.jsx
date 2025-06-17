import { Button, Space, Tag, Typography, Tooltip, Popconfirm, Rate } from 'antd';
import { EditOutlined, DeleteOutlined, ShoppingCartOutlined, ThunderboltOutlined, StarOutlined } from '@ant-design/icons';
import BookImage from '../common/BookImage';
import '../../styles/book-card.css';

const { Text, Title } = Typography;

const BookCard = ({
    book,
    categories = [],
    isAdmin = false,
    onEdit,
    onDelete,
    onAddToCart,
    onBuyNow,
    onClick,
    loading = false,
    style = {}
}) => {
    // Lấy tên thể loại từ object hoặc id
    const getCategoryNames = () => {
        if (!book.category) return [];
        return (Array.isArray(book.category) ? book.category : [book.category]).map(cat => {
            if (typeof cat === 'object' && cat !== null && cat.name) return cat.name;
            const category = categories.find(c => c.id === cat);
            return category?.name || String(cat);
        });
    };

    const categoryNames = getCategoryNames();

    const handleCardClick = (e) => {
        if (e.target.closest('button')) return;
        if (onClick) onClick(book);
    };

    const renderActions = () => (
        <div className="book-card-actions">
            {isAdmin ? (
                <>
                    <div className="book-card-action-btn">
                        <Button
                            type="primary"
                            icon={<EditOutlined />}
                            onClick={(e) => {
                                e.stopPropagation();
                                onEdit?.(book);
                            }}
                        >
                            Sửa
                        </Button>
                    </div>
                    <div className="book-card-action-btn">
                        <Popconfirm
                            title="Bạn có chắc chắn muốn xóa sách này?"
                            onConfirm={() => onDelete?.(book)}
                            okText="Xóa"
                            cancelText="Hủy"
                        >
                            <Button
                                danger
                                icon={<DeleteOutlined />}
                                onClick={e => e.stopPropagation()}
                            >
                                Xóa
                            </Button>
                        </Popconfirm>
                    </div>
                </>
            ) : (
                <>
                    <div className="book-card-action-btn">
                        <Button
                            type="primary"
                            icon={<ShoppingCartOutlined style={{ fontSize: 16 }} />}
                            onClick={(e) => {
                                e.stopPropagation();
                                onAddToCart?.(book, e);
                            }}
                            loading={loading}
                        >
                            Thêm vào giỏ
                        </Button>
                    </div>
                    <div className="book-card-action-btn">
                        <Button
                            type="primary"
                            danger
                            icon={<ThunderboltOutlined style={{ fontSize: 16 }} />}
                            onClick={(e) => {
                                e.stopPropagation();
                                onBuyNow?.(book, e);
                            }}
                            loading={loading}
                        >
                            Mua ngay
                        </Button>
                    </div>
                </>
            )}
        </div>
    );

    return (
        <div
            className="book-card"
            style={{
                ...style,
                height: 'auto',
                minHeight: '280px',
                display: 'flex',
                flexDirection: 'column',
                background: '#fff',
                borderRadius: '16px',
                overflow: 'hidden',
                boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
                border: '1px solid rgba(0,0,0,0.06)',
                transition: 'all 0.3s ease'
            }}
            onClick={handleCardClick}
        >
            {/* Book Image Section */}
            <div
                className="book-card-cover"
                style={{
                    width: '100%',
                    flexShrink: 0,
                    background: '#f8f9fa',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    position: 'relative'
                }}
            >
                <BookImage
                    image={book.image}
                    alt={book.mainText}
                    aspectRatio="3/4"
                    objectFit="contain"
                    size="medium"
                />
                {book.quantity === 0 && (
                    <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(0,0,0,0.5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff',
                        fontSize: '16px',
                        fontWeight: '600'
                    }}>
                        Hết hàng
                    </div>
                )}
            </div>

            {/* Book Info Section */}
            <div
                className="book-card-content"
                style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    padding: '10px',
                    background: '#fff',
                    gap: '8px'
                }}
            >
                {/* Title */}
                <Tooltip title={book.mainText}>
                    <Title
                        level={5}
                        style={{
                            margin: 0,
                            fontSize: '16px',
                            lineHeight: 1.4,
                            fontWeight: 700,
                            color: '#1a1a1a',
                            height: '44px',
                            overflow: 'hidden',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical'
                        }}
                    >
                        {book.mainText || 'Không có tiêu đề'}
                    </Title>
                </Tooltip>

                {/* Author */}
                <div style={{ display: 'flex', alignItems: 'center', minHeight: 24 }}>
                    <Text strong style={{ minWidth: 60, color: '#444', fontSize: 13 }}>Tác giả:</Text>
                    <Text
                        type="secondary"
                        style={{
                            fontSize: '13px',
                            color: '#666',
                            marginLeft: 6,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            flex: 1
                        }}
                    >
                        {book.author || 'Không rõ tác giả'}
                    </Text>
                </div>

                {/* Categories */}
                <div style={{ display: 'flex', alignItems: 'center', minHeight: 24 }}>
                    <Text strong style={{ minWidth: 60, color: '#444', fontSize: 13 }}>Thể loại:</Text>
                    <Text
                        type="secondary"
                        style={{
                            fontSize: '13px',
                            color: '#666',
                            marginLeft: 6,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            flex: 1
                        }}
                    >
                        {categoryNames.length > 0 ? categoryNames.join(', ') : 'Không có thể loại'}
                    </Text>
                </div>

                {/* Rating */}
                <div style={{ display: 'flex', alignItems: 'center', minHeight: 24 }}>
                    <Text strong style={{ minWidth: 60, color: '#444', fontSize: 13 }}>Đánh giá:</Text>
                    <div style={{ display: 'flex', alignItems: 'center', marginLeft: 6 }}>
                        <Rate
                            disabled
                            value={book.averageRating || 0}
                            style={{ fontSize: '12px' }}
                        />
                        <Text type="secondary" style={{ fontSize: '12px', marginLeft: 4 }}>
                            ({book.reviewCount || 0})
                        </Text>
                    </div>
                </div>

                {/* Price and Stock Info */}
                <div className="book-price-stock-row">
                    {/* Price */}
                    <div className="book-price-row">
                        <Text strong style={{ minWidth: 60, color: '#444', fontSize: 13 }}>Giá:</Text>
                        <Text strong style={{ fontSize: '15px', color: '#f5222d', fontWeight: 700, marginLeft: 6 }}>
                            {book.price ? book.price.toLocaleString() + 'đ' : 'Chưa có giá'}
                        </Text>
                    </div>

                    {/* Stock */}
                    <div className="book-stock-row">
                        <Text strong style={{ minWidth: 60, color: '#444', fontSize: 13 }}>Số lượng:</Text>
                        <Text style={{ color: book.quantity > 0 ? '#52c41a' : '#f5222d', fontSize: '12px', fontWeight: 500, marginLeft: 6 }}>
                            {typeof book.quantity === 'number'
                                ? (book.quantity > 0 ? `Còn ${book.quantity} cuốn` : 'Hết hàng')
                                : 'Chưa rõ số lượng'}
                        </Text>
                    </div>

                    {/* Sold */}
                    <div className="book-sold-row">
                        <Text strong style={{ minWidth: 60, color: '#444', fontSize: 13 }}>Đã bán:</Text>
                        <Text type="secondary" style={{ fontSize: '12px', marginLeft: 6 }}>
                            {typeof book.sold === 'number' ? book.sold : 0}
                        </Text>
                    </div>

                    {/* Action Buttons */}
                    {renderActions()}
                </div>
            </div>
        </div>
    );
};

export default BookCard; 