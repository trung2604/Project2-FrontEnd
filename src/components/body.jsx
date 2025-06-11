import BookHighlights from './book/BookHighlights';
import CategoryBookList from './book/CategoryBookList';
import { Typography, Button } from 'antd';
import { BookOutlined, ShoppingOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import './body.css';

const { Title, Paragraph } = Typography;

const Body = () => {
  const navigate = useNavigate();

  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <Title level={1}>Khám Phá Thế Giới Sách</Title>
          <Paragraph className="hero-description">
            Nơi bạn tìm thấy những cuốn sách hay nhất, mới nhất và được yêu thích nhất
          </Paragraph>
          <div className="hero-buttons">
            <Button
              type="primary"
              size="large"
              icon={<BookOutlined />}
              onClick={() => navigate('/books')}
            >
              Xem Sách
            </Button>
            <Button
              size="large"
              icon={<ShoppingOutlined />}
              onClick={() => navigate('/categories')}
            >
              Danh Mục
            </Button>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="main-content">
        {/* Featured Books Section */}
        <section className="content-section">
          <div className="section-container">
            <Title level={2} className="section-title">Sách Nổi Bật</Title>
            <BookHighlights />
          </div>
        </section>

        {/* Categories Section */}
        <section className="content-section categories-section">
          <div className="section-container">
            <Title level={2} className="section-title">Danh Mục Sách</Title>
            <CategoryBookList />
          </div>
        </section>
      </div>
    </div>
  );
};

export default Body;
