import React from 'react';
import { Typography } from 'antd';
import BankTransferList from '../components/bank-transfer/BankTransferList';

const { Title } = Typography;

const BankTransferPage = () => {
    return (
        <div>
            <Title level={2}>Quản lý giao dịch chuyển khoản</Title>
            <BankTransferList />
        </div>
    );
};

export default BankTransferPage; 