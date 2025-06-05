import { Button, Form, Input, Modal, notification } from "antd";
import { useEffect } from "react";
import { updateUserAPI } from "../../services/api-service";
import "./user-form.css";

const UpdateUser = ({ isModalUpdateOpen, setIsModalUpdateOpen, dataUpdate, setDataUpdate, loadUser }) => {
    const [form] = Form.useForm();

    // Set form values when dataUpdate changes
    useEffect(() => {
        if (dataUpdate && isModalUpdateOpen) {
            form.setFieldsValue({
                id: dataUpdate.id,
                fullName: dataUpdate.fullName,
                phone: dataUpdate.phone
            });
        }
    }, [dataUpdate, isModalUpdateOpen, form]);

    const handleModalClose = () => {
        form.resetFields();
        setIsModalUpdateOpen(false);
        setDataUpdate(null);
    };

    const onFinish = async (values) => {
        try {
            const response = await updateUserAPI(values.id, values.fullName, values.phone);
            if (response?.success === true) {
                notification.success({
                    message: "Update User",
                    description: response?.message || "User updated successfully"
                });
                handleModalClose();
                await loadUser();
            }
        } catch (error) {
            notification.error({
                message: "Update User",
                description: error?.response?.data?.message || "Update failed"
            });
        }
    };

    // Handle form validation
    const validateForm = async () => {
        try {
            const values = await form.validateFields();
            return values;
        } catch (error) {
            return null;
        }
    };

    // Handle form submission
    const handleSubmit = async () => {
        const values = await validateForm();
        if (values) {
            onFinish(values);
        }
    };

    return (
        <Modal
            title="Update User"
            open={isModalUpdateOpen}
            onCancel={handleModalClose}
            footer={null}
            destroyOnHidden
            width={600}
        >
            <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
                className="user-form"
            >
                <Form.Item
                    name="id"
                    label="ID"
                >
                    <Input disabled />
                </Form.Item>

                <Form.Item
                    name="fullName"
                    label="Full Name"
                    rules={[
                        { required: true, message: "Please input your full name!" },
                        { min: 2, message: "Full name must be at least 2 characters" }
                    ]}
                >
                    <Input placeholder="Enter full name" />
                </Form.Item>

                <Form.Item
                    name="phone"
                    label="Phone Number"
                    rules={[
                        { required: true, message: "Please input your phone number!" },
                        { pattern: /^[0-9]{10}$/, message: "Please enter a valid 10-digit phone number" }
                    ]}
                >
                    <Input placeholder="Enter phone number" />
                </Form.Item>

                <div className="form-actions">
                    <Button onClick={handleModalClose}>
                        Cancel
                    </Button>
                    <Button type="primary" onClick={handleSubmit}>
                        Update
                    </Button>
                </div>
            </Form>
        </Modal>
    );
};

export default UpdateUser;