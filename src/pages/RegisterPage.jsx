import { Button, Col, Form, Input, notification, Row } from "antd";
import { UserAddOutlined, LoginOutlined } from "@ant-design/icons";
import { registerAPI } from "../services/api-service";
import { useNavigate, Link } from "react-router-dom";
// import logo from "../assets/logo.png"; // Bỏ comment nếu có logo
import "../components/user/user-form.css";

const RegisterPage = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const onFinish = async (values) => {
    try {
      const response = await registerAPI(
        values.fullName,
        values.email,
        values.password,
        values.phoneNumber
      );
      if (response.data && response.success === true) {
        notification.success({
          message: "Register",
          description: "Register successfully"
        });
        navigate("/login");
      } else {
        notification.error({
          message: "Register",
          description: error.response.data.message || "Register failed"
        });
      }
    } catch (error) {
      notification.error({
        message: "Register",
        description: error.response.data.message || "Register failed"
      });
      console.log(error.response.data.message);
    }
  };

  return (
    <div className="register-page">
      <Form
        layout="vertical"
        form={form}
        onFinish={onFinish}
        className="user-form"
      >
        <div className="web-title">Book Store</div>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          {/* <img src={logo} alt="Logo" style={{ width: 60, marginBottom: 8 }} /> */}
          <div className="user-form-title" style={{ marginBottom: 8 }}>Đăng ký tài khoản</div>
          <div style={{ color: "#888", marginBottom: 20, fontSize: 15 }}>
            Tạo tài khoản để trải nghiệm dịch vụ tốt nhất!
          </div>
        </div>
        <Row gutter={[0, 16]}>
          <Col xs={24} md={24}>
            <Form.Item
              label="Full Name"
              name="fullName"
              rules={[{ required: true, message: 'Please input your full name!' }]}
            >
              <Input placeholder="Nhập họ tên" />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={[0, 16]}>
          <Col xs={24} md={24}>
            <Form.Item
              label="Email"
              name="email"
              rules={[
                { required: true, message: 'Please input your email!' },
                { type: 'email', message: 'Please enter a valid email!' }
              ]}
            >
              <Input placeholder="Nhập email" />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={[0, 16]}>
          <Col xs={24} md={24}>
            <Form.Item
              label="Password"
              name="password"
              rules={[
                { required: true, message: 'Please input your password!' },
                { min: 6, message: 'Password must be at least 6 characters' }
              ]}
              extra={<div className="password-hint">Tối thiểu 6 ký tự</div>}
            >
              <Input.Password placeholder="Nhập mật khẩu" />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={[0, 16]}>
          <Col xs={24} md={24}>
            <Form.Item
              label="Phone Number"
              name="phoneNumber"
              rules={[
                {
                  required: true,
                  pattern: /^[0-9]{10}$/,
                  message: 'Please input a valid 10-digit phone number!'
                }
              ]}
            >
              <Input placeholder="Nhập số điện thoại" />
            </Form.Item>
          </Col>
        </Row>
        <div className="form-actions" style={{ justifyContent: 'center', marginTop: 32 }}>
          <Button
            type="primary"
            htmlType="submit"
            icon={<UserAddOutlined />}
            style={{ fontWeight: 600, fontSize: 16, minWidth: 180 }}
            block
          >
            Đăng ký
          </Button>
        </div>
        <div style={{ textAlign: "center", marginTop: 18 }}>
          <span style={{ color: "#888" }}>Đã có tài khoản? </span>
          <Link to="/login" style={{ fontWeight: 500 }}>
            Đăng nhập <LoginOutlined />
          </Link>
        </div>
      </Form>
    </div>
  );
};

export default RegisterPage;


