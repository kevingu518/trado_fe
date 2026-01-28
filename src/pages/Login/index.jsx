import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, Divider, message, Checkbox } from 'antd';
import { MailOutlined, LockOutlined, EyeInvisibleOutlined, EyeTwoTone } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { login, userAPI } from '@/api/api_user';
import to from 'await-to-js';
import { useDispatch } from 'react-redux';
import { GoogleLogin } from '@react-oauth/google';
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
      const loginData = {
        email: values.email,
        password: values.password,
      };
      const [error, response] = await to(login(loginData));

      if (error) {
        message.error(error.message || '登入失敗');
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

  // Google 登入成功後處理
  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      if (!credentialResponse.credential) {
        message.error('Google 登入失敗，沒有取得憑證');
        return;
      }

      const [error, response] = await to(
        userAPI.googleLogin({ credential: credentialResponse.credential })
      );

      if (error) {
        message.error(error.msg || 'Google 登入失敗');
        return;
      }

      // 後端回傳的格式建議跟一般 login 一樣 { accessToken, user }
      sessionStorage.setItem('access_token', response.accessToken);
      dispatch(loginSuccess({ user: response.user }));
      message.success('Google 登入成功！');
      navigate('/trades');
    } catch (err) {
      console.error(err);
      message.error('Google 登入異常');
    }
  };

  const handleGoogleError = () => {
    message.error('Google 登入失敗，請再試一次');
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
            {/* email & password 同原本 */}
            {/* ... 原本的 Form.Item 保留不動 ... */}
          </Form>

          <Divider>
            <Text type="secondary">或</Text>
          </Divider>

          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              useOneTap={false}
            />
          </div>

          <Divider />

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