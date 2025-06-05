import { Button, Form, Input, InputNumber, Modal, notification, Select } from "antd";
import { useEffect, useState } from "react";
import { addBookAPI, updateBookAPI, updateBookImageAPI, getAllCategoriesAPI, createCategoryAPI } from "../../services/api-service";

const { Option } = Select;

const BookForm = ({ isModalOpen, setIsModalOpen, bookData, onSuccess, setRefreshTrigger }) => {
    const [form] = Form.useForm();
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState([]);
    const [newCategories, setNewCategories] = useState([]);

    useEffect(() => {
        loadCategories();
        if (isModalOpen) {
            if (bookData) {
                form.setFieldsValue({
                    id: bookData.id,
                    title: bookData.mainText,
                    author: bookData.author,
                    price: bookData.price,
                    quantity: bookData.quantity,
                    category: bookData.category ? [bookData.category] : []
                });
                setPreview(bookData.image?.medium || bookData.image?.original || bookData.image?.thumbnail);
            } else {
                form.resetFields();
                setPreview(null);
            }
        }
    }, [isModalOpen, bookData, form]);

    const loadCategories = async () => {
        try {
            const response = await getAllCategoriesAPI();
            if (response?.data) {
                const categoriesData = Array.isArray(response.data)
                    ? response.data
                    : Array.isArray(response.data.result)
                        ? response.data.result
                        : [];

                const validCategories = categoriesData
                    .filter(cat => cat && cat.id && cat.name)
                    .map(cat => ({
                        id: cat.id,
                        name: cat.name,
                        description: cat.description || ''
                    }));

                setCategories(validCategories);
            } else {
                setCategories([]);
                console.warn('No categories data received from API');
            }
        } catch (error) {
            console.error("Error loading categories:", error);
            setCategories([]);
            notification.error({
                message: "Lỗi",
                description: "Không thể tải danh sách thể loại. Vui lòng thử lại."
            });
        }
    };

    const handleModalClose = () => {
        form.resetFields();
        setIsModalOpen(false);
        setFile(null);
        setPreview(null);
        setNewCategories([]);
    };

    const handleFileChange = (e) => {
        const f = e.target.files[0];
        setFile(f);
        if (f) {
            setPreview(URL.createObjectURL(f));
        } else {
            setPreview(null);
        }
    };

    const handleCategoryChange = (value) => {
        const newCats = value.filter(cat => {
            if (typeof cat === 'string' && !categories.some(c => c.name.toLowerCase() === cat.toLowerCase())) {
                return true;
            }
            return false;
        });
        setNewCategories(newCats);
    };

    const createNewCategories = async (categoryNames) => {
        const createdCategories = [];
        for (const name of categoryNames) {
            try {
                const response = await createCategoryAPI({
                    name: String(name).trim(),
                    description: `Danh mục ${String(name).trim()}`
                });
                if (response?.data) {
                    createdCategories.push({
                        id: response.data.id,
                        name: response.data.name
                    });
                }
            } catch (error) {
                console.error(`Error creating category ${name}:`, error);
                notification.error({
                    message: "Lỗi",
                    description: `Không thể tạo danh mục "${name}". Vui lòng thử lại.`
                });
            }
        }
        return createdCategories;
    };

    const onFinish = async (values) => {
        setLoading(true);
        try {
            console.log('Starting form submission with values:', values);
            console.log('Current bookData from props:', bookData);

            let categoryId = '';
            if (values.category && values.category.length > 0) {
                const firstCategory = values.category[0];
                console.log('Selected category:', firstCategory);
                console.log('Category type:', typeof firstCategory);

                if (typeof firstCategory === 'string' && !firstCategory.includes('-')) {
                    // Nếu là category mới, tạo category trước
                    try {
                        console.log('Creating new category:', firstCategory.trim());
                        const categoryResponse = await createCategoryAPI(firstCategory.trim());
                        console.log('Category creation response:', categoryResponse);
                        if (categoryResponse?.data) {
                            categoryId = categoryResponse.data.id;
                            console.log('New category created with id:', categoryId);
                        }
                    } catch (error) {
                        console.error('Error creating category:', error);
                        notification.error({
                            message: "Lỗi",
                            description: "Không thể tạo thể loại mới. Vui lòng thử lại."
                        });
                        return;
                    }
                } else {
                    // Nếu là UUID hoặc object, sử dụng trực tiếp
                    categoryId = typeof firstCategory === 'object' ? firstCategory.id : firstCategory;
                    console.log('Using existing category id:', categoryId);
                }
            }

            if (!categoryId) {
                notification.error({
                    message: "Lỗi",
                    description: "Vui lòng chọn hoặc nhập ít nhất một thể loại!"
                });
                return;
            }

            // Tạo book data theo đúng format API yêu cầu
            const newBookData = {
                id: values.id || bookData?.id,
                mainText: values.title,
                author: values.author,
                price: values.price,
                sold: values.sold || 0,
                quantity: values.quantity,
                categoryId: categoryId
            };

            console.log('Final book data to submit:', newBookData);
            console.log('Is this an update?', !!newBookData.id);

            let response;
            // Kiểm tra xem có phải đang edit sách không
            if (newBookData.id) {
                // Update sách
                console.log('Updating book with id:', newBookData.id);
                response = await handleUpdateBook(newBookData, file);
            } else {
                // Thêm sách mới
                console.log('Adding new book');
                response = await handleAddBook(newBookData, file);
            }

            console.log('API Response:', response);

            if (response?.data && (response.statusCode === 200 || response.statusCode === 201)) {
                notification.success({
                    message: "Thành công",
                    description: newBookData.id ? "Cập nhật sách thành công!" : "Thêm sách thành công!"
                });
                if (typeof setRefreshTrigger === 'function') {
                    setRefreshTrigger(prev => prev + 1);
                } else if (typeof onSuccess === 'function') {
                    onSuccess();
                }
                handleModalClose();
            } else {
                notification.error({
                    message: "Thất bại",
                    description: response?.data?.message || (newBookData.id ? "Cập nhật sách thất bại!" : "Thêm sách thất bại!")
                });
            }
        } catch (error) {
            console.error('Error saving book:', error);
            notification.error({
                message: newBookData.id ? "Cập nhật sách thất bại" : "Thêm sách thất bại",
                description: error?.response?.data?.message || error?.message || "Đã xảy ra lỗi!"
            });
        } finally {
            setLoading(false);
        }
    };

    // Hàm xử lý thêm sách mới
    const handleAddBook = async (bookData, file) => {
        console.log('handleAddBook called with:', { bookData, file });
        return await addBookAPI(bookData, file);
    };

    // Hàm xử lý cập nhật sách
    const handleUpdateBook = async (bookData, file) => {
        console.log('handleUpdateBook called with:', { bookData, file });
        if (!bookData.id) {
            throw new Error("Không tìm thấy ID của sách cần cập nhật");
        }
        return await updateBookAPI(bookData.id, bookData, file);
    };

    return (
        <Modal
            title={bookData ? "Sửa sách" : "Thêm sách mới"}
            open={isModalOpen}
            onCancel={handleModalClose}
            footer={null}
            width={720}
        >
            <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
                initialValues={bookData ? {
                    title: bookData.mainText,
                    author: bookData.author,
                    price: bookData.price,
                    quantity: bookData.quantity,
                    category: bookData.category ? [bookData.category] : []
                } : undefined}
            >
                {bookData && (
                    <Form.Item name="id" label="ID">
                        <Input disabled />
                    </Form.Item>
                )}
                <Form.Item
                    name="title"
                    label="Tiêu đề"
                    rules={[{ required: true, message: "Vui lòng nhập tiêu đề sách!" }]}
                >
                    <Input />
                </Form.Item>
                <Form.Item
                    name="author"
                    label="Tác giả"
                    rules={[{ required: true, message: "Vui lòng nhập tên tác giả!" }]}
                >
                    <Input />
                </Form.Item>
                <Form.Item
                    name="price"
                    label="Giá tiền"
                    rules={[
                        { required: true, message: "Vui lòng nhập giá tiền!" },
                        {
                            validator: (_, value) => (value === undefined || value === null || value < 0)
                                ? Promise.reject("Giá tiền phải là số không âm!") : Promise.resolve()
                        }
                    ]}
                >
                    <InputNumber min={0} style={{ width: "100%" }} />
                </Form.Item>
                <Form.Item
                    name="sold"
                    label="Đã bán"
                    initialValue={0}
                    rules={[
                        {
                            validator: (_, value) => (value === undefined || value === null || value < 0)
                                ? Promise.reject("Số lượng đã bán phải là số không âm!") : Promise.resolve()
                        }
                    ]}
                >
                    <InputNumber min={0} style={{ width: "100%" }} />
                </Form.Item>
                <Form.Item
                    name="quantity"
                    label="Số lượng"
                    rules={[
                        { required: true, message: "Vui lòng nhập số lượng!" },
                        {
                            validator: (_, value) => (value === undefined || value === null || value < 0)
                                ? Promise.reject("Số lượng phải là số không âm!") : Promise.resolve()
                        }
                    ]}
                >
                    <InputNumber min={0} style={{ width: "100%" }} />
                </Form.Item>
                <Form.Item
                    name="category"
                    label="Thể loại"
                    rules={[{ required: true, message: "Vui lòng chọn hoặc nhập thể loại!" }]}
                    extra="Chọn một thể loại có sẵn hoặc nhập thể loại mới"
                >
                    <Select
                        mode="tags"
                        placeholder="Chọn thể loại có sẵn hoặc nhập thể loại mới"
                        allowClear
                        onChange={handleCategoryChange}
                        style={{ width: '100%' }}
                        loading={loading}
                        maxTagCount={1}
                        notFoundContent={loading ? "Đang tải..." : "Không tìm thấy thể loại"}
                        filterOption={(input, option) => {
                            const optionLabel = option?.label ?? '';
                            const optionValue = option?.value ?? '';
                            return (
                                optionLabel.toLowerCase().includes(input.toLowerCase()) ||
                                optionValue.toLowerCase().includes(input.toLowerCase())
                            );
                        }}
                        optionLabelProp="label"
                    >
                        {Array.isArray(categories) && categories.map(cat => (
                            <Option key={cat.id} value={cat.id} label={cat.name}>
                                {cat.name}
                            </Option>
                        ))}
                    </Select>
                </Form.Item>
                <Form.Item label="Ảnh sách">
                    <input type="file" accept="image/*" onChange={handleFileChange} />
                    {preview && (
                        <div style={{
                            marginTop: 12,
                            display: 'flex',
                            justifyContent: 'center'
                        }}>
                            <img
                                src={preview}
                                alt="Preview"
                                style={{
                                    width: 120,
                                    height: 120,
                                    borderRadius: 12,
                                    objectFit: 'cover',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
                                    border: '1.5px solid #e6e6e6',
                                    transition: 'box-shadow 0.2s',
                                }}
                            />
                        </div>
                    )}
                </Form.Item>
                <div style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    gap: 12,
                    marginTop: 24
                }}>
                    <Button onClick={handleModalClose} disabled={loading}>
                        Hủy
                    </Button>
                    <Button type="primary" htmlType="submit" loading={loading}>
                        {bookData ? "Cập nhật" : "Thêm mới"}
                    </Button>
                </div>
            </Form>
        </Modal>
    );
};

export default BookForm; 