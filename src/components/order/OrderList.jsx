import React, { useState, useEffect, useContext, useRef } from 'react';
import { Table, Button, Space, Modal, message, Tag, Tooltip, Select, Popconfirm, Rate, Input, Form } from 'antd';
import { EyeOutlined, DeleteOutlined, StarOutlined } from '@ant-design/icons';
import { AuthContext } from '../context/auth-context';
import { useNavigate } from 'react-router-dom';
import { getUserOrdersAPI, getAllOrdersAPI, updateOrderStatusAPI, cancelOrderAPI, confirmOrderAPI, createReviewAPI, getUserReviewForBookAPI } from '../../services/api-service';

const { Option } = Select;
const { TextArea, Search } = Input;

const OrderList = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const isAdmin = user?.role === 'ROLE_ADMIN';
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [detailModalVisible, setDetailModalVisible] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [reviewModalVisible, setReviewModalVisible] = useState(false);
    const [selectedBook, setSelectedBook] = useState(null);
    const [userReviews, setUserReviews] = useState({});
    const [current, setCurrent] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [total, setTotal] = useState(0);
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [reviewForm] = Form.useForm();
    const [reviewLoading, setReviewLoading] = useState(false);
    const [searchInput, setSearchInput] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [sortField, setSortField] = useState("createdAt");
    const [sortOrder, setSortOrder] = useState("desc");
    const debounceTimeout = useRef();

    useEffect(() => {
        if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
        debounceTimeout.current = setTimeout(() => {
            setSearchTerm(searchInput);
        }, 500);
        return () => clearTimeout(debounceTimeout.current);
    }, [searchInput]);

    useEffect(() => {
        loadOrders();
        // eslint-disable-next-line
    }, [current, pageSize, refreshTrigger, searchTerm, statusFilter, sortField, sortOrder]);

    const loadOrders = async () => {
        setLoading(true);
        try {
            const params = {
                page: current - 1,
                size: pageSize,
                sort: `${sortField},${sortOrder}`,
                ...(isAdmin && searchTerm ? { search: searchTerm } : {}),
                ...(isAdmin && statusFilter ? { status: statusFilter } : {}),
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

                // Load user reviews for delivered orders
                if (!isAdmin) {
                    await loadUserReviews(orderList);
                }
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

    const loadUserReviews = async (orderList) => {
        const reviews = {};
        for (const order of orderList) {
            if (order.status === 'DELIVERED' && order.items) {
                for (const item of order.items) {
                    try {
                        const response = await getUserReviewForBookAPI(item.bookId);
                        if (response.success && response.data) {
                            reviews[item.bookId] = response.data;
                        }
                    } catch (error) {
                        // User chưa đánh giá sách này
                        reviews[item.bookId] = null;
                    }
                }
            }
        }
        setUserReviews(reviews);
    };

    const handleChangePage = (pagination) => {
        if (pagination && pagination.current && pagination.pageSize) {
            if (+pagination.current !== +current) setCurrent(+pagination.current);
            if (+pagination.pageSize !== +pageSize) setPageSize(+pagination.pageSize);
        }
        // reset sort, filter khi chuyển trang nếu muốn
    };

    const handleViewDetail = (order) => {
        setSelectedOrder(order);
        setDetailModalVisible(true);
    };

    const handleReview = (book) => {
        setSelectedBook(book);
        const existingReview = userReviews[book.bookId];
        if (existingReview) {
            reviewForm.setFieldsValue({
                rating: existingReview.rating,
                comment: existingReview.comment
            });
        } else {
            reviewForm.resetFields();
        }
        setReviewModalVisible(true);
    };

    const handleSubmitReview = async (values) => {
        if (!selectedBook) return;

        setReviewLoading(true);
        try {
            const reviewData = {
                bookId: selectedBook.bookId,
                rating: values.rating,
                comment: values.comment.trim()
            };

            const existingReview = userReviews[selectedBook.bookId];
            let response;

            if (existingReview) {
                // Update existing review - không cần orderId
                const { updateReviewAPI } = await import('../../services/api-service');
                response = await updateReviewAPI(existingReview.id, reviewData);
            } else {
                // Create new review - cần thêm orderId
                // Tìm orderId từ selectedOrder
                const orderId = selectedOrder?.id;
                if (!orderId) {
                    message.error('Không tìm thấy thông tin đơn hàng');
                    return;
                }

                reviewData.orderId = orderId;
                response = await createReviewAPI(reviewData);
            }

            if (response.success) {
                message.success(existingReview ? 'Cập nhật đánh giá thành công!' : 'Gửi đánh giá thành công!');
                setReviewModalVisible(false);
                reviewForm.resetFields();
                // Reload user reviews
                await loadUserReviews(orders);
            } else {
                message.error(response.message || 'Có lỗi xảy ra');
            }
        } catch (error) {
            console.error('Error submitting review:', error);
            message.error(error.response?.data?.message || 'Có lỗi xảy ra khi gửi đánh giá');
        } finally {
            setReviewLoading(false);
        }
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

    const renderReviewButton = (book) => {
        if (isAdmin) return null;

        const existingReview = userReviews[book.bookId];
        return (
            <Button
                type="primary"
                size="small"
                icon={<StarOutlined />}
                onClick={() => handleReview(book)}
            >
                {existingReview ? 'Chỉnh sửa đánh giá' : 'Đánh giá'}
            </Button>
        );
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
            {isAdmin && (
                <div style={{ marginBottom: 16, display: 'flex', gap: 16 }}>
                    <Search
                        placeholder="Tìm kiếm tên, email, sđt, địa chỉ..."
                        allowClear
                        value={searchInput}
                        onChange={e => setSearchInput(e.target.value)}
                        onSearch={value => setSearchInput(value)}
                        style={{ width: 260 }}
                    />
                    <Select
                        placeholder="Lọc trạng thái"
                        allowClear
                        value={statusFilter || undefined}
                        onChange={value => setStatusFilter(value || "")}
                        style={{ width: 180 }}
                    >
                        <Option value="">Tất cả trạng thái</Option>
                        <Option value="PENDING">Chờ xác nhận</Option>
                        <Option value="CONFIRMED">Đã xác nhận</Option>
                        <Option value="SHIPPING">Đang giao hàng</Option>
                        <Option value="DELIVERED">Đã giao hàng</Option>
                        <Option value="CANCELLED">Đã hủy</Option>
                    </Select>
                    <Select
                        value={sortField + "," + sortOrder}
                        onChange={val => {
                            const [field, order] = val.split(",");
                            setSortField(field);
                            setSortOrder(order);
                        }}
                        style={{ width: 220 }}
                    >
                        <Option value="createdAt,desc">Ngày tạo mới nhất</Option>
                        <Option value="createdAt,asc">Ngày tạo cũ nhất</Option>
                        <Option value="totalAmount,desc">Tổng tiền cao nhất</Option>
                        <Option value="totalAmount,asc">Tổng tiền thấp nhất</Option>
                        <Option value="fullName,asc">Tên khách hàng A-Z</Option>
                        <Option value="fullName,desc">Tên khách hàng Z-A</Option>
                    </Select>
                </div>
            )}
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
                                    },
                                    {
                                        title: 'Đánh giá',
                                        key: 'review',
                                        render: (_, record) => {
                                            if (selectedOrder.status === 'DELIVERED' && !isAdmin) {
                                                return renderReviewButton(record);
                                            }
                                            return null;
                                        }
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

            {/* Modal đánh giá */}
            <Modal
                title={selectedBook ? `Đánh giá sách: ${selectedBook.bookTitle}` : 'Đánh giá sách'}
                open={reviewModalVisible}
                onCancel={() => {
                    setReviewModalVisible(false);
                    reviewForm.resetFields();
                }}
                footer={null}
                width={600}
            >
                {selectedBook && (
                    <div>
                        <div style={{ marginBottom: 16, padding: 12, background: '#f6ffed', border: '1px solid #b7eb8f', borderRadius: 6 }}>
                            <span style={{ color: '#52c41a', fontWeight: 500 }}>
                                ✅ Đây là đánh giá từ người đã mua sách
                            </span>
                        </div>

                        <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <img
                                src={selectedBook.bookImage}
                                alt={selectedBook.bookTitle}
                                style={{ width: 60, height: 80, objectFit: 'cover', borderRadius: 4 }}
                            />
                            <div>
                                <h4 style={{ margin: 0 }}>{selectedBook.bookTitle}</h4>
                                <p style={{ margin: 0, color: '#666' }}>Đơn giá: {formatCurrency(selectedBook.price)}</p>
                            </div>
                        </div>

                        <Form
                            form={reviewForm}
                            layout="vertical"
                            onFinish={handleSubmitReview}
                        >
                            <Form.Item
                                label="Đánh giá của bạn"
                                name="rating"
                                rules={[{ required: true, message: 'Vui lòng chọn số sao đánh giá' }]}
                            >
                                <Rate style={{ fontSize: 24 }} allowHalf />
                            </Form.Item>

                            <Form.Item
                                label="Nhận xét"
                                name="comment"
                                rules={[
                                    { required: true, message: 'Vui lòng viết nhận xét' },
                                    { min: 10, message: 'Nhận xét phải có ít nhất 10 ký tự' },
                                    { max: 1000, message: 'Nhận xét không được quá 1000 ký tự' }
                                ]}
                            >
                                <TextArea
                                    rows={4}
                                    placeholder="Chia sẻ trải nghiệm của bạn về cuốn sách này..."
                                    maxLength={1000}
                                    showCount
                                />
                            </Form.Item>

                            <div style={{ textAlign: 'right' }}>
                                <Space>
                                    <Button
                                        onClick={() => {
                                            setReviewModalVisible(false);
                                            reviewForm.resetFields();
                                        }}
                                    >
                                        Hủy
                                    </Button>
                                    <Button
                                        type="primary"
                                        htmlType="submit"
                                        loading={reviewLoading}
                                    >
                                        {userReviews[selectedBook.bookId] ? 'Cập nhật' : 'Gửi đánh giá'}
                                    </Button>
                                </Space>
                            </div>
                        </Form>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default OrderList; 