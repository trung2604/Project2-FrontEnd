import { useEffect, useState } from 'react';
import { Card, Tag, Spin, Empty, Typography } from 'antd';
import { getAllCategoriesAPI, getBookCountByCategoryAPI } from '../../services/api-service';
import { useNavigate } from 'react-router-dom';
import '../../styles/category-list.css';
import { message } from 'antd';

const { Title } = Typography;

const CategoryBookList = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [bookCounts, setBookCounts] = useState({});
    const navigate = useNavigate();

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
        <div className="category-list-container">
            <Title level={4} style={{ marginBottom: 16 }}>Danh mục sách</Title>
            <Spin spinning={loading}>
                {categories.length > 0 ? (
                    <div className="category-list-flex">
                        {categories.map(category => (
                            <Card
                                hoverable
                                className="category-card"
                                key={category.id}
                                onClick={() => handleCategoryClick(category)}
                            >
                                <div className="category-content">
                                    <Title level={5} className="category-name">
                                        {category.name}
                                    </Title>
                                    {category.description && (
                                        <p className="category-description">
                                            {category.description}
                                        </p>
                                    )}
                                    <Tag color="blue" className="book-count">
                                        {bookCounts[category.id] !== undefined
                                            ? `${bookCounts[category.id]} sách`
                                            : '0 sách'}
                                    </Tag>
                                </div>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <Empty description="Không có danh mục nào" />
                )}
            </Spin>
        </div>
    );
};

export default CategoryBookList; 