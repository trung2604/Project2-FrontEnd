import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Button, Input, Select, Table, message } from "antd";

const CheckoutPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const cart = location.state?.cart || [];
    const [address, setAddress] = useState("");
    const [payment, setPayment] = useState("");

    const handleOrder = () => {
        if (!address || !payment) {
            message.error("Vui lòng nhập địa chỉ và chọn phương thức thanh toán!");
            return;
        }
        // Gửi đơn hàng lên backend ở đây nếu cần
        message.success("Đặt hàng thành công!");
        navigate("/");
    };

    const columns = [
        { title: "Tên sách", dataIndex: "bookTitle" },
        { title: "Số lượng", dataIndex: "quantity" },
        { title: "Giá", dataIndex: "price", render: (p) => p.toLocaleString() + " đ" },
        { title: "Tổng", dataIndex: "totalPrice", render: (t) => t.toLocaleString() + " đ" }
    ];

    return (
        <div style={{ maxWidth: 700, margin: "32px auto", background: "#fff", padding: 24, borderRadius: 8 }}>
            <h2>Xác nhận đơn hàng</h2>
            <Table dataSource={cart} columns={columns} rowKey="id" pagination={false} />
            <div style={{ margin: "24px 0" }}>
                <Input.TextArea
                    rows={3}
                    placeholder="Nhập địa chỉ nhận hàng"
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                    style={{ marginBottom: 16 }}
                />
                <Select
                    showSearch
                    placeholder="Search to Select"
                    optionFilterProp="label"
                    onChange={setPayment}
                    style={{ width: "100%", marginBottom: 16 }}
                >
                    <Select.Option value="cod">Thanh toán khi nhận hàng (COD)</Select.Option>
                    <Select.Option value="bank">Chuyển khoản ngân hàng</Select.Option>
                </Select>
                
                <Button type="primary" block onClick={handleOrder}>Đặt hàng</Button>
            </div>
        </div>
    );
};

export default CheckoutPage; 