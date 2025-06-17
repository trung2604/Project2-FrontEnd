import React, { useState, useEffect } from 'react';
import { Form, Rate, Input, Button, message, Space } from 'antd';
import { createReviewAPI, updateReviewAPI, getUserOrdersAPI } from '../../services/api-service';
import { CheckCircleOutlined } from '@ant-design/icons';

const { TextArea } = Input;

const ReviewForm = ({ bookId, existingReview, onSubmit, onCancel }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [rating, setRating] = useState(existingReview?.rating || 0);

    useEffect(() => {
        if (existingReview) {
            form.setFieldsValue({
                rating: existingReview.rating,
                comment: existingReview.comment
            });
            setRating(existingReview.rating);
        } else {
            form.resetFields();
            setRating(0);
        }
    }, [existingReview, form]);

    const findOrderIdForBook = async (bookId) => {
        try {
            const response = await getUserOrdersAPI({ page: 0, size: 100 });
            if (response.success && response.data) {
                const orders = response.data.result || response.data.content || [];
                for (const order of orders) {
                    if (order.status === 'DELIVERED') {
                        const items = order.items || order.orderItems || [];
                        if (Array.isArray(items)) {
                            const foundItem = items.find(item => {
                                const itemBookId = item.bookId || (item.book && item.book.id);
                                return String(itemBookId) === String(bookId);
                            });
                            if (foundItem) {
                                return order.id;
                            }
                        }
                    }
                }
            }
        } catch (error) {
            console.error('Error finding order for book:', error);
        }
        return null;
    };

    const handleSubmit = async (values) => {
        if (!rating || rating === 0) {
            message.destroy();
            message.error('Vui lòng chọn số sao đánh giá');
            return;
        }

        setLoading(true);
        try {
            const reviewData = {
                bookId: bookId,
                rating: rating,
                comment: values.comment.trim()
            };

            let response;
            if (existingReview) {
                reviewData.orderId = existingReview.orderId;
                response = await updateReviewAPI(existingReview.id, reviewData);
            } else {
                const orderId = await findOrderIdForBook(bookId);
                if (!orderId) {
                    message.destroy();
                    message.error('Không tìm thấy đơn hàng đã giao cho sách này');
                    return;
                }
                reviewData.orderId = orderId;
                response = await createReviewAPI(reviewData);
            }

            if (response.success) {
                message.destroy();
                message.success(existingReview ? 'Cập nhật đánh giá thành công!' : 'Gửi đánh giá thành công!');
                onSubmit();
            } else {
                message.destroy();
                message.error(response.message || 'Có lỗi xảy ra');
            }
        } catch (error) {
            message.destroy();
            message.error(error.response?.data?.message || 'Có lỗi xảy ra khi gửi đánh giá');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        form.resetFields();
        setRating(0);
        onCancel();
    };

    const handleRateChange = (value) => {
        setRating(value);
        form.setFieldsValue({ rating: value });
    };

    return (
        <div className="review-form">
            <div style={{ marginBottom: 16, padding: 12, background: '#f6ffed', border: '1px solid #b7eb8f', borderRadius: 6 }}>
                <CheckCircleOutlined style={{ color: '#52c41a', marginRight: 8 }} />
                <span style={{ color: '#52c41a', fontWeight: 500 }}>
                    Đây là đánh giá từ người đã mua sách
                </span>
            </div>

            <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
            >
                <Form.Item
                    label="Đánh giá của bạn"
                    name="rating"
                    rules={[{ required: true, message: 'Vui lòng chọn số sao đánh giá' }]}
                >
                    <div>
                        <Rate
                            value={rating}
                            onChange={handleRateChange}
                            style={{ fontSize: 24 }}
                        />
                        <span style={{ marginLeft: 8, color: '#666' }}>
                            {rating > 0 ? `${rating} sao` : 'Chưa chọn'}
                        </span>
                    </div>
                </Form.Item>

                <Form.Item
                    label="Nhận xét"
                    name="comment"
                    rules={[
                        { required: true, message: 'Vui lòng viết nhận xét' },
                        { min: 10, message: 'Nhận xét phải có ít nhất 10 ký tự' },
                        { max: 1000, message: 'Nhận xét không được quá 1000 ký tự' }
                    ]}
                >
                    <TextArea
                        rows={4}
                        placeholder="Chia sẻ trải nghiệm của bạn về cuốn sách này..."
                        maxLength={1000}
                        showCount
                    />
                </Form.Item>

                <div className="review-form-actions">
                    <Space>
                        <Button onClick={handleCancel}>
                            Hủy
                        </Button>
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={loading}
                        >
                            {existingReview ? 'Cập nhật' : 'Gửi đánh giá'}
                        </Button>
                    </Space>
                </div>
            </Form>
        </div>
    );
};

export default ReviewForm; 