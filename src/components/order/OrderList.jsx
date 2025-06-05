import React, { useState, useEffect, useContext } from 'react';
import { Table, Button, Space, Modal, message, Tag, Tooltip, Select, Popconfirm } from 'antd';
import { EyeOutlined, DeleteOutlined } from '@ant-design/icons';
import { AuthContext } from '../context/auth-context';
import { useNavigate } from 'react-router-dom';
import { getUserOrdersAPI, getAllOrdersAPI, updateOrderStatusAPI, cancelOrderAPI, confirmOrderAPI } from '../../services/api-service';

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
                page: current - 1,
                size: pageSize,
                sort: 'createdAt,desc',
            };
            const res = isAdmin
                ? await getAllOrdersAPI(params)
                : await getUserOrdersAPI(params);

            if (res?.data) {
                let orderList = res.data.result || [];
                orderList = orderList.sort((a, b) => {
                    if (a.status === 'CANCELLED' && b.status !== 'CANCELLED') return 1;
                    if (a.status !== 'CANCELLED' && b.status === 'CANCELLED') return -1;
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
            if (res.success === true) {
                message.success('Cập nhật trạng thái đơn hàng thành công');
                setRefreshTrigger(prev => prev + 1);
            }
        } catch (error) {
            console.error('Error updating order status:', error);
            message.error(error?.message || 'Lỗi khi cập nhật trạng thái đơn hàng');
        }
    };

    const handleCancel = async (orderId) => {
        try {
            const res = await cancelOrderAPI(orderId);
            const msg = res?.message || res?.data?.message || 'Hủy đơn hàng thành công';
            if (res.success === true) {
                message.success(msg);
                await loadOrders();
            } else {
                message.error(msg || 'Hủy đơn hàng thất bại!');
            }
        } catch (error) {
            console.error('Error cancelling order:', error);
            const msg = error?.response?.data?.message || error?.message || 'Lỗi khi hủy đơn hàng';
            message.error(msg);
        }
    };

    const handleConfirm = async (orderId) => {
        try {
            const res = await confirmOrderAPI(orderId);
            if (res.success === true) {
                message.success('Xác nhận đơn hàng thành công');
                await loadOrders();
            } else {
                message.error('Xác nhận đơn hàng thất bại!');
            }
        } catch (error) {
            console.error('Error confirming order:', error);
            message.error(error?.message || 'Lỗi khi xác nhận đơn hàng');
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
                        Xem
                    </Button>
                    {isAdmin && record.status === 'PENDING' && (
                        <Button
                            type="primary"
                            onClick={() => handleConfirm(record.id)}
                        >
                            Xác nhận
                        </Button>
                    )}
                    {record.status !== 'CANCELLED' && (
                        <Popconfirm
                            title="Bạn chắc chắn muốn hủy đơn này?"
                            onConfirm={() => handleCancel(record.id)}
                            okText="Hủy"
                            cancelText="Không"
                        >
                            <Button danger>Hủy</Button>
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