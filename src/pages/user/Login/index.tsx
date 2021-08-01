import React, { useState, useEffect } from 'react';
import { Link, history, useModel } from 'umi';
import { Alert, Button, Form, Input, Checkbox } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import md5 from 'md5';
import logo from '../../../../public/logo.svg';
import Footer from '@/components/Footer';
import { loginPageConfig } from '@/utils/constant';
import { createService, isSuccess } from '@/utils/requestUtils';
import { isLogin, setToken } from '@/utils/tokenUtils';
import styles from './index.less';

const login = createService('/account/login', 'post');
const LoginMessage: React.FC<{
  content: string | undefined;
}> = ({ content }) => <Alert className={styles.alert} message={content} type="error" showIcon />;

const Login: React.FC = () => {
  const { initialState, setInitialState } = useModel('@@initialState');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(undefined);

  /** 如果已登录，直接跳转到首页*/
  useEffect(() => {
    if (isLogin()) {
      history.push('/Welcome');
    }
  }, []);

  const loginSuccess = async (token: string) => {
    setToken(token);
    const { userInfo, permissions }: any = await initialState?.fetchUserInfo?.();
    const menuData = await initialState?.fetchUserMenu?.();
    await setInitialState((s: any) => ({
      ...s,
      userInfo,
      permissions,
      menuData,
    }));
    history.push('/Welcome');
  };

  const onFinish = async ({
    accountName,
    accountPassword,
  }: {
    accountName: string;
    accountPassword: string;
  }) => {
    setLoading(true);
    const response = await login({
      accountName,
      accountPassword: md5(accountPassword),
    });
    setLoading(false);
    if (!isSuccess(response)) {
      setErrorMessage(response.statusMessage);
      setTimeout(() => setErrorMessage(undefined), 3000);
    } else {
      loginSuccess(response?.data?.token);
    }
  };
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.top}>
          <div className={styles.header}>
            <Link to="/user/login">
              <img alt="logo" className={styles.logo} src={logo} />
              <span className={styles.title}>{loginPageConfig.title}</span>
            </Link>
          </div>
          <div className={styles.desc}>{loginPageConfig.loginDescription}</div>
        </div>
        <div className={styles.main}>
          <Form onFinish={onFinish}>
            <Form.Item
              name="accountName"
              rules={[
                { required: true, whitespace: true, message: '请输入登录账号！' },
                { max: 20, message: '最大字符长度为20！' },
              ]}
            >
              <Input
                size="large"
                prefix={<UserOutlined className={styles.prefixIcon} />}
                placeholder="请输入登录账号"
                maxLength={20}
              />
            </Form.Item>
            <Form.Item
              name="accountPassword"
              rules={[
                { required: true, whitespace: true, message: '请输入登录密码！' },
                { max: 20, message: '最大字符长度为20！' },
              ]}
            >
              <Input
                size="large"
                prefix={<LockOutlined className={styles.prefixIcon} />}
                type="password"
                placeholder="请输入登录密码"
                maxLength={20}
              />
            </Form.Item>
            {errorMessage && !loading && <LoginMessage content={errorMessage} />}
            <Form.Item>
              <Button
                size="large"
                type="primary"
                loading={loading}
                style={{ width: '100%' }}
                htmlType="submit"
              >
                登录
              </Button>
            </Form.Item>
          </Form>
          <div className={styles.action}>
            <Checkbox disabled>记住账号</Checkbox>
            <Link to="/user/login">忘记密码</Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};
export default Login;