import React, { useEffect, useState, useContext } from "react";
import { useCart } from "../components/context/cart-context.jsx";
import { Table, Button, InputNumber, Popconfirm, message, Empty, Modal } from "antd";
import { ShoppingCartOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../components/context/auth-context";

const QuantityInput = ({ quantity, bookId, onUpdate, disabled }) => {
    const [localQty, setLocalQty] = useState(quantity);

    useEffect(() => {
        setLocalQty(quantity);
    }, [quantity]);

    const handleKeyPress = (e) => {
        if (e.key === "Enter") {
            if (localQty < 1) {
                message.error("Số lượng phải lớn hơn 0");
                return;
            }
            onUpdate(bookId, localQty);
        }
    };

    return (
        <InputNumber
            min={1}
            value={localQty}
            onChange={setLocalQty}
            onKeyPress={handleKeyPress}
            disabled={disabled}
        />
    );
};

const CartPage = () => {
    const {
        cart, isLoading, fetchCart, updateCartItem, removeCartItem, clearCart
    } = useCart();
    const { user } = useContext(AuthContext);
    const [checkoutLoading, setCheckoutLoading] = useState(false);
    const [checkoutModal, setCheckoutModal] = useState(false);
    const navigate = useNavigate();
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);

    useEffect(() => {
        if (user && user.id) {
            fetchCart();
        }
    }, [user]);

    const handleUpdateQuantity = async (bookId, quantity) => {
        if (!bookId || typeof bookId !== 'string' || bookId.trim() === '') {
            message.error("ID sách không hợp lệ");
            return;
        }

        if (quantity < 1) {
            message.error("Số lượng phải lớn hơn 0");
            return;
        }

        try {
            await updateCartItem(bookId, quantity);
        } catch (err) {
            // Lỗi đã xử lý trong context
        }
    };

    const handleRemove = async (bookId) => {
        try {
            await removeCartItem(bookId);
        } catch (err) {
            // Lỗi đã xử lý trong context
        }
    };

    const handleClearCart = async () => {
        try {
            await clearCart();
        } catch (err) {
            // Lỗi đã xử lý trong context
        }
    };

    const rowSelection = {
        selectedRowKeys,
        onChange: (selectedKeys) => setSelectedRowKeys(selectedKeys),
        getCheckboxProps: (record) => ({
            disabled: isLoading || checkoutLoading
        })
    };

    const handleCheckout = () => {
        const selectedItems = cart.filter(item => selectedRowKeys.includes(item.id));
        if (selectedItems.length === 0) {
            message.warning("Vui lòng chọn sản phẩm muốn thanh toán!");
            return;
        }
        navigate("/checkout", { state: { cart: selectedItems } });
    };

    const cartItems = cart || [];
    const total = cartItems.reduce((sum, item) => sum + (item.totalPrice || 0), 0);

    const columns = [
        {
            title: "Ảnh",
            dataIndex: "bookImage",
            render: (img) => {
                const src = img?.medium || img?.original || img?.thumbnail || "";
                return src ? (
                    <img
                        src={src}
                        alt=""
                        style={{ width: 60, height: 80, objectFit: "cover", borderRadius: 6, boxShadow: "0 2px 8px #eee" }}
                    />
                ) : (
                    <span>Không có ảnh</span>
                );
            }
        },
        {
            title: "Tên sách",
            dataIndex: "bookTitle",
            render: (name, record) => (
                <div>
                    <b>{name}</b>
                    {record.author && <div style={{ fontSize: 13, color: "#888" }}>Tác giả: {record.author}</div>}
                    {record.category && <div style={{ fontSize: 13, color: "#888" }}>Thể loại: {record.category}</div>}
                </div>
            )
        },
        {
            title: "Giá",
            dataIndex: "price",
            render: (price) => price?.toLocaleString() + " đ"
        },
        {
            title: "Số lượng",
            dataIndex: "quantity",
            render: (quantity, record) => (
                <QuantityInput
                    quantity={quantity}
                    bookId={record.bookId}
                    onUpdate={handleUpdateQuantity}
                    disabled={isLoading || checkoutLoading}
                />
            )
        },
        {
            title: "Tổng tiền",
            dataIndex: "totalPrice",
            render: (totalPrice) => totalPrice?.toLocaleString() + " đ"
        },
        {
            title: "Thao tác",
            render: (_, record) => (
                <Popconfirm
                    title="Xóa sách khỏi giỏ hàng?"
                    onConfirm={() => handleRemove(record.bookId)}
                    okText="Xóa"
                    cancelText="Hủy"
                >
                    <Button danger disabled={isLoading || checkoutLoading}>
                        Xóa
                    </Button>
                </Popconfirm>
            )
        }
    ];

    return (
        <div
            style={{
                maxWidth: 900,
                margin: "32px auto",
                background: "#fff",
                padding: 24,
                borderRadius: 8,
                boxShadow: "0 2px 16px #f0f1f2",
                minHeight: 400
            }}
        >
            <h2 style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <ShoppingCartOutlined style={{ color: "#1890ff", fontSize: 28 }} />
                Giỏ hàng của bạn
            </h2>

            {cartItems.length > 0 ? (
                <Table
                    rowSelection={rowSelection}
                    dataSource={cartItems}
                    columns={columns}
                    rowKey="id"
                    pagination={false}
                    loading={isLoading}
                    summary={() => (
                        <Table.Summary.Row>
                            <Table.Summary.Cell colSpan={4} align="right">
                                <b>Tổng tiền:</b>
                            </Table.Summary.Cell>
                            <Table.Summary.Cell colSpan={2}>
                                <b style={{ color: "#1890ff", fontSize: 18 }}>{total.toLocaleString()} đ</b>
                            </Table.Summary.Cell>
                        </Table.Summary.Row>
                    )}
                    style={{ marginBottom: 16 }}
                    scroll={{ x: "max-content" }}
                />
            ) : (
                <Empty
                    description="Giỏ hàng trống"
                    style={{ margin: "48px 0" }}
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
            )}

            <div
                style={{
                    marginTop: 24,
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 12,
                    justifyContent: "flex-end"
                }}
            >
                <Popconfirm
                    title="Bạn chắc chắn muốn xóa toàn bộ giỏ hàng?"
                    onConfirm={handleClearCart}
                    okText="Xóa"
                    cancelText="Hủy"
                >
                    <Button danger disabled={isLoading || checkoutLoading}>
                        Xóa toàn bộ giỏ hàng
                    </Button>
                </Popconfirm>
                <Button
                    type="primary"
                    style={{
                        minWidth: 120,
                        fontWeight: 600,
                        background: "linear-gradient(90deg,#1890ff,#40a9ff)",
                        border: 0,
                        boxShadow: "0 2px 8px rgba(24,144,255,0.2)"
                    }}
                    onClick={handleCheckout}
                    disabled={selectedRowKeys.length === 0 || isLoading || checkoutLoading}
                    loading={checkoutLoading}
                >
                    Thanh toán
                </Button>
            </div>

            <Modal
                open={checkoutModal}
                onCancel={() => setCheckoutModal(false)}
                footer={null}
                centered
                maskClosable={false}
            >
                <div style={{ textAlign: "center", padding: 24 }}>
                    <img
                        src="https://cdn-icons-png.flaticon.com/512/190/190411.png"
                        alt="success"
                        style={{ width: 64, marginBottom: 16 }}
                    />
                    <h3>Thanh toán thành công!</h3>
                    <div style={{ margin: "12px 0 24px", color: "#888" }}>
                        Cảm ơn bạn đã mua hàng tại BookStore.
                    </div>
                    <Button
                        type="primary"
                        onClick={() => {
                            setCheckoutModal(false);
                            navigate("/");
                        }}
                    >
                        Tiếp tục mua sắm
                    </Button>
                </div>
            </Modal>
        </div>
    );
};

export default CartPage;
