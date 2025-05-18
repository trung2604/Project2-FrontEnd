import { Button, Col, Form, Input, Row, notification } from "antd";
import { LoginOutlined, UserOutlined, LockOutlined } from "@ant-design/icons";
import { useNavigate, Link } from "react-router-dom";
import "../components/user/user-form.css";
import { loginAPI } from "../services/api-service";
const LoginPage = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const onFinish = async (values) => {
    try {
      const response = await loginAPI(
        values.email,
        values.password
      );
      console.log(response);
      if (response.data) {
        notification.success({
          message: "Login",
          description: "Login successfully"
        });
        navigate("/");
      } else {
        notification.error({
          message: "Login",
          description: error.response.data.message || "Login failed"
        });
      }
    } catch (error) {
      notification.error({
        message: "Login",
        description: error.response.data.message || "Login failed"
      });
      console.log(error.response.data.message);
    }
  };

  return (
    <div className="login-page">
      <Form
        layout="vertical"
        form={form}
        onFinish={onFinish}
        className="user-form"
      >
        <div className="web-title">Book Store</div>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          {/* <img src={logo} alt="Logo" style={{ width: 60, marginBottom: 8 }} /> */}
          <div className="user-form-title" style={{ marginBottom: 8 }}>Đăng nhập</div>
          <div style={{ color: "#888", marginBottom: 20, fontSize: 15 }}>
            Chào mừng bạn quay trở lại!
          </div>
        </div>
        <Row gutter={[0, 16]}>
          <Col xs={24} md={24}>
            <Form.Item
              label="Email"
              name="email"
              rules={[
                { required: true, message: 'Vui lòng nhập email!' },
                { type: 'email', message: 'Email không hợp lệ!' }
              ]}
            >
              <Input placeholder="Nhập email" prefix={<UserOutlined />} />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={[0, 16]}>
          <Col xs={24} md={24}>
            <Form.Item
              label="Password"
              name="password"
              rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
            >
              <Input.Password placeholder="Nhập mật khẩu" prefix={<LockOutlined />} />
            </Form.Item>
          </Col>
        </Row>
        <div className="form-actions">
          <Button
            type="primary"
            htmlType="submit"
            icon={<LoginOutlined />}
            size="large"
          >
            Đăng nhập
          </Button>
        </div>
        <div style={{ textAlign: "center", marginTop: 18 }}>
          <span style={{ color: "#888" }}>Chưa có tài khoản? </span>
          <Link to="/register" style={{ fontWeight: 500 }}>
            Đăng ký <UserOutlined />
          </Link>
        </div>
      </Form>
    </div>
  );
};

export default LoginPage;

