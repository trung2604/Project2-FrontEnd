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
  ExclamationCircleOutlined,
  AppstoreOutlined,
  ShoppingOutlined,
  BarChartOutlined,
  StarOutlined
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
  const location = useLocation();
  const [selectedKey, setSelectedKey] = useState('home');
  const [openKeys, setOpenKeys] = useState([]);

  // Theo dõi thay đổi của giỏ hàng và cập nhật số lượng
  useEffect(() => {
    if (user?.id) {
      const count = getCartCount();
      setCartCount(count);
    } else {
      setCartCount(0);
    }
  }, [cart, user?.id]);

  // Gọi fetchCart khi user đăng nhập hoặc khi vào trang web
  useEffect(() => {
    if (user?.id) {
      fetchCart();
    }
  }, [user?.id]);

  useEffect(() => {
    const path = location.pathname;
    if (path === '/' || path.startsWith('/home')) {
      setSelectedKey('home');
      setOpenKeys([]);
    } else if (user?.role === 'ROLE_ADMIN' && (
      path.startsWith('/admin/categories') ||
      path.startsWith('/admin/books') ||
      path.startsWith('/admin/users') ||
      path.startsWith('/admin/orders') ||
      path.startsWith('/admin/reviews')
    )) {
      setSelectedKey('admin-management');
      setOpenKeys(['admin-management']);
    } else if (path.startsWith('/reports')) {
      setSelectedKey('reports');
      setOpenKeys([]);
    } else {
      // user thường
      if (path.startsWith('/categories')) setSelectedKey('categories');
      else if (path.startsWith('/books')) setSelectedKey('books');
      else if (path.startsWith('/orders')) setSelectedKey('orders');
      else if (path.startsWith('/reports')) setSelectedKey('reports');
      else setSelectedKey('');
      setOpenKeys([]);
    }
  }, [location.pathname, user?.role]);

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

  // Menu items chính (dùng selectedKeys và onClick, label là text)
  const getMenuItems = () => {
    // Luôn thêm Trang chủ đầu tiên
    const items = [
      {
        key: 'home',
        icon: <HomeOutlined />,
        label: 'Trang chủ',
      }
    ];

    if (user?.role === 'ROLE_ADMIN') {
      // Gom nhóm các mục quản trị vào submenu "Quản lý"
      items.push(
        {
          key: 'admin-management',
          icon: <AppstoreOutlined />,
          label: 'Quản lý',
          children: [
            {
              key: 'categories',
              icon: <AppstoreOutlined />,
              label: 'Quản lý danh mục',
            },
            {
              key: 'books',
              icon: <BookOutlined />,
              label: 'Quản lý sách',
            },
            {
              key: 'users',
              icon: <UserOutlined />,
              label: 'Quản lý người dùng',
            },
            {
              key: 'admin-orders',
              icon: <ShoppingOutlined />,
              label: 'Quản lý đơn hàng',
            },
            {
              key: 'reviews',
              icon: <StarOutlined />,
              label: 'Quản lý đánh giá',
            },
          ]
        },
        {
          key: 'reports',
          icon: <BarChartOutlined />,
          label: 'Báo cáo thống kê',
        }
      );
    } else {
      items.push(
        {
          key: 'categories',
          icon: <AppstoreOutlined />,
          label: 'Danh mục',
        },
        {
          key: 'books',
          icon: <BookOutlined />,
          label: 'Sách',
        }
      );
    }

    if (user?.id && user?.role !== 'ROLE_ADMIN') {
      items.push({
        key: 'orders',
        icon: <ShoppingOutlined />,
        label: 'Đơn hàng',
      });
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
      // Chỉ user thường mới có mục Đánh giá của tôi
      ...(user?.role === 'ROLE_USER' ? [
        {
          key: 'my-reviews',
          icon: <StarOutlined />,
          label: <span onClick={() => navigate('/my-reviews')}>Đánh giá của tôi</span>
        }
      ] : []),
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
      <div className="header-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '100%' }}>
        {/* Logo bên trái */}
        <div className="logo" style={{ flex: '0 0 auto' }}>
          <Link to="/">
            <Space>
              <BookOutlined className="logo-icon" />
              <Text className="logo-text">Book Store</Text>
            </Space>
          </Link>
        </div>
        {/* Menu giữa */}
        <div className="menu-scroll-wrapper">
          <Menu
            mode="horizontal"
            theme="dark"
            className="menu responsive-menu"
            selectedKeys={[selectedKey]}
            openKeys={openKeys}
            onOpenChange={setOpenKeys}
            items={getMenuItems()}
            style={{ flex: 1, minWidth: 0, justifyContent: 'center', border: 'none', background: 'transparent' }}
            onClick={({ key }) => {
              switch (key) {
                case 'home': navigate('/'); break;
                case 'categories': navigate('/categories'); break;
                case 'books': navigate('/books'); break;
                case 'users': navigate('/users'); break;
                case 'orders': navigate('/orders'); break;
                case 'admin-orders': navigate('/orders'); break;
                case 'reports': navigate('/reports'); break;
                case 'reviews': navigate('/admin/reviews'); break;
                default: break;
              }
            }}
            overflowedIndicator={false}
          />
        </div>
        {/* User/cart bên phải */}
        <div className="header-right" style={{ flex: '0 0 auto', display: 'flex', alignItems: 'center', gap: 16 }}>
          {!user?.id && (
            <>
              <Button
                type="link"
                className="header-link"
                icon={<LoginOutlined />}
                onClick={() => navigate('/login')}
              >
                Đăng nhập
              </Button>
              <Button
                type="link"
                className="header-link"
                icon={<UserAddOutlined />}
                onClick={() => navigate('/register')}
              >
                Đăng ký
              </Button>
            </>
          )}
          {user?.id && user.role === 'ROLE_USER' && (
            <Badge count={cartCount} showZero offset={[0, 2]}>
              <Button
                type="text"
                icon={<ShoppingCartOutlined />}
                className="header-icon"
                onClick={() => navigate('/cart')}
                style={{ fontSize: 22 }}
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
                <span className="user-header-name" style={{ maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.fullName}</span>
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


