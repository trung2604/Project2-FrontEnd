import { Button, Form, Input, InputNumber, Modal, notification, Select } from "antd";
import { useEffect, useState } from "react";
import { addBookAPI, updateBookAPI, updateBookImageAPI } from "../../services/api-service";

const { Option } = Select;

const BookForm = ({ isModalOpen, setIsModalOpen, bookData, setBookData, loadBooks }) => {
    const [form] = Form.useForm();
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (bookData && isModalOpen) {
            form.setFieldsValue({
                id: bookData.id,
                title: bookData.mainText,
                author: bookData.author,
                price: bookData.price,
                sold: bookData.sold,
                quantity: bookData.quantity,
                category: bookData.category,
                image: bookData.image
            });
            setPreview(bookData.image?.thumbnail || null);
        } else {
            form.resetFields();
            setPreview(null);
        }
        setFile(null);
    }, [bookData, isModalOpen, form]);

    const handleModalClose = () => {
        form.resetFields();
        setIsModalOpen(false);
        setBookData(null);
        setFile(null);
        setPreview(null);
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

    const onFinish = async (values) => {
        setLoading(true);
        try {
            if (!bookData) {
                const book = {
                    title: values.title,
                    author: values.author,
                    price: values.price,
                    sold: values.sold || 0,
                    quantity: values.quantity,
                    category: values.category,
                    file: file
                };
                const response = await addBookAPI(book);
                if (response.data && response.statusCode === 201) {
                    notification.success({ message: "Thành công", description: "Thêm sách thành công!" });
                    await loadBooks();
                } else {
                    notification.error({ message: "Thất bại", description: "Thêm sách thất bại!" });
                }
                handleModalClose();
                return;
            }
            const book = {
                id: values.id,
                title: values.title,
                author: values.author,
                price: values.price,
                sold: values.sold || 0,
                quantity: values.quantity,
                category: values.category,
                file: file
            };
            const response = await updateBookAPI(book);
            if (response.data && response.statusCode === 200) {
                notification.success({ message: "Thành công", description: "Cập nhật sách thành công!" });
                await loadBooks();
                handleModalClose();
            } else {
                notification.error({ message: "Thất bại", description: "Cập nhật sách thất bại!" });
            }
        } catch (error) {
            notification.error({
                message: bookData ? "Cập nhật sách thất bại" : "Thêm sách thất bại",
                description: error?.response?.data?.message || error?.message || "Đã xảy ra lỗi!"
            });
            handleModalClose();
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            title={bookData ? "Update Book" : "Create Book"}
            open={isModalOpen}
            onCancel={handleModalClose}
            footer={null}
            destroyOnHidden
            width={600}
            confirmLoading={loading}
        >
            <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
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
                        mode="multiple"
                        placeholder="Chọn thể loại"
                        allowClear
                    >
                        <Option value="Sport">Sport</Option>
                        <Option value="Science">Science</Option>
                        <Option value="Novel">Novel</Option>
                        <Option value="History">History</Option>
                        <Option value="Children">Children</Option>
                        <Option value="Education">Education</Option>
                        {/* Thêm các thể loại khác nếu cần */}
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
                        Cancel
                    </Button>
                    <Button type="primary" htmlType="submit" loading={loading}>
                        {bookData ? "Update" : "Create"}
                    </Button>
                </div>
            </Form>
        </Modal>
    );
};

export default BookForm; 