import React from 'react';
import { Typography } from 'antd';
import OrderList from '../components/order/OrderList';

const { Title } = Typography;

const OrderPage = () => {
    return (
        <div>
            <Title level={2}>Quản lý đơn hàng</Title>
            <OrderList />
        </div>
    );
};

export default OrderPage; 