import React, { useState, useEffect, useContext } from 'react';
import { Table, Button, Space, Modal, Form, Input, message, Popconfirm } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { getAllCategoriesAPI, createCategoryAPI, updateCategoryAPI, deleteCategoryAPI } from '../../services/api-service';
import { AuthContext } from '../context/auth-context';
import { useNavigate } from 'react-router-dom';

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

    useEffect(() => {
        loadCategories();
        // eslint-disable-next-line
    }, [current, pageSize, refreshTrigger]);

    const loadCategories = async () => {
        setLoading(true);
        try {
            const res = await getAllCategoriesAPI({
                page: current - 1,
                size: pageSize
            });
            console.log('Full API response:', res);
            console.log('res.data:', res.data);
            console.log('res.data.result:', res.data.result);
            if (res && res.data && Array.isArray(res.data.result)) {
                setCategories(res.data.result);
                setTotal(res.data.totalElements || 0);
                console.log('Set categories:', res.data.result);
            } else {
                setCategories([]);
                setTotal(0);
                console.log('Set categories: [] (fallback)');
            }
        } catch (error) {
            console.error('Error loading categories:', error);
            message.error(error?.response?.message || 'Lỗi khi tải danh sách danh mục');
        } finally {
            setLoading(false);
        }
    };

    const handleChangePage = (pagination) => {
        if (pagination && pagination.current && pagination.pageSize) {
            if (+pagination.current !== +current) setCurrent(+pagination.current);
            if (+pagination.pageSize !== +pageSize) setPageSize(+pagination.pageSize);
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
        try {
            const res = await deleteCategoryAPI(categoryId);
            if (res?.statusCode === 200) {
                message.success('Xóa danh mục thành công');
                setRefreshTrigger(prev => prev + 1);
            }
        } catch (error) {
            console.error('Error deleting category:', error);
            message.error(error?.response?.message || 'Lỗi khi xóa danh mục');
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
            title: 'Tên danh mục',
            dataIndex: 'name',
            key: 'name',
            sorter: true
        },
        {
            title: 'Mô tả',
            dataIndex: 'description',
            key: 'description',
            ellipsis: true
        },
        {
            title: 'Ngày tạo',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (text) => new Date(text).toLocaleDateString('vi-VN')
        },
        {
            title: 'Ngày cập nhật',
            dataIndex: 'updatedAt',
            key: 'updatedAt',
            render: (text) => new Date(text).toLocaleDateString('vi-VN')
        },
        {
            title: 'Thao tác',
            key: 'action',
            render: (_, record) => (
                isAdmin && (
                    <Space size="middle">
                        <Button
                            type="primary"
                            icon={<EditOutlined />}
                            onClick={() => handleEdit(record)}
                        >
                            Sửa
                        </Button>
                        <Popconfirm
                            title="Bạn có chắc chắn muốn xóa danh mục này?"
                            onConfirm={() => handleDelete(record.id)}
                            okText="Xóa"
                            cancelText="Hủy"
                        >
                            <Button danger icon={<DeleteOutlined />}>
                                Xóa
                            </Button>
                        </Popconfirm>
                    </Space>
                )
            )
        }
    ];

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