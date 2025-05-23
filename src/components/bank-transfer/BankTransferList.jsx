import React, { useState, useEffect, useContext } from 'react';
import { Table, Button, Space, Modal, Form, Input, message, Popconfirm, Tag, Tooltip } from 'antd';
import { PlusOutlined, SearchOutlined, EyeOutlined } from '@ant-design/icons';
import { AuthContext } from '../context/auth-context';
import { useNavigate } from 'react-router-dom';

const { TextArea } = Input;

const BankTransferList = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const isAdmin = user?.role === 'ROLE_ADMIN';
    const [transfers, setTransfers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [detailModalVisible, setDetailModalVisible] = useState(false);
    const [form] = Form.useForm();
    const [selectedTransfer, setSelectedTransfer] = useState(null);
    const [current, setCurrent] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [total, setTotal] = useState(0);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    useEffect(() => {
        loadTransfers();
        // eslint-disable-next-line
    }, [current, pageSize, refreshTrigger]);

    const loadTransfers = async () => {
        setLoading(true);
        try {
            // TODO: Gọi API lấy danh sách giao dịch
            // const res = await getAllTransfersAPI({ page: current - 1, size: pageSize });
            // if (res && res.data && Array.isArray(res.data.result)) {
            //     setTransfers(res.data.result);
            //     setTotal(res.data.totalElements || 0);
            // } else {
            //     setTransfers([]);
            //     setTotal(0);
            // }
            // Tạm thời dùng dữ liệu mẫu
            const mockData = [
                {
                    id: 1,
                    transferNumber: 'TRF202403150001',
                    senderName: 'Nguyễn Văn A',
                    senderAccount: '1234567890',
                    senderBank: 'Vietcombank',
                    receiverName: 'Trần Thị B',
                    receiverAccount: '0987654321',
                    receiverBank: 'Techcombank',
                    amount: 1000000,
                    description: 'Chuyển tiền mua sách',
                    status: 'SUCCESS',
                    createdAt: '2024-03-15T10:00:00',
                    updatedAt: '2024-03-15T10:01:00'
                },
                {
                    id: 2,
                    transferNumber: 'TRF202403150002',
                    senderName: 'Lê Văn C',
                    senderAccount: '1122334455',
                    senderBank: 'ACB',
                    receiverName: 'Phạm Thị D',
                    receiverAccount: '5544332211',
                    receiverBank: 'MB Bank',
                    amount: 2000000,
                    description: 'Thanh toán hóa đơn',
                    status: 'PENDING',
                    createdAt: '2024-03-15T11:00:00',
                    updatedAt: '2024-03-15T11:00:00'
                }
            ];
            setTransfers(mockData);
            setTotal(mockData.length);
        } catch (error) {
            console.error('Error loading transfers:', error);
            message.error('Lỗi khi tải danh sách giao dịch');
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

    const handleCreate = () => {
        form.resetFields();
        setModalVisible(true);
    };

    const handleViewDetail = (transfer) => {
        setSelectedTransfer(transfer);
        setDetailModalVisible(true);
    };

    const handleSubmit = async (values) => {
        try {
            // TODO: Gọi API tạo giao dịch mới
            // const res = await createTransferAPI(values);
            // if (res?.statusCode === 201) {
            //     message.success('Tạo giao dịch thành công');
            //     setRefreshTrigger(prev => prev + 1);
            // }
            message.success('Tạo giao dịch thành công (Demo)');
            setModalVisible(false);
        } catch (error) {
            console.error('Error creating transfer:', error);
            message.error('Lỗi khi tạo giao dịch');
        }
    };

    const getStatusTag = (status) => {
        const statusMap = {
            'SUCCESS': { color: 'success', text: 'Thành công' },
            'PENDING': { color: 'processing', text: 'Đang xử lý' },
            'FAILED': { color: 'error', text: 'Thất bại' }
        };
        const { color, text } = statusMap[status] || { color: 'default', text: status };
        return <Tag color={color}>{text}</Tag>;
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    const columns = [
        {
            title: 'Mã giao dịch',
            dataIndex: 'transferNumber',
            key: 'transferNumber',
            width: 150
        },
        {
            title: 'Người gửi',
            dataIndex: 'senderName',
            key: 'senderName',
            render: (text, record) => (
                <Tooltip title={`${record.senderAccount} - ${record.senderBank}`}>
                    {text}
                </Tooltip>
            )
        },
        {
            title: 'Người nhận',
            dataIndex: 'receiverName',
            key: 'receiverName',
            render: (text, record) => (
                <Tooltip title={`${record.receiverAccount} - ${record.receiverBank}`}>
                    {text}
                </Tooltip>
            )
        },
        {
            title: 'Số tiền',
            dataIndex: 'amount',
            key: 'amount',
            render: (amount) => formatCurrency(amount),
            sorter: (a, b) => a.amount - b.amount
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (status) => getStatusTag(status)
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
                </Space>
            )
        }
    ];

    return (
        <div style={{ padding: '24px' }}>
            <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
                <Input.Search
                    placeholder="Tìm kiếm giao dịch..."
                    allowClear
                    enterButton={<SearchOutlined />}
                    style={{ width: 300 }}
                />
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={handleCreate}
                >
                    Tạo giao dịch mới
                </Button>
            </div>

            <Table
                columns={columns}
                dataSource={transfers}
                rowKey="id"
                loading={loading}
                pagination={{
                    current,
                    pageSize,
                    total,
                    showSizeChanger: true,
                    showTotal: (total, range) => `${range[0]}-${range[1]} trong ${total} giao dịch`,
                }}
                onChange={handleChangePage}
            />

            {/* Modal tạo giao dịch mới */}
            <Modal
                title="Tạo giao dịch chuyển khoản mới"
                open={modalVisible}
                onCancel={() => setModalVisible(false)}
                footer={null}
                width={800}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                >
                    <div style={{ display: 'flex', gap: '16px' }}>
                        <div style={{ flex: 1 }}>
                            <h3>Thông tin người gửi</h3>
                            <Form.Item
                                name="senderName"
                                label="Tên người gửi"
                                rules={[{ required: true, message: 'Vui lòng nhập tên người gửi' }]}
                            >
                                <Input placeholder="Nhập tên người gửi" />
                            </Form.Item>
                            <Form.Item
                                name="senderAccount"
                                label="Số tài khoản"
                                rules={[{ required: true, message: 'Vui lòng nhập số tài khoản' }]}
                            >
                                <Input placeholder="Nhập số tài khoản" />
                            </Form.Item>
                            <Form.Item
                                name="senderBank"
                                label="Ngân hàng"
                                rules={[{ required: true, message: 'Vui lòng nhập tên ngân hàng' }]}
                            >
                                <Input placeholder="Nhập tên ngân hàng" />
                            </Form.Item>
                        </div>
                        <div style={{ flex: 1 }}>
                            <h3>Thông tin người nhận</h3>
                            <Form.Item
                                name="receiverName"
                                label="Tên người nhận"
                                rules={[{ required: true, message: 'Vui lòng nhập tên người nhận' }]}
                            >
                                <Input placeholder="Nhập tên người nhận" />
                            </Form.Item>
                            <Form.Item
                                name="receiverAccount"
                                label="Số tài khoản"
                                rules={[{ required: true, message: 'Vui lòng nhập số tài khoản' }]}
                            >
                                <Input placeholder="Nhập số tài khoản" />
                            </Form.Item>
                            <Form.Item
                                name="receiverBank"
                                label="Ngân hàng"
                                rules={[{ required: true, message: 'Vui lòng nhập tên ngân hàng' }]}
                            >
                                <Input placeholder="Nhập tên ngân hàng" />
                            </Form.Item>
                        </div>
                    </div>
                    <Form.Item
                        name="amount"
                        label="Số tiền"
                        rules={[{ required: true, message: 'Vui lòng nhập số tiền' }]}
                    >
                        <Input type="number" placeholder="Nhập số tiền" />
                    </Form.Item>
                    <Form.Item
                        name="description"
                        label="Nội dung chuyển khoản"
                        rules={[{ max: 500, message: 'Nội dung không được vượt quá 500 ký tự' }]}
                    >
                        <TextArea
                            placeholder="Nhập nội dung chuyển khoản"
                            autoSize={{ minRows: 3, maxRows: 6 }}
                        />
                    </Form.Item>
                    <Form.Item>
                        <Space>
                            <Button type="primary" htmlType="submit">
                                Tạo giao dịch
                            </Button>
                            <Button onClick={() => setModalVisible(false)}>
                                Hủy
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>

            {/* Modal chi tiết giao dịch */}
            <Modal
                title="Chi tiết giao dịch"
                open={detailModalVisible}
                onCancel={() => setDetailModalVisible(false)}
                footer={null}
                width={600}
            >
                {selectedTransfer && (
                    <div>
                        <div style={{ marginBottom: 16 }}>
                            <h3>Mã giao dịch: {selectedTransfer.transferNumber}</h3>
                            <Tag color={selectedTransfer.status === 'SUCCESS' ? 'success' : 'processing'}>
                                {selectedTransfer.status === 'SUCCESS' ? 'Thành công' : 'Đang xử lý'}
                            </Tag>
                        </div>
                        <div style={{ display: 'flex', gap: '24px' }}>
                            <div style={{ flex: 1 }}>
                                <h4>Thông tin người gửi</h4>
                                <p><strong>Tên:</strong> {selectedTransfer.senderName}</p>
                                <p><strong>Số tài khoản:</strong> {selectedTransfer.senderAccount}</p>
                                <p><strong>Ngân hàng:</strong> {selectedTransfer.senderBank}</p>
                            </div>
                            <div style={{ flex: 1 }}>
                                <h4>Thông tin người nhận</h4>
                                <p><strong>Tên:</strong> {selectedTransfer.receiverName}</p>
                                <p><strong>Số tài khoản:</strong> {selectedTransfer.receiverAccount}</p>
                                <p><strong>Ngân hàng:</strong> {selectedTransfer.receiverBank}</p>
                            </div>
                        </div>
                        <div style={{ marginTop: 16 }}>
                            <h4>Thông tin giao dịch</h4>
                            <p><strong>Số tiền:</strong> {formatCurrency(selectedTransfer.amount)}</p>
                            <p><strong>Nội dung:</strong> {selectedTransfer.description}</p>
                            <p><strong>Ngày tạo:</strong> {new Date(selectedTransfer.createdAt).toLocaleString('vi-VN')}</p>
                            <p><strong>Ngày cập nhật:</strong> {new Date(selectedTransfer.updatedAt).toLocaleString('vi-VN')}</p>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default BankTransferList; 