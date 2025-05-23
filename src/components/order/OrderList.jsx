import React, { useState, useEffect, useContext } from 'react';
import { Table, Button, Space, Modal, message, Tag, Tooltip, Select, Popconfirm } from 'antd';
import { EyeOutlined, DeleteOutlined } from '@ant-design/icons';
import { AuthContext } from '../context/auth-context';
import { useNavigate } from 'react-router-dom';
import { getUserOrdersAPI, getAllOrdersAPI, updateOrderStatusAPI, cancelOrderAPI } from '../../services/api-service';

const { Option } = Select;

const OrderList = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const isAdmin = user?.role === 'ROLE_ADMIN';
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [detailModalVisible, setDetailModalVisible] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [current, setCurrent] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [total, setTotal] = useState(0);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    useEffect(() => {
        loadOrders();
        // eslint-disable-next-line
    }, [current, pageSize, refreshTrigger]);

    const loadOrders = async () => {
        setLoading(true);
        try {
            const params = {
                current: current - 1,  // Đổi page thành current để match với backend
                pageSize: pageSize     // Đổi size thành pageSize để match với backend
            };
            const res = isAdmin
                ? await getAllOrdersAPI(params)
                : await getUserOrdersAPI(params);

            if (res?.data) {  // Bỏ kiểm tra .data.data vì có thể response format khác
                let orderList = res.data.result || [];
                // Sắp xếp: Đơn chưa hủy (mới nhất trước) -> Đơn đã hủy (mới nhất trước)
                orderList = orderList.sort((a, b) => {
                    // Đơn chưa hủy lên trên
                    if (a.status === 'CANCELLED' && b.status !== 'CANCELLED') return 1;
                    if (a.status !== 'CANCELLED' && b.status === 'CANCELLED') return -1;
                    // Cùng trạng thái, sắp xếp theo ngày tạo mới nhất
                    return new Date(b.createdAt) - new Date(a.createdAt);
                });
                setOrders(orderList);
                setTotal(res.data.meta?.total || 0);
            } else {
                setOrders([]);
                setTotal(0);
            }
        } catch (error) {
            console.error('Error loading orders:', error);
            const errorMessage = error?.response?.data?.message || 'Lỗi khi tải danh sách đơn hàng';
            message.error(errorMessage);
            setOrders([]);
            setTotal(0);
        } finally {
            setLoading(false);
        }
    };

    const handleChangePage = (pagination) => {
        if (pagination && pagination.current && pagination.pageSize) {
            if (+pagination.current !== +current) setCurrent(+pagination.current);
            if (+pagination.pageSize !== +pageSize) setPageSize(+pagination.pageSize);
        }
    };

    const handleViewDetail = (order) => {
        setSelectedOrder(order);
        setDetailModalVisible(true);
    };

    const handleUpdateStatus = async (orderId, newStatus) => {
        try {
            const res = await updateOrderStatusAPI(orderId, newStatus);
            if (res?.data?.code === 200) {
                message.success('Cập nhật trạng thái đơn hàng thành công');
                setRefreshTrigger(prev => prev + 1);
            }
        } catch (error) {
            console.error('Error updating order status:', error);
            message.error(error?.response?.data?.message || 'Lỗi khi cập nhật trạng thái đơn hàng');
        }
    };

    const handleCancel = async (orderId) => {
        try {
            const res = await cancelOrderAPI(orderId);
            if (res?.data?.code === 200) {
                message.success('Hủy đơn hàng thành công');
                setRefreshTrigger(prev => prev + 1);
            } else {
                message.error(res?.data?.message || 'Hủy đơn hàng thất bại!');
            }
        } catch (error) {
            console.error('Error cancelling order:', error);
            message.error(error?.response?.data?.message || 'Lỗi khi hủy đơn hàng');
        }
    };

    const getStatusTag = (status) => {
        const statusMap = {
            'PENDING': { color: 'processing', text: 'Chờ xác nhận' },
            'CONFIRMED': { color: 'warning', text: 'Đã xác nhận' },
            'SHIPPING': { color: 'warning', text: 'Đang giao hàng' },
            'DELIVERED': { color: 'success', text: 'Đã giao hàng' },
            'CANCELLED': { color: 'error', text: 'Đã hủy' }
        };
        const { color, text } = statusMap[status] || { color: 'default', text: status };
        return <Tag color={color}>{text}</Tag>;
    };

    const getPaymentStatusTag = (status) => {
        const statusMap = {
            'PENDING': { color: 'processing', text: 'Chờ thanh toán' },
            'PAID': { color: 'success', text: 'Đã thanh toán' },
            'FAILED': { color: 'error', text: 'Thanh toán thất bại' }
        };
        const { color, text } = statusMap[status] || { color: 'default', text: status };
        return <Tag color={color}>{text}</Tag>;
    };

    const getPaymentMethodText = (method) => {
        const methodMap = {
            'COD': 'Thanh toán khi nhận hàng',
            'BANKING': 'Chuyển khoản ngân hàng'
        };
        return methodMap[method] || method;
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    const columns = [
        {
            title: 'Mã đơn hàng',
            dataIndex: 'id',
            key: 'id',
            width: 150
        },
        {
            title: 'Người đặt',
            dataIndex: 'fullName',
            key: 'fullName',
            render: (text, record) => (
                <Tooltip title={`${record.email} - ${record.phone}`}>
                    {text}
                </Tooltip>
            )
        },
        {
            title: 'Tổng tiền',
            dataIndex: 'totalAmount',
            key: 'totalAmount',
            render: (amount) => formatCurrency(amount),
            sorter: (a, b) => a.totalAmount - b.totalAmount
        },
        {
            title: 'Phương thức',
            dataIndex: 'paymentMethod',
            key: 'paymentMethod',
            render: (method) => getPaymentMethodText(method)
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (status) => getStatusTag(status)
        },
        {
            title: 'Thanh toán',
            dataIndex: 'paymentStatus',
            key: 'paymentStatus',
            render: (status) => getPaymentStatusTag(status)
        },
        {
            title: 'Ngày tạo',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (text) => new Date(text).toLocaleString('vi-VN')
        },
        {
            title: 'Thao tác',
            key: 'action',
            render: (_, record) => (
                <Space size="middle">
                    <Button
                        type="primary"
                        icon={<EyeOutlined />}
                        onClick={() => handleViewDetail(record)}
                    >
                        Chi tiết
                    </Button>
                    {isAdmin && record.status === 'PENDING' && (
                        <Select
                            style={{ width: 150 }}
                            placeholder="Cập nhật trạng thái"
                            onChange={(value) => handleUpdateStatus(record.id, value)}
                        >
                            <Option value="CONFIRMED">Xác nhận</Option>
                            <Option value="CANCELLED">Hủy đơn</Option>
                        </Select>
                    )}
                    {!isAdmin && record.status === 'PENDING' && (
                        <Popconfirm
                            title="Bạn có chắc chắn muốn hủy đơn hàng này?"
                            onConfirm={() => handleCancel(record.id)}
                            okText="Hủy đơn"
                            cancelText="Không"
                        >
                            <Button danger icon={<DeleteOutlined />}>
                                Hủy đơn
                            </Button>
                        </Popconfirm>
                    )}
                </Space>
            )
        }
    ];

    return (
        <div style={{ padding: '24px' }}>
            <Table
                columns={columns}
                dataSource={orders}
                rowKey="id"
                loading={loading}
                pagination={{
                    current,
                    pageSize,
                    total,
                    showSizeChanger: true,
                    showTotal: (total, range) => `${range[0]}-${range[1]} trong ${total} đơn hàng`,
                }}
                onChange={handleChangePage}
            />

            {/* Modal chi tiết đơn hàng */}
            <Modal
                title="Chi tiết đơn hàng"
                open={detailModalVisible}
                onCancel={() => setDetailModalVisible(false)}
                footer={null}
                width={800}
            >
                {selectedOrder && (
                    <div>
                        <div style={{ marginBottom: 16 }}>
                            <h3>Mã đơn hàng: {selectedOrder.id}</h3>
                            <Space>
                                {getStatusTag(selectedOrder.status)}
                                {getPaymentStatusTag(selectedOrder.paymentStatus)}
                            </Space>
                        </div>

                        <div style={{ marginBottom: 16 }}>
                            <h4>Thông tin người đặt</h4>
                            <p><strong>Họ tên:</strong> {selectedOrder.fullName}</p>
                            <p><strong>Email:</strong> {selectedOrder.email}</p>
                            <p><strong>Số điện thoại:</strong> {selectedOrder.phone}</p>
                            <p><strong>Địa chỉ:</strong> {selectedOrder.address}</p>
                        </div>

                        <div style={{ marginBottom: 16 }}>
                            <h4>Thông tin thanh toán</h4>
                            <p><strong>Phương thức:</strong> {getPaymentMethodText(selectedOrder.paymentMethod)}</p>
                            <p><strong>Tổng tiền:</strong> {formatCurrency(selectedOrder.totalAmount)}</p>
                        </div>

                        <div>
                            <h4>Chi tiết sản phẩm</h4>
                            <Table
                                columns={[
                                    {
                                        title: 'Sản phẩm',
                                        dataIndex: 'bookTitle',
                                        key: 'bookTitle',
                                        render: (text, record) => (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <img
                                                    src={record.bookImage}
                                                    alt={text}
                                                    style={{ width: 50, height: 50, objectFit: 'cover' }}
                                                />
                                                <span>{text}</span>
                                            </div>
                                        )
                                    },
                                    {
                                        title: 'Đơn giá',
                                        dataIndex: 'price',
                                        key: 'price',
                                        render: (price) => formatCurrency(price)
                                    },
                                    {
                                        title: 'Số lượng',
                                        dataIndex: 'quantity',
                                        key: 'quantity'
                                    },
                                    {
                                        title: 'Thành tiền',
                                        dataIndex: 'subtotal',
                                        key: 'subtotal',
                                        render: (subtotal) => formatCurrency(subtotal)
                                    }
                                ]}
                                dataSource={selectedOrder.items}
                                rowKey="id"
                                pagination={false}
                            />
                        </div>

                        <div style={{ marginTop: 16, textAlign: 'right' }}>
                            <p><strong>Ngày tạo:</strong> {new Date(selectedOrder.createdAt).toLocaleString('vi-VN')}</p>
                            <p><strong>Ngày cập nhật:</strong> {new Date(selectedOrder.updatedAt).toLocaleString('vi-VN')}</p>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default OrderList; 