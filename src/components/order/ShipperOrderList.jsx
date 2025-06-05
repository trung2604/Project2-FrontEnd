import React, { useEffect, useState, useContext } from 'react';
import { Table, Button, message, Space } from 'antd';
import { getShipperOrdersAPI, startShippingOrderAPI, deliveredOrderAPI } from '../../services/api-service';
import { AuthContext } from '../context/auth-context';

const ShipperOrderList = () => {
    const { user } = useContext(AuthContext);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);

    const loadOrders = async () => {
        setLoading(true);
        try {
            const res = await getShipperOrdersAPI({ page: 0, size: 10, sort: 'createdAt,desc' });
            setOrders(res?.data?.content || []);
        } catch (e) {
            message.error('Không thể tải đơn hàng');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadOrders();
    }, []);

    const handleStartShipping = async (orderId) => {
        try {
            const res = await startShippingOrderAPI(orderId);
            if (res.success) {
                message.success('Bắt đầu giao hàng thành công');
                await loadOrders();
            } else {
                message.error(res.message || 'Bắt đầu giao hàng thất bại!');
            }
        } catch (e) {
            message.error('Bắt đầu giao hàng thất bại!');
        }
    };

    const handleDelivered = async (orderId) => {
        try {
            const res = await deliveredOrderAPI(orderId);
            if (res.success) {
                message.success('Xác nhận đã giao hàng thành công');
                await loadOrders();
            } else {
                message.error(res.message || 'Xác nhận đã giao hàng thất bại!');
            }
        } catch (e) {
            message.error('Xác nhận đã giao hàng thất bại!');
        }
    };

    const columns = [
        { title: 'Mã đơn', dataIndex: 'id', key: 'id' },
        { title: 'Khách hàng', dataIndex: 'fullName', key: 'fullName' },
        { title: 'Địa chỉ', dataIndex: 'address', key: 'address' },
        { title: 'Trạng thái', dataIndex: 'status', key: 'status' },
        {
            title: 'Thao tác',
            key: 'action',
            render: (_, record) => (
                <Space>
                    {record.status === 'CONFIRMED' && (
                        <Button type="primary" onClick={() => handleStartShipping(record.id)}>
                            Bắt đầu giao hàng
                        </Button>
                    )}
                    {record.status === 'SHIPPING' && (
                        <Button type="primary" onClick={() => handleDelivered(record.id)}>
                            Đã giao hàng
                        </Button>
                    )}
                </Space>
            )
        }
    ];

    return (
        <Table
            dataSource={orders}
            columns={columns}
            rowKey="id"
            loading={loading}
            pagination={false}
        />
    );
};

export default ShipperOrderList; 