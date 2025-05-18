import { Link, NavLink } from 'react-router-dom';
import { Menu } from 'antd';
import { useState } from 'react';
import { HomeOutlined, UserOutlined, BookOutlined, LoginOutlined, UserAddOutlined } from '@ant-design/icons';
const Header = () => {
  const [current, setCurrent] = useState('');
  const onClick = e => {
    console.log('click ', e);
    setCurrent(e.key);
  };
  const items = [
    {
      label: (
        <Link to="/">
          Home
        </Link>
      ),
      key: 'home',
      icon: <HomeOutlined />,
    },
    {
      label: (
        <Link to="/users">
            Users
          </Link>
        ),
      key: 'users',
      icon: <UserOutlined />,
    },
    {
      label: (
        <Link to="/books">
          Books
        </Link>
      ),
      key: 'books',
      icon: <BookOutlined />,
    },
    {
      key: 'login',
      label: (
        <NavLink to="/login">
          Login
        </NavLink>
      ),
      icon: <LoginOutlined />,
    },
    {
      key: 'register',
      label: (
        <NavLink to="/register">
          Register
        </NavLink>
      ),
      icon: <UserAddOutlined />,
    },
  ];
  return <Menu onClick={onClick} selectedKeys={[current]} mode="horizontal" items={items} />;
};

export default Header;


