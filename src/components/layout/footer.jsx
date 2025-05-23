import React from 'react';
import { Layout, Row, Col, Typography, Divider, Space, Button } from 'antd';
import {
  BookOutlined,
  FacebookOutlined,
  TwitterOutlined,
  InstagramOutlined,
  MailOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  ArrowUpOutlined
} from '@ant-design/icons';
import { Link } from 'react-router-dom';
import './Footer.css';

const { Footer: AntFooter } = Layout;
const { Title, Paragraph, Text } = Typography;

const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <AntFooter className="footer">
      <div className="footer-container">
        <Row gutter={[32, 32]} className="footer-content">
          <Col xs={24} sm={12} md={6}>
            <div className="footer-brand">
              <Link to="/" className="footer-logo">
                <BookOutlined />
                <span>Book Store</span>
              </Link>
              <Paragraph className="footer-description">
                Giao diện người dùng cho hệ thống Book Store, xây dựng bằng ReactJS và Ant Design.
              </Paragraph>
              <Space size="middle" className="footer-social">
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
                  <FacebookOutlined />
                </a>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
                  <InstagramOutlined />
                </a>
              </Space>
            </div>
          </Col>

          <Col xs={24} sm={12} md={6}>
            <Title level={5} className="footer-title">Liên kết</Title>
            <ul className="footer-links">
              <li><Link to="/">Trang chủ</Link></li>
              <li><Link to="/books">Sách</Link></li>
              <li><Link to="/categories">Danh mục</Link></li>
              <li><Link to="/about">Giới thiệu</Link></li>
            </ul>
          </Col>

          <Col xs={24} sm={12} md={6}>
            <Title level={5} className="footer-title">Chính sách</Title>
            <ul className="footer-links">
              <li><Link to="/privacy">Chính sách bảo mật</Link></li>
              <li><Link to="/terms">Điều khoản sử dụng</Link></li>
            </ul>
          </Col>

          <Col xs={24} sm={12} md={6}>
            <Title level={5} className="footer-title">Liên hệ</Title>
            <ul className="footer-contact">
              <li>
                <PhoneOutlined />
                <span>Điện thoại: 0909090909</span>
              </li>
              <li>
                <MailOutlined />
                <span>Email: dodinhtrungthptyv@gmail.com</span>
              </li>
            </ul>
          </Col>
        </Row>
      </div>
    </AntFooter>
  );
};

export default Footer;


