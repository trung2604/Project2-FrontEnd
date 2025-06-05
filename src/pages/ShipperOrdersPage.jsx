import React from 'react';
import ShipperOrderList from '../components/order/ShipperOrderList';
import { Typography } from 'antd';

const { Title } = Typography;

const ShipperOrdersPage = () => (
    <div>
        <Title level={2}>Đơn hàng của bạn (Shipper)</Title>
        <ShipperOrderList />
    </div>
);

export default ShipperOrdersPage; 