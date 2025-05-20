import React, { useContext, useEffect, useState } from 'react';
import { Layout, Menu, Input, Button, Badge, Avatar, Space, Typography, message, Modal, Dropdown } from 'antd';
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
import { getAllBookAPI, getAllUserAPI, logoutAPI, getAccountAPI } from '../../services/api-service';
import ViewUserDetails from '../user/view-user-details';
import AvatarCustom from '../common/Avatar';
import { useCart } from '../context/cart-context.jsx';

const { Header: AntHeader } = Layout;
const { Text } = Typography;
const { confirm } = Modal;

const Header = () => {
  const [searchText, setSearchText] = useState('');
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [current, setCurrent] = useState('');
  const navigate = useNavigate();
  const { user, setUser } = useContext(AuthContext);
  const [dataDetails, setDataDetails] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const { getCartCount, cart, fetchCart } = useCart();
  const [cartCount, setCartCount] = useState(0);

  // Theo dõi thay đổi của giỏ hàng và cập nhật số lượng
  useEffect(() => {
    if (user?.id) {
      const count = getCartCount();
      setCartCount(count);
    } else {
      setCartCount(0);
    }
  }, [cart, user?.id]);


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

  // Hàm reload lại user hiện tại
  const reloadCurrentUser = async () => {
    const res = await getAccountAPI();
    if (res && res.data) {
      setUser(res.data);
    }
  };

  // Menu items chính
  const getMenuItems = () => {
    const items = [
      {
        key: 'home',
        icon: <HomeOutlined />,
        label: <Link to="/">Trang chủ</Link>
      }
    ];

    if (user?.role === 'ROLE_ADMIN') {
      items.push({
        key: 'users',
        icon: <UserOutlined />,
        label: <Link to="/users">Quản lý người dùng</Link>
      });
    }

    items.push({
      key: 'books',
      icon: <BookOutlined />,
      label: <Link to="/books">Sách</Link>
    });

    if (!user?.id) {
      items.push(
        {
          key: 'login',
          icon: <LoginOutlined />,
          label: <NavLink to="/login">Đăng nhập</NavLink>
        },
        {
          key: 'register',
          icon: <UserAddOutlined />,
          label: <NavLink to="/register">Đăng ký</NavLink>
        }
      );
    }

    return items;
  };

  // Dropdown menu cho user
  const userDropdownMenu = {
    items: [
      {
        key: 'profile',
        icon: <UserOutlined />,
        label: <span onClick={() => {
          setIsDetailsOpen(true);
          setDataDetails(user);
        }}>Hồ sơ</span>
      },
      {
        key: 'logout',
        icon: <LogoutOutlined />,
        label: <span onClick={showLogoutConfirm}>Đăng xuất</span>,
        danger: true
      }
    ]
  };

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
          items={getMenuItems()}
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
          {user?.id && user.role === 'ROLE_USER' && (
            <Badge count={cartCount} showZero>
              <Button
                type="text"
                icon={<ShoppingCartOutlined />}
                className="header-icon"
                onClick={() => navigate('/cart')}
              />
            </Badge>
          )}
          {user?.id && (
            <Dropdown
              menu={userDropdownMenu}
              placement="bottomRight"
              trigger={['click']}
            >
              <div className="user-header-info">
                <AvatarCustom
                  avatar={user.avatar}
                  size="small"
                  alt={user.fullName}
                  className="user-header-avatar"
                />
                <span className="user-header-name">{user.fullName}</span>
              </div>
            </Dropdown>
          )}
        </div>
      </div>
      <ViewUserDetails
        isDetailsOpen={isDetailsOpen}
        setIsDetailsOpen={setIsDetailsOpen}
        dataDetails={dataDetails}
        setDataDetails={setDataDetails}
        loadUser={() => { }}
        reloadCurrentUser={reloadCurrentUser}
      />
    </AntHeader>
  );
};

export default Header;


