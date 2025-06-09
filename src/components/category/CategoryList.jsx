import React, { useState, useEffect, useContext } from 'react';
import { Table, Button, Space, Modal, Form, Input, message, Popconfirm, Tag } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { getAllCategoriesAPI, createCategoryAPI, updateCategoryAPI, deleteCategoryAPI, getBookCountByCategoryAPI } from '../../services/api-service';
import { AuthContext } from '../context/auth-context';
import { useNavigate, Link } from 'react-router-dom';

const { TextArea } = Input;

const CategoryList = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const isAdmin = user?.role === 'ROLE_ADMIN';
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [form] = Form.useForm();
    const [editingCategory, setEditingCategory] = useState(null);
    const [current, setCurrent] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [total, setTotal] = useState(0);
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [bookCounts, setBookCounts] = useState({});

    useEffect(() => {
        loadCategories();
        loadBookCounts();
        // eslint-disable-next-line
    }, [current, pageSize, refreshTrigger]);

    const loadBookCounts = async () => {
        try {
            const res = await getBookCountByCategoryAPI();
            if (res?.data && Array.isArray(res.data)) {
                const countMap = {};
                res.data.forEach(item => {
                    countMap[item.categoryId] = item.bookCount;
                });
                setBookCounts(countMap);
            }
        } catch (error) {
            console.error('Error loading book counts:', error);
            message.error('Không thể tải số lượng sách theo danh mục');
        }
    };

    const loadCategories = async () => {
        setLoading(true);
        try {
            const res = await getAllCategoriesAPI({
                page: current - 1,
                size: pageSize
            });
            const apiData = res.data;
            if (apiData) {
                const categoriesData = Array.isArray(apiData.result)
                    ? apiData.result
                    : [];
                setCategories(categoriesData);
                setTotal(apiData.meta?.total || 0);
            } else {
                setCategories([]);
                setTotal(0);
            }
        } catch (error) {
            setCategories([]);
            setTotal(0);
            message.error(error?.response?.message || 'Lỗi khi tải danh sách danh mục');
        } finally {
            setLoading(false);
        }
    };

    const handleChangePage = (pagination) => {
        if (pagination && pagination.current && pagination.pageSize) {
            setCurrent(pagination.current);
            setPageSize(pagination.pageSize);
        }
    };

    const handleCreate = () => {
        setEditingCategory(null);
        form.resetFields();
        setModalVisible(true);
    };

    const handleEdit = (category) => {
        setEditingCategory(category);
        form.setFieldsValue({
            name: category.name,
            description: category.description
        });
        setModalVisible(true);
    };

    const handleDelete = async (categoryId) => {
        console.log('Deleting category with ID:', categoryId);
        console.log('Category type:', typeof categoryId);
        try {
            const res = await deleteCategoryAPI(categoryId);
            console.log('Delete category response:', res);
            if (res?.data?.success === true || res?.status === 200) {
                message.success('Xóa danh mục thành công');
                setRefreshTrigger(prev => prev + 1);
            }
        } catch (error) {
            console.error('Error deleting category:', error);
            console.error('Error response:', error?.response);
            message.error(error?.response?.data?.message || 'Lỗi khi xóa danh mục');
        }
    };

    const handleSubmit = async (values) => {
        try {
            if (editingCategory) {
                const res = await updateCategoryAPI(editingCategory.id, values);
                if (res.data && res.statusCode === 200) {
                    message.success('Cập nhật danh mục thành công');
                    setRefreshTrigger(prev => prev + 1);
                }
            } else {
                const res = await createCategoryAPI(values);
                if (res.data && res.statusCode === 201) {
                    message.success('Tạo danh mục thành công');
                    setRefreshTrigger(prev => prev + 1);
                }
            }
            setModalVisible(false);
        } catch (error) {
            console.error('Error saving category:', error);
            message.error(error?.response?.message || 'Lỗi khi lưu danh mục');
        }
    };

    const columns = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            render: (id) => {
                console.log('Rendering category ID:', id);
                return id;
            }
        },
        {
            title: 'Tên danh mục',
            dataIndex: 'name',
            key: 'name',
            sorter: true,
            render: (text, record) => (
                <Link to={`/categories/${record.id}`} state={{ category: record }}>
                    {text}
                </Link>
            )
        },
        {
            title: 'Mô tả',
            dataIndex: 'description',
            key: 'description',
            ellipsis: true
        },
        {
            title: 'Số lượng sách',
            key: 'bookCount',
            align: 'center',
            render: (_, record) => {
                const count = bookCounts[record.id] ?? 0;
                return <Tag color="blue">{count} sách</Tag>;
            }
        }
    ];

    if (isAdmin) {
        columns.push(
            {
                title: 'Ngày tạo',
                dataIndex: 'createdAt',
                key: 'createdAt',
                render: (text) => text ? new Date(text).toLocaleDateString('vi-VN') : '-'
            },
            {
                title: 'Ngày cập nhật',
                dataIndex: 'updatedAt',
                key: 'updatedAt',
                render: (text) => text ? new Date(text).toLocaleDateString('vi-VN') : '-'
            }
        );
    }

    if (isAdmin) {
        columns.push({
            title: 'Thao tác',
            key: 'action',
            render: (_, record) => (
                <Space size="middle">
                    {isAdmin && (
                        <>
                            <Button
                                type="primary"
                                icon={<EditOutlined />}
                                onClick={() => handleEdit(record)}
                            >
                                Sửa
                            </Button>
                            <Popconfirm
                                title="Xóa danh mục"
                                description="Bạn có chắc chắn muốn xóa danh mục này?"
                                onConfirm={() => {
                                    console.log('Confirm delete category:', record);
                                    console.log('Category ID to delete:', record.id);
                                    handleDelete(record.id);
                                }}
                                okText="Xóa"
                                cancelText="Hủy"
                            >
                                <Button
                                    danger
                                    icon={<DeleteOutlined />}
                                >
                                    Xóa
                                </Button>
                            </Popconfirm>
                        </>
                    )}
                </Space>
            ),
        });
    }

    return (
        <div style={{ padding: '24px' }}>
            <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
                <Input.Search
                    placeholder="Tìm kiếm danh mục..."
                    allowClear
                    enterButton={<SearchOutlined />}
                    disabled
                    style={{ width: 300 }}
                />
                {isAdmin && (
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={handleCreate}
                    >
                        Thêm danh mục
                    </Button>
                )}
            </div>

            <Table
                columns={columns}
                dataSource={categories}
                rowKey="id"
                loading={loading}
                pagination={{
                    current,
                    pageSize,
                    total,
                    showSizeChanger: true,
                    showTotal: (total, range) => `${range[0]}-${range[1]} trong ${total} danh mục`,
                }}
                onChange={handleChangePage}
            />

            <Modal
                title={editingCategory ? 'Sửa danh mục' : 'Thêm danh mục mới'}
                open={modalVisible}
                onCancel={() => setModalVisible(false)}
                footer={null}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                >
                    <Form.Item
                        name="name"
                        label="Tên danh mục"
                        rules={[
                            { required: true, message: 'Vui lòng nhập tên danh mục' },
                            { min: 2, max: 100, message: 'Tên danh mục phải từ 2-100 ký tự' }
                        ]}
                    >
                        <Input placeholder="Nhập tên danh mục" />
                    </Form.Item>

                    <Form.Item
                        name="description"
                        label="Mô tả"
                        rules={[
                            { max: 500, message: 'Mô tả không được vượt quá 500 ký tự' }
                        ]}
                    >
                        <TextArea
                            placeholder="Nhập mô tả danh mục"
                            autoSize={{ minRows: 3, maxRows: 6 }}
                        />
                    </Form.Item>

                    <Form.Item>
                        <Space>
                            <Button type="primary" htmlType="submit">
                                {editingCategory ? 'Cập nhật' : 'Thêm mới'}
                            </Button>
                            <Button onClick={() => setModalVisible(false)}>
                                Hủy
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default CategoryList; 