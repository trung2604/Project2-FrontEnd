import { useEffect, useState } from 'react';
import { Card, Tag, Spin, Empty, Typography, Row, Col } from 'antd';
import { getAllCategoriesAPI, getBookCountByCategoryAPI } from '../../services/api-service';
import { useNavigate } from 'react-router-dom';
import '../../styles/category-list.css';
import { message } from 'antd';
import { BookOutlined } from '@ant-design/icons';

const { Title, Paragraph } = Typography;

const CategoryBookList = ({ onCategorySelect, selectedCategoryId, mode }) => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [bookCounts, setBookCounts] = useState({});
    const navigate = useNavigate();

    const gridStyle = mode === "landing" ? { width: "100%", overflowX: "auto", padding: "0 32px", margin: "0 auto", maxWidth: 1200 } : { width: "100%", margin: "0 auto", padding: "0 32px", maxWidth: 1200 };

    useEffect(() => {
        loadCategoriesAndCounts();
    }, []);

    const loadCategoriesAndCounts = async () => {
        setLoading(true);
        try {
            const [catRes, countRes] = await Promise.all([
                getAllCategoriesAPI(),
                getBookCountByCategoryAPI()
            ]);
            let categoriesData = Array.isArray(catRes.data)
                ? catRes.data
                : Array.isArray(catRes.data.result)
                    ? catRes.data.result
                    : [];
            const validCategories = categoriesData
                .filter(cat => cat && cat.id && cat.name)
                .map(cat => ({
                    id: cat.id,
                    name: cat.name,
                    description: cat.description || ''
                }));
            setCategories(validCategories);

            // Xử lý response mới từ backend
            let countMap = {};
            if (countRes?.data && Array.isArray(countRes.data)) {
                countRes.data.forEach(item => {
                    // Map categoryId từ backend sang id để phù hợp với dữ liệu hiện tại
                    countMap[item.categoryId] = item.bookCount;
                });
            }
            setBookCounts(countMap);
        } catch (error) {
            console.error("Error loading categories or book counts:", error);
            message.error("Không thể tải danh mục hoặc số lượng sách");
        } finally {
            setLoading(false);
        }
    };

    const handleCategoryClick = (category) => {
        navigate(`/categories/${category.id}`, { state: { category } });
    };

    return (
        <div className={mode === 'landing' ? '' : 'category-sidebar'}>
            <Spin spinning={loading} tip="Đang tải danh mục..." size="large">
                {categories.length === 0 ? (
                    <Empty description="Không có danh mục nào" />
                ) : mode === 'landing' ? (
                    <Row gutter={[16, 0]} style={{ margin: 0, flexWrap: "nowrap", overflowX: "auto" }}>
                        {categories.map((category) => (
                            <Col key={category.id} style={{ padding: 0, flex: "0 0 auto", width: "auto", minWidth: "200px" }}>
                                <Card
                                    hoverable
                                    className="category-card"
                                    onClick={() => handleCategoryClick(category)}
                                    styles={{ body: { padding: "16px" } }}
                                >
                                    <div className="category-icon">
                                        <BookOutlined />
                                    </div>
                                    <Title level={5} className="category-name" ellipsis={{ rows: 1 }}>
                                        {category.name}
                                    </Title>
                                    {category.description && (
                                        <Paragraph className="category-description" ellipsis={{ rows: 2 }}>
                                            {category.description}
                                        </Paragraph>
                                    )}
                                    <Tag color="blue" className="category-count">
                                        {bookCounts[category.id] || 0} sách
                                    </Tag>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                ) : (
                    categories.map((category) => (
                        <Card
                            hoverable
                            className={`category-card${selectedCategoryId === category.id ? ' active' : ''}`}
                            key={category.id}
                            onClick={() => handleCategoryClick(category)}
                            styles={{ body: { padding: "12px 16px" } }}
                        >
                            <div className="category-icon">
                                <BookOutlined />
                            </div>
                            <Title level={5} className="category-name" ellipsis={{ rows: 1 }}>
                                {category.name}
                            </Title>
                            {category.description && (
                                <Paragraph className="category-description" ellipsis={{ rows: 2 }}>
                                    {category.description}
                                </Paragraph>
                            )}
                            <Tag color="blue" className="category-count">
                                {bookCounts[category.id] || 0} sách
                            </Tag>
                        </Card>
                    ))
                )}
            </Spin>
        </div>
    );
};

export default CategoryBookList; 