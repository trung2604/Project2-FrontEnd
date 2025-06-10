import React, { useEffect, useState } from 'react';
import { Form, Input, Select, InputNumber, Button, Space, Card, Row, Col } from 'antd';
import { SearchOutlined, FilterOutlined } from '@ant-design/icons';
import { getAllCategoriesAPI } from '../../services/api-service';

const { Option } = Select;

const BookSearchForm = ({ onSearch, loading }) => {
    const [form] = Form.useForm();
    const [categories, setCategories] = useState([]);
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        loadCategories();
    }, []);

    const loadCategories = async () => {
        try {
            const response = await getAllCategoriesAPI({ size: 100 });
            if (response?.data) {
                const categoriesData = Array.isArray(response.data)
                    ? response.data
                    : Array.isArray(response.data.result)
                        ? response.data.result
                        : [];
                setCategories(categoriesData);
            }
        } catch (error) {
            console.error("Error loading categories:", error);
        }
    };

    const handleSearch = (values) => {
        const searchParams = {
            ...values,
            page: 0, // Reset to first page on new search
            size: 10
        };
        onSearch(searchParams);
    };

    const handleReset = () => {
        form.resetFields();
        onSearch({ page: 0, size: 10 });
    };

    return (
        <Card className="search-form-card" style={{ marginBottom: 24 }}>
            <Form
                form={form}
                onFinish={handleSearch}
                layout="vertical"
                initialValues={{
                    sortBy: 'createdAt',
                    sortDirection: 'desc',
                    inStock: true
                }}
            >
                <Row gutter={[16, 16]}>
                    <Col xs={24} sm={24} md={12} lg={8}>
                        <Form.Item name="keyword" label="Tìm kiếm">
                            <Input
                                placeholder="Nhập từ khóa tìm kiếm..."
                                prefix={<SearchOutlined />}
                                allowClear
                            />
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={24} md={12} lg={8}>
                        <Form.Item name="categoryId" label="Thể loại">
                            <Select
                                placeholder="Chọn thể loại"
                                allowClear
                                showSearch
                                optionFilterProp="children"
                            >
                                {categories.map(cat => (
                                    <Option key={cat.id} value={cat.id}>
                                        {cat.name}
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={24} md={24} lg={8}>
                        <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
                            <Button
                                type="default"
                                icon={<FilterOutlined />}
                                onClick={() => setShowFilters(!showFilters)}
                            >
                                {showFilters ? 'Ẩn bộ lọc' : 'Hiện bộ lọc'}
                            </Button>
                            <Button type="primary" htmlType="submit" loading={loading}>
                                Tìm kiếm
                            </Button>
                            <Button onClick={handleReset}>Đặt lại</Button>
                        </Space>
                    </Col>
                </Row>

                {showFilters && (
                    <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
                        <Col xs={24} sm={12} md={8} lg={6}>
                            <Form.Item name="minPrice" label="Giá tối thiểu">
                                <InputNumber
                                    style={{ width: '100%' }}
                                    min={0}
                                    placeholder="Nhập giá tối thiểu"
                                    formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                    parser={value => value.replace(/\$\s?|(,*)/g, '')}
                                />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12} md={8} lg={6}>
                            <Form.Item name="maxPrice" label="Giá tối đa">
                                <InputNumber
                                    style={{ width: '100%' }}
                                    min={0}
                                    placeholder="Nhập giá tối đa"
                                    formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                    parser={value => value.replace(/\$\s?|(,*)/g, '')}
                                />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12} md={8} lg={6}>
                            <Form.Item name="inStock" label="Trạng thái">
                                <Select>
                                    <Option value={true}>Còn hàng</Option>
                                    <Option value={false}>Hết hàng</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12} md={8} lg={6}>
                            <Form.Item name="sortBy" label="Sắp xếp theo">
                                <Select>
                                    <Option value="price">Giá</Option>
                                    <Option value="createdAt">Ngày tạo</Option>
                                    <Option value="title">Tên sách</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12} md={8} lg={6}>
                            <Form.Item name="sortDirection" label="Thứ tự">
                                <Select>
                                    <Option value="asc">Tăng dần</Option>
                                    <Option value="desc">Giảm dần</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>
                )}
            </Form>
        </Card>
    );
};

export default BookSearchForm; 