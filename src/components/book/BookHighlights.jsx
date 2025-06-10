import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Typography, Spin, Empty } from 'antd';
import { getTopSellingBooksAPI, getLatestBooksAPI } from '../../services/api-service';
import BookCard from './BookCard';

const { Title } = Typography;

const BookHighlights = () => {
    const [topSellingBooks, setTopSellingBooks] = useState([]);
    const [latestBooks, setLatestBooks] = useState([]);
    const [loading, setLoading] = useState({
        topSelling: true,
        latest: true
    });

    useEffect(() => {
        loadTopSellingBooks();
        loadLatestBooks();
    }, []);

    const loadTopSellingBooks = async () => {
        try {
            const response = await getTopSellingBooksAPI(5);
            if (response?.success && Array.isArray(response.data)) {
                setTopSellingBooks(response.data);
            } else {
                setTopSellingBooks([]);
            }
        } catch (error) {
            console.error("Error loading top selling books:", error);
            setTopSellingBooks([]);
        } finally {
            setLoading(prev => ({ ...prev, topSelling: false }));
        }
    };

    const loadLatestBooks = async () => {
        try {
            const response = await getLatestBooksAPI(3);
            if (response?.success && Array.isArray(response.data)) {
                setLatestBooks(response.data);
            } else {
                setLatestBooks([]);
            }
        } catch (error) {
            console.error("Error loading latest books:", error);
            setLatestBooks([]);
        } finally {
            setLoading(prev => ({ ...prev, latest: false }));
        }
    };

    const renderBookSection = (title, books = [], isLoading, type) => {
        if (!Array.isArray(books)) {
            books = [];
        }

        return (
            <Card style={{ marginBottom: 24 }}>
                <Title level={4} style={{ marginBottom: 16 }}>{title}</Title>
                <Spin spinning={isLoading}>
                    {books.length > 0 ? (
                        <Row gutter={[16, 16]}>
                            {books.map(book => (
                                <Col xs={24} sm={12} md={8} lg={type === 'latest' ? 8 : 6} key={book.id}>
                                    <BookCard
                                        book={book}
                                        style={{ width: '100%', maxWidth: '280px', transition: 'all 0.3s ease' }}
                                    />
                                </Col>
                            ))}
                        </Row>
                    ) : (
                        <Empty description="Không có sách nào" />
                    )}
                </Spin>
            </Card>
        );
    };

    return (
        <div className="book-highlights">
            {renderBookSection(
                "Sách bán chạy",
                topSellingBooks,
                loading.topSelling,
                'topSelling'
            )}
            {renderBookSection(
                "Sách mới nhất",
                latestBooks,
                loading.latest,
                'latest'
            )}
        </div>
    );
};

export default BookHighlights; 