import { useLocation, useNavigate } from "react-router-dom";
import { useState, useContext, useEffect } from "react";
import { Button, Input, Select, Table, message } from "antd";
import { createOrderAPI } from "../services/api-service";
import { AuthContext } from "../components/context/auth-context";
import { useCart } from "../components/context/cart-context";
import { getAccountAPI } from "../services/api-service";

const CheckoutPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, setUser } = useContext(AuthContext);
    const { clearCart } = useCart();
    const cart = location.state?.cart || [];
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        phone: "",
        address: "",
        payment: ""
    });
    const [loading, setLoading] = useState(false);

    // Kiểm tra đăng nhập và lấy thông tin user
    useEffect(() => {
        const checkAuth = async () => {
            try {
                const response = await getAccountAPI();
                if (response?.data) {
                    setUser(response.data);
                    // Tự động điền thông tin user
                    setFormData(prev => ({
                        ...prev,
                        fullName: response.data.fullName || "",
                        email: response.data.email || "",
                        phone: response.data.phone || ""
                    }));
                }
            } catch (error) {
                console.error('Error checking auth:', error);
                if (error.response?.status === 401) {
                    message.error("Vui lòng đăng nhập để tiếp tục!");
                    navigate("/login", { state: { from: "/checkout" } });
                }
            }
        };
        checkAuth();
    }, [navigate, setUser]);

    // Nếu không có cart, chuyển về trang giỏ hàng
    useEffect(() => {
        if (!cart || cart.length === 0) {
            message.warning("Giỏ hàng trống!");
            navigate("/cart");
        }
    }, [cart, navigate]);

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleOrder = async () => {
        const { fullName, email, phone, address, payment } = formData;

        // Validate form
        if (!fullName || !email || !phone || !address || !payment) {
            message.error("Vui lòng điền đầy đủ thông tin!");
            return;
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            message.error("Email không hợp lệ!");
            return;
        }

        // Validate phone format (10-11 digits)
        const phoneRegex = /^[0-9]{10,11}$/;
        if (!phoneRegex.test(phone)) {
            message.error("Số điện thoại không hợp lệ!");
            return;
        }

        setLoading(true);
        try {
            // Tạo order data đúng yêu cầu backend
            const orderData = {
                fullName,
                email,
                phone,
                address,
                paymentMethod: payment === 'bank' ? 'BANKING' : 'COD',
                items: cart.map(item => ({
                    bookId: item.bookId || item.id,
                    quantity: item.quantity
                }))
            };

            // Gọi API tạo order
            const response = await createOrderAPI(orderData);
            console.log('CreateOrder response:', response);

            // Kiểm tra response có id là thành công
            if (response?.data && response.status === 201) {
                message.success("Đặt hàng thành công!");
                await clearCart();

                if (payment === "bank") {
                    navigate("/bank-transfer", {
                        state: {
                            orderId: response.id,
                            amount: response.totalAmount
                        }
                    });
                } else {
                    navigate("/orders");
                }
            } else {
                message.error("Đặt hàng thất bại!");
            }
        } catch (error) {
            console.error('Error creating order:', error);
            // Xử lý lỗi đã được wrap bởi interceptor
            if (error?.statusCode === 500) {
                message.error(error.message || "Có lỗi xảy ra khi đặt hàng!");
            } else if (error?.data) {
                // Lỗi validation
                const validationErrors = Object.values(error.data).join('\n');
                message.error(validationErrors);
            } else {
                message.error("Có lỗi xảy ra khi đặt hàng!");
            }
        } finally {
            setLoading(false);
        }
    };

    const columns = [
        { title: "Ảnh", dataIndex: "bookImage", render: (bookImage) => <img src={bookImage} alt="Ảnh sách" style={{ width: 50, height: 50 }} /> },
        { title: "Tên sách", dataIndex: "bookTitle" },
        { title: "Số lượng", dataIndex: "quantity" },
        { title: "Giá", dataIndex: "price", render: (p) => p.toLocaleString() + " đ" },
        { title: "Tổng", dataIndex: "totalPrice", render: (t) => t.toLocaleString() + " đ" }
    ];

    const total = cart.reduce((sum, item) => sum + (item.totalPrice || 0), 0);

    return (
        <div style={{ maxWidth: 700, margin: "32px auto", background: "#fff", padding: 24, borderRadius: 8 }}>
            <h2>Xác nhận đơn hàng</h2>
            <Table
                dataSource={cart}
                columns={columns}
                rowKey="id"
                pagination={false}
                summary={() => (
                    <Table.Summary.Row>
                        <Table.Summary.Cell colSpan={4} align="right">
                            <b>Tổng tiền:</b>
                        </Table.Summary.Cell>
                        <Table.Summary.Cell>
                            <b style={{ color: "#1890ff", fontSize: 18 }}>{total.toLocaleString()} đ</b>
                        </Table.Summary.Cell>
                    </Table.Summary.Row>
                )}
            />
            <div style={{ margin: "24px 0" }}>
                <h3>Thông tin người nhận hàng</h3>
                <Input
                    placeholder="Họ và tên"
                    value={formData.fullName}
                    onChange={e => handleInputChange('fullName', e.target.value)}
                    style={{ marginBottom: 16 }}
                />
                <Input
                    placeholder="Email"
                    type="email"
                    value={formData.email}
                    onChange={e => handleInputChange('email', e.target.value)}
                    style={{ marginBottom: 16 }}
                />
                <Input
                    placeholder="Số điện thoại"
                    value={formData.phone}
                    onChange={e => handleInputChange('phone', e.target.value)}
                    style={{ marginBottom: 16 }}
                />
                <Input.TextArea
                    rows={3}
                    placeholder="Địa chỉ nhận hàng"
                    value={formData.address}
                    onChange={e => handleInputChange('address', e.target.value)}
                    style={{ marginBottom: 16 }}
                />
                <Select
                    placeholder="Chọn phương thức thanh toán"
                    optionFilterProp="label"
                    value={formData.payment}
                    onChange={value => handleInputChange('payment', value)}
                    style={{ width: "100%", marginBottom: 16 }}
                >
                    <Select.Option value="cod">Thanh toán khi nhận hàng (COD)</Select.Option>
                    <Select.Option value="bank">Chuyển khoản ngân hàng</Select.Option>
                </Select>

                <Button
                    type="primary"
                    block
                    onClick={handleOrder}
                    loading={loading}
                >
                    Đặt hàng
                </Button>
            </div>
        </div>
    );
};

export default CheckoutPage; 