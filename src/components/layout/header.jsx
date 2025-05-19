import React, { useContext, useState } from 'react';
import { Layout, Menu, Input, Button, Badge, Avatar, Dropdown, Space, Typography, message, Modal } from 'antd';
import {
  SearchOutlined,
  ShoppingCartOutlined,
  UserOutlined,
  LogoutOutlined,
  BookOutlined,
  HomeOutlined,
  LoginOutlined,
  UserAddOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import { Link, useNavigate, useLocation, NavLink } from 'react-router-dom';
import './Header.css';
import { AuthContext } from '../context/auth-context';
import { logoutAPI } from '../../services/api-service';

const { Header: AntHeader } = Layout;
const { Text } = Typography;
const { confirm } = Modal;

const Header = () => {
  const [searchText, setSearchText] = useState('');
  const [current, setCurrent] = useState('');
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, setUser, setIsLoading } = useContext(AuthContext);

  const handleSearch = (value) => {
    if (value.trim()) {
      navigate(`/search?q=${encodeURIComponent(value.trim())}`);
    }
  };

  const onClick = (e) => {
    setCurrent(e.key);
  };

  const showLogoutConfirm = () => {
    confirm({
      title: 'Bạn có chắc chắn muốn đăng xuất?',
      icon: <ExclamationCircleOutlined />,
      content: 'Đăng xuất sẽ kết thúc phiên làm việc hiện tại của bạn.',
      okText: 'Đăng xuất',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: handleLogout
    });
  };

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      const response = await logoutAPI();
      console.log("Check data", response);
      if (response.status === 200) {
        localStorage.removeItem('access_token');
        setUser({
          id: '',
          fullName: '',
          email: '',
          role: '',
          avatar: '',
          phone: ''
        });
        message.success('Đăng xuất thành công');
        navigate('/');
      } else {
        message.error('Đăng xuất thất bại');
      }
    } catch (error) {
      console.error('Logout error:', error);
      message.error('Có lỗi xảy ra khi đăng xuất');
    } finally {
      setIsLoggingOut(false);
    }
  };

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: <Link to="/profile">Hồ sơ</Link>
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: <span onClick={showLogoutConfirm}>Đăng xuất</span>,
      danger: true
    }
  ];

  const menuItems = [
    {
      label: <Link to="/">Trang chủ</Link>,
      key: 'home',
      icon: <HomeOutlined />,
    },
    ...(user?.role === 'ADMIN' ? [
      {
        label: <Link to="/users">Quản lý người dùng</Link>,
        key: 'users',
        icon: <UserOutlined />,
      }
    ] : []),
    {
      label: <Link to="/books">Sách</Link>,
      key: 'books',
      icon: <BookOutlined />,
    },
    ...(!user?.id ? [
      {
        label: <NavLink to="/login">Đăng nhập</NavLink>,
        key: 'login',
        icon: <LoginOutlined />,
      },
      {
        label: <NavLink to="/register">Đăng ký</NavLink>,
        key: 'register',
        icon: <UserAddOutlined />,
      }
    ] : []),
    ...(user?.id ? [
      {
        label: (
          <Dropdown
            menu={{ items: userMenuItems }}
            placement="bottomRight"
            trigger={['click']}
          >
            <Space className="user-dropdown">
              <Avatar
                src={user.avatar}
                icon={<UserOutlined />}
                className="user-avatar"
              />
              <Text className="user-text">{user.fullName}</Text>
            </Space>
          </Dropdown>
        ),
        key: 'user-menu',
      }
    ] : [])
  ];

  return (
    <AntHeader className="header">
      <div className="header-container">
        <div className="logo">
          <Link to="/">
            <Space>
              <BookOutlined className="logo-icon" />
              <Text className="logo-text">Book Store</Text>
            </Space>
          </Link>
        </div>

        <Menu
          mode="horizontal"
          theme="dark"
          className="menu"
          selectedKeys={[current]}
          onClick={onClick}
          items={menuItems}
        />

        <div className="header-right">
          <Input.Search
            placeholder="Tìm kiếm sách..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onSearch={handleSearch}
            className="search-input"
            allowClear
          />
          {user?.id && (
            <Badge count={0} showZero>
              <Button
                type="text"
                icon={<ShoppingCartOutlined />}
                className="header-icon"
                onClick={() => navigate('/cart')}
              />
            </Badge>
          )}
        </div>
      </div>
    </AntHeader>
  );
};

export default Header;


