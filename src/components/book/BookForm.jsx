import { Button, Form, Input, InputNumber, Modal, notification, Select } from "antd";
import { useEffect, useState } from "react";
import { addBookAPI, updateBookAPI, updateBookImageAPI, getAllCategoriesAPI, createCategoryAPI } from "../../services/api-service";
import { PlusOutlined } from "@ant-design/icons";

const { Option } = Select;

const BookForm = ({ isModalOpen, setIsModalOpen, bookData, setBookData, onSuccess, setRefreshTrigger, loadBooks }) => {
    const [form] = Form.useForm();
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState([]);
    const [newCategories, setNewCategories] = useState([]);

    useEffect(() => {
        if (isModalOpen) {
            loadCategories();
            if (bookData) {
                form.setFieldsValue({
                    ...bookData,
                    categoryId: bookData.categoryId || bookData.category?.id
                });
            } else {
                form.resetFields();
            }
        }
        if (isModalOpen && bookData) {
            setPreview(bookData.image?.medium || bookData.image?.original || bookData.image?.thumbnail);
        } else if (!isModalOpen) {
            form.resetFields();
            setPreview(null);
        }
    }, [isModalOpen, bookData, form]);

    const loadCategories = async () => {
        try {
            const response = await getAllCategoriesAPI({ size: 100 });
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
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            // Kiểm tra loại file
            if (!selectedFile.type.startsWith('image/')) {
                notification.error({
                    message: "Lỗi",
                    description: "Vui lòng chọn file ảnh!"
                });
                return;
            }
            // Kiểm tra kích thước file (ví dụ: max 5MB)
            if (selectedFile.size > 5 * 1024 * 1024) {
                notification.error({
                    message: "Lỗi",
                    description: "Kích thước file không được vượt quá 5MB!"
                });
                return;
            }
            setFile(selectedFile);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result);
            };
            reader.readAsDataURL(selectedFile);
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
            // Debug logging
            console.log('onFinish called with values:', values);
            console.log('Current bookData:', bookData);

            // Lấy id thể loại từ values.category (là mảng id)
            const categoryId = Array.isArray(values.category) ? values.category[0] : values.category;
            // Tìm object thể loại tương ứng
            const selectedCategory = categories.find(cat => cat.id === categoryId);

            // Tạo dữ liệu sách để gửi lên server, chỉ lấy trường có giá trị
            const newBookData = {};
            if (values.title) newBookData.mainText = values.title;
            if (values.author) newBookData.author = values.author;
            if (values.price !== undefined) newBookData.price = values.price;
            if (values.quantity !== undefined) newBookData.quantity = values.quantity;
            if (values.sold !== undefined) newBookData.sold = values.sold;
            if (selectedCategory && selectedCategory.name) newBookData.categoryName = selectedCategory.name;

            // Log dữ liệu gửi lên để debug
            console.log('Preparing to save book with data:', {
                isUpdate: !!bookData?.id,
                bookId: bookData?.id,
                newBookData,
                file
            });

            let response;
            if (bookData && bookData.id) {
                // Update sách
                response = await updateBookAPI(
                    bookData.id,
                    newBookData,
                    file
                );
            } else {
                // Thêm sách mới
                response = await addBookAPI({
                    ...newBookData,
                    file: file
                });
            }

            if (response?.success) {
                notification.success({
                    message: bookData?.id ? "Cập nhật sách" : "Thêm sách",
                    description: response.message || "Thao tác thành công"
                });
                handleModalClose();
                if (onSuccess) onSuccess();
                if (setRefreshTrigger) setRefreshTrigger(prev => prev + 1);
                if (loadBooks) await loadBooks();
            } else {
                notification.error({
                    message: "Lỗi",
                    description: response?.message || "Thao tác thất bại"
                });
            }
        } catch (error) {
            console.error('Error saving book:', error);
            notification.error({
                message: "Lỗi",
                description: error?.message || "Failed to save book"
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

    const handleEdit = (book) => {
        console.log('Editing book:', book);
        setIsModalOpen(true);
        const editBookData = {
            id: book.id,
            mainText: book.mainText,
            author: book.author,
            price: book.price,
            sold: book.sold,
            quantity: book.quantity,
            category: book.category,
            image: book.image
        };
        console.log('Setting bookData for edit:', editBookData);
        setBookData(editBookData);
    };

    return (
        <Modal
            title={bookData ? "Chỉnh sửa sách" : "Thêm sách mới"}
            open={isModalOpen}
            onCancel={handleModalClose}
            footer={null}
            width={800}
            destroyOnHidden
        >
            <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
                initialValues={bookData || {}}
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
                    rules={[{ required: true, message: "Vui lòng chọn thể loại!" }]}
                >
                    <Select
                        placeholder="Chọn thể loại"
                        loading={loading}
                        disabled={loading}
                        showSearch
                        optionFilterProp="children"
                        filterOption={(input, option) =>
                            (option?.children ?? '').toLowerCase().includes(input.toLowerCase())
                        }
                    >
                        {categories.map(cat => (
                            <Option key={cat.id} value={cat.id}>
                                {cat.name}
                            </Option>
                        ))}
                    </Select>
                </Form.Item>
                <Form.Item
                    name="image"
                    label="Ảnh sách"
                    valuePropName="fileList"
                    getValueFromEvent={(e) => {
                        if (Array.isArray(e)) {
                            return e;
                        }
                        return e?.fileList;
                    }}
                >
                    <Input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        style={{ display: 'none' }}
                        id="image-upload"
                    />
                    <label htmlFor="image-upload" style={{ cursor: 'pointer' }}>
                        <div style={{
                            border: '1px dashed #d9d9d9',
                            borderRadius: '8px',
                            padding: '20px',
                            textAlign: 'center',
                            background: preview ? 'none' : '#fafafa'
                        }}>
                            {preview ? (
                                <img
                                    src={preview}
                                    alt="Preview"
                                    style={{
                                        maxWidth: '100%',
                                        maxHeight: '200px',
                                        objectFit: 'contain'
                                    }}
                                />
                            ) : (
                                <div>
                                    <PlusOutlined style={{ fontSize: '24px', color: '#999' }} />
                                    <div style={{ marginTop: '8px', color: '#666' }}>Click để chọn ảnh</div>
                                </div>
                            )}
                        </div>
                    </label>
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