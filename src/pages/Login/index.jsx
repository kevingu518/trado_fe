import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, Divider, message, Checkbox } from 'antd';
import { MailOutlined, LockOutlined, EyeInvisibleOutlined, EyeTwoTone } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { login } from '@/api/api_user';
import to from 'await-to-js';
import { useDispatch } from 'react-redux';
const { Title, Text } = Typography;
import { loginSuccess } from '@/store/authSlice';

const Login = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      // 這裡添加登入 API 調用
      
      // 模擬 API 調用
      // await new Promise(resolve => setTimeout(resolve, 1000));

      // form data to login data
      const loginData = {
        email: values.email,
        password: values.password,
      };
      // call api
      const [error, response] = await to(login(loginData));

      if (error) {
        message.error(error.message);
        return;
      }
      // 儲存 token 到 sessionStorage
      sessionStorage.setItem('access_token', response.accessToken);
      // 登入成功，更新 Redux 狀態
      dispatch(loginSuccess({
        user: response.user,
      }));
      message.success('登入成功！'); 
      navigate('/trades');
    } catch (error) {
      message.error('登入失敗，請檢查信箱和密碼');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <Card className="login-card">
          <div className="auth-header">
            <Title level={2} className="auth-title">
              歡迎回來
            </Title>
            <Text type="secondary">
              請登入您的帳號以繼續使用服務
            </Text>
          </div>

          <Form
            form={form}
            name="login"
            onFinish={onFinish}
            layout="vertical"
            size="large"
            requiredMark={false}
          >
            <Form.Item
              name="email"
              label="電子信箱"
              rules={[
                { required: true, message: '請輸入電子信箱' },
                { type: 'email', message: '請輸入有效的電子信箱格式' }
              ]}
            >
              <Input
                prefix={<MailOutlined />}
                placeholder="請輸入電子信箱"
                className="auth-input"
              />
            </Form.Item>

            <Form.Item
              name="password"
              label="密碼"
              rules={[
                { required: true, message: '請輸入密碼' }
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="請輸入密碼"
                className="auth-input"
                iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
              />
            </Form.Item>

            <Form.Item>
              <div className="login-options">
                <Checkbox
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                >
                  記住我
                </Checkbox>
                <Link to="/forgot-password" className="forgot-password">
                  忘記密碼？
                </Link>
              </div>
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                className="auth-button"
                loading={loading}
                block
              >
                登入
              </Button>
            </Form.Item>
          </Form>

          <Divider>
            <Text type="secondary">或</Text>
          </Divider>

          <div className="auth-footer">
            <Text type="secondary">
              還沒有帳號？{' '}
              <Link to="/auth/register" className="auth-link">
                立即註冊
              </Link>
            </Text>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Login;