import { Button, Form, Input, Modal, notification, Select } from "antd";
import "./user-form.css";
import { useEffect } from "react";
import { createUserAPI, updateUserAPI } from "../../services/api-service";

const { Option } = Select;

const UserForm = ({ isModalOpen, setIsModalOpen, userData, loadUser }) => {
    const [form] = Form.useForm();

    // Reset form when modal opens/closes
    const handleModalClose = () => {
        form.setFieldsValue({
            fullName: '',
            email: '',
            password: '',
            phone: '',
            role: 'USER',
            active: true
        });
        setIsModalOpen(false);
    };

    // Set form values when userData changes
    useEffect(() => {
        if (userData && isModalOpen) {
            form.setFieldsValue({
                fullName: userData.fullName,
                email: userData.email,
                phone: userData.phone,
                role: userData.role,
                active: userData.active
            });
        }
    }, [userData, isModalOpen, form]);

    const onFinish = async (values) => {
        try {
            let response;
            if (userData) {
                // Update user
                const updateData = {
                    ...values,
                    id: userData.id
                };
                response = await updateUserAPI(userData.id, updateData);
                if (response.status === 200) {
                    notification.success({
                        message: "Update User",
                        description: "User updated successfully"
                    });
                }
            } else {
                // Create user
                response = await createUserAPI(
                    values.fullName,
                    values.email,
                    values.password,
                    values.phone,
                    values.role
                );
                if (response.status === 201) {
                    notification.success({
                        message: "Create User",
                        description: "User created successfully"
                    });
                }
            }
            handleModalClose();
            await loadUser();
        } catch (error) {
            notification.error({
                message: userData ? "Update User" : "Create User",
                description: error?.response?.data?.message || "Operation failed"
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
        <>
            <div className="user-form-header">
                <h3>User Management</h3>
                <Button type="primary" onClick={() => setIsModalOpen(true)}>
                    Create User
                </Button>
            </div>

            <Modal
                title={userData ? "Update User" : "Create User"}
                open={isModalOpen}
                onCancel={handleModalClose}
                footer={null}
                destroyOnHide={true}
                width={600}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={onFinish}
                    initialValues={{
                        role: "ROLE_USER",
                        active: true
                    }}
                    className="user-form"
                >
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
                        name="email"
                        label="Email"
                        rules={[
                            { required: true, message: "Please input your email!" },
                            { type: "email", message: "Please enter a valid email!" }
                        ]}
                    >
                        <Input placeholder="Enter email" />
                    </Form.Item>

                    {!userData && (
                        <Form.Item
                            name="password"
                            label="Password"
                            rules={[
                                { required: true, message: "Please input your password!" },
                                { min: 6, message: "Password must be at least 6 characters" }
                            ]}
                        >
                            <Input.Password placeholder="Enter password" />
                        </Form.Item>
                    )}

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

                    <Form.Item
                        name="role"
                        label="Role"
                        rules={[{ required: true, message: "Please select a role!" }]}
                    >
                        <Select placeholder="Select role">
                            <Option value="ROLE_USER">User</Option>
                            <Option value="ROLE_ADMIN">ROLE_ADMIN</Option>
                            <Option value="ROLE_SHIPPER">ROLE_SHIPPER</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="active"
                        label="Status"
                        rules={[{ required: true, message: "Please select status!" }]}
                    >
                        <Select placeholder="Select status">
                            <Option value={true}>Active</Option>
                            <Option value={false}>Inactive</Option>
                        </Select>
                    </Form.Item>

                    <div className="form-actions">
                        <Button onClick={handleModalClose} type="default" size="large">
                            Cancel
                        </Button>
                        <Button type="primary" onClick={handleSubmit} size="large">
                            {userData ? "Update" : "Create"}
                        </Button>
                    </div>
                </Form>
            </Modal>
        </>
    );
};

export default UserForm;
