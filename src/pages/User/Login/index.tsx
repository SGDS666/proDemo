import Footer from '@/components/Footer';
import { getFakeCaptcha } from '@/services/ant-design-pro/login';
import {
  AlipayCircleOutlined,
  CommentOutlined,
  CustomerServiceOutlined,
  LockOutlined,
  MobileOutlined,
  TaobaoCircleOutlined,
  UserOutlined,
  WeiboCircleOutlined,
} from '@ant-design/icons';
import {
  LoginForm,
  ProFormCaptcha,
  ProFormCheckbox,
  ProFormText,
} from '@ant-design/pro-components';
import { useEmotionCss } from '@ant-design/use-emotion-css';
import {
  FormattedMessage,
  history,
  SelectLang,
  useIntl,
  useModel,
  Helmet,
  Link,
  useRequest,
} from '@umijs/max';
import { Alert, FloatButton, message, Tabs } from 'antd';
import Settings from '../../../../config/defaultSettings';
import React, { useState } from 'react';
import { flushSync } from 'react-dom';
import { apiUserLogin } from '@/services/user';
import BrowserAlert from '@/components/Global/BrowserAlert';

const { host } = window.location;

const ActionIcons = () => {
  const langClassName = useEmotionCss(({ token }) => {
    return {
      marginLeft: '8px',
      color: 'rgba(0, 0, 0, 0.2)',
      fontSize: '24px',
      verticalAlign: 'middle',
      cursor: 'pointer',
      transition: 'color 0.3s',
      '&:hover': {
        color: token.colorPrimaryActive,
      },
    };
  });

  return (
    <>
      <AlipayCircleOutlined key="AlipayCircleOutlined" className={langClassName} />
      <TaobaoCircleOutlined key="TaobaoCircleOutlined" className={langClassName} />
      <WeiboCircleOutlined key="WeiboCircleOutlined" className={langClassName} />
    </>
  );
};

const Lang = () => {
  const langClassName = useEmotionCss(({ token }) => {
    return {
      width: 42,
      height: 42,
      lineHeight: '42px',
      position: 'fixed',
      right: 16,
      borderRadius: token.borderRadius,
      ':hover': {
        backgroundColor: token.colorBgTextHover,
      },
    };
  });

  return (
    <div className={langClassName} data-lang>
      {SelectLang && <SelectLang />}
    </div>
  );
};

const LoginMessage: React.FC<{
  content: string;
}> = ({ content }) => {
  return (
    <Alert
      style={{
        marginBottom: 24,
      }}
      message={content}
      type="error"
      showIcon
    />
  );
};

const Login: React.FC = () => {
  const [userLoginState, setUserLoginState] = useState({ status: '', errorMessage: '' });
  const [type, setType] = useState<string>('account');
  const { initialState, setInitialState } = useModel('@@initialState');

  const fetchUserInfo = async () => {
    const userInfo = await initialState?.fetchUserInfo?.();
    if (userInfo) {
      flushSync(() => {
        setInitialState((s) => ({
          ...s,
          currentUser: userInfo,
        }));
      });
    }
  };

  const fetchPageAuth = async () => {
    const pageAuth = await initialState?.fetchPageAuth?.();
    if (pageAuth) {
      flushSync(() => {
        setInitialState((s) => ({
          ...s,
          pageAuth,
        }));
      });
    }
  };

  const fetchUserPermissions = async () => {
    const userPermissions = await initialState?.fetchUserPermissions?.();
    if (userPermissions) {
      flushSync(() => {
        setInitialState((s) => ({
          ...s,
          userPermissions,
        }));
      });
    }
  };

  const fetchInitialState = async () => {
    await fetchUserInfo();
    await fetchPageAuth();
    await fetchUserPermissions();
  };

  const containerClassName = useEmotionCss(() => {
    return {
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      overflow: 'auto',
      backgroundImage:
        "url('https://mdn.alipayobjects.com/yuyan_qk0oxh/afts/img/V-_oS6r-i7wAAAAAAAAAAAAAFl94AQBr')",
      backgroundSize: '100% 100%',
    };
  });

  const intl = useIntl();

  const onLoginSuccess = async (data: any) => {
    if (!data) {
      message.error('????????????!');
      return;
    }
    setUserLoginState({ status: 'ok', errorMessage: '' });
    const { accesstoken, orgId } = data;
    const defaultLoginSuccessMessage = '???????????????';
    message.success(defaultLoginSuccessMessage);
    window.localStorage.setItem('accesstoken', accesstoken);
    window.localStorage.setItem('orgId', orgId);
    await fetchInitialState();
    const urlParams = new URL(window.location.href).searchParams;
    history.push(urlParams.get('redirect') || '/');
  };

  const { run: loginRun } = useRequest(apiUserLogin, {
    manual: true,
    onSuccess: (data: any) => {
      onLoginSuccess(data);
    },
    onError: (err: any) => {
      if (err.info) {
        const { message: errorMessage } = err.info;
        message.error(errorMessage);
        setUserLoginState({ status: 'error', errorMessage });
      }
    },
  });

  const handleSubmit = async (values: API.LoginParams) => {
    const { userAgent } = window.navigator;
    loginRun({ ...values, type, host, userAgent });

    //   const msg = await apiUserLogin({ ...values, type, host, userAgent });
    //   const { success, message: errorMessage, data } = msg;
    //   if (success) {
    //     onLoginSuccess(data);
    //     return;
    //   }
    //   // ???????????????????????????????????????
    //   setUserLoginState({ status: 'error', errorMessage });
    // } catch (error) {
    //   const defaultLoginFailureMessage = intl.formatMessage({
    //     id: 'pages.login.failure',
    //     defaultMessage: '???????????????????????????',
    //   });
    //   message.error(defaultLoginFailureMessage);
    // }
  };
  const { status } = userLoginState;

  return (
    <div className={containerClassName}>
      <BrowserAlert />
      <Helmet>
        <title>
          {intl.formatMessage({
            id: 'menu.login',
            defaultMessage: '?????????',
          })}
          - {Settings.title}
        </title>
      </Helmet>
      <Lang />
      <div
        style={{
          flex: '1',
          padding: '32px 0',
        }}
      >
        <LoginForm
          contentStyle={{
            minWidth: 280,
            maxWidth: '75vw',
          }}
          logo={<img alt="logo" src="/logo.svg" />}
          title="?????????"
          subTitle={intl.formatMessage({ id: 'pages.layouts.userLayout.title' })}
          initialValues={{
            autoLogin: true,
          }}
          actions={[
            <FormattedMessage
              key="loginWith"
              id="pages.login.loginWith"
              defaultMessage="??????????????????"
            />,
            <ActionIcons key="icons" />,
            <Link key="UserRegist" style={{ float: 'right' }} to="/user/regist">
              <FormattedMessage id="pages.login.registerAccount" defaultMessage="????????????" />
            </Link>,
          ]}
          onFinish={async (values) => {
            await handleSubmit(values as API.LoginParams);
          }}
        >
          <Tabs
            activeKey={type}
            onChange={setType}
            centered
            items={[
              {
                key: 'account',
                label: intl.formatMessage({
                  id: 'pages.login.accountLogin.tab',
                  defaultMessage: '??????????????????',
                }),
              },
              {
                disabled: true,
                key: 'mobile',
                label: intl.formatMessage({
                  id: 'pages.login.phoneLogin.tab',
                  defaultMessage: '???????????????',
                }),
              },
            ]}
          />

          {status === 'error' && type === 'account' && (
            <LoginMessage
              content={intl.formatMessage({
                id: 'pages.login.accountLogin.errorMessage',
                defaultMessage: '?????????????????????',
              })}
            />
          )}
          {type === 'account' && (
            <>
              <ProFormText
                name="username"
                fieldProps={{
                  size: 'large',
                  prefix: <UserOutlined />,
                }}
                placeholder={intl.formatMessage({
                  id: 'pages.login.username.placeholder',
                  defaultMessage: '?????????: admin or user',
                })}
                rules={[
                  {
                    required: true,
                    message: (
                      <FormattedMessage
                        id="pages.login.username.required"
                        defaultMessage="??????????????????!"
                      />
                    ),
                  },
                ]}
              />
              <ProFormText.Password
                name="password"
                fieldProps={{
                  size: 'large',
                  prefix: <LockOutlined />,
                }}
                placeholder={intl.formatMessage({
                  id: 'pages.login.password.placeholder',
                  defaultMessage: '??????: ant.design',
                })}
                rules={[
                  {
                    required: true,
                    message: (
                      <FormattedMessage
                        id="pages.login.password.required"
                        defaultMessage="??????????????????"
                      />
                    ),
                  },
                ]}
              />
            </>
          )}

          {status === 'error' && type === 'mobile' && <LoginMessage content="???????????????" />}
          {type === 'mobile' && (
            <>
              <ProFormText
                fieldProps={{
                  size: 'large',
                  prefix: <MobileOutlined />,
                }}
                name="mobile"
                placeholder={intl.formatMessage({
                  id: 'pages.login.phoneNumber.placeholder',
                  defaultMessage: '?????????',
                })}
                rules={[
                  {
                    required: true,
                    message: (
                      <FormattedMessage
                        id="pages.login.phoneNumber.required"
                        defaultMessage="?????????????????????"
                      />
                    ),
                  },
                  {
                    pattern: /^1\d{10}$/,
                    message: (
                      <FormattedMessage
                        id="pages.login.phoneNumber.invalid"
                        defaultMessage="????????????????????????"
                      />
                    ),
                  },
                ]}
              />
              <ProFormCaptcha
                fieldProps={{
                  size: 'large',
                  prefix: <LockOutlined />,
                }}
                captchaProps={{
                  size: 'large',
                }}
                placeholder={intl.formatMessage({
                  id: 'pages.login.captcha.placeholder',
                  defaultMessage: '??????????????????',
                })}
                captchaTextRender={(timing, count) => {
                  if (timing) {
                    return `${count} ${intl.formatMessage({
                      id: 'pages.getCaptchaSecondText',
                      defaultMessage: '???????????????',
                    })}`;
                  }
                  return intl.formatMessage({
                    id: 'pages.login.phoneLogin.getVerificationCode',
                    defaultMessage: '???????????????',
                  });
                }}
                name="captcha"
                rules={[
                  {
                    required: true,
                    message: (
                      <FormattedMessage
                        id="pages.login.captcha.required"
                        defaultMessage="?????????????????????"
                      />
                    ),
                  },
                ]}
                onGetCaptcha={async (phone) => {
                  const result = await getFakeCaptcha({
                    phone,
                  });
                  if (!result) {
                    return;
                  }
                  message.success('???????????????????????????????????????1234');
                }}
              />
            </>
          )}
          <div
            style={{
              marginBottom: 24,
            }}
          >
            <ProFormCheckbox noStyle name="autoLogin">
              <FormattedMessage id="pages.login.rememberMe" defaultMessage="????????????" />
            </ProFormCheckbox>
            <Link key="ForgetPassword" style={{ float: 'right' }} to="/user/reset">
              <FormattedMessage id="pages.login.forgotPassword" defaultMessage="????????????" />
            </Link>
          </div>
        </LoginForm>
      </div>
      <Footer />
      <FloatButton.Group
        trigger="hover"
        type="primary"
        style={{ right: 24 }}
        icon={<CustomerServiceOutlined />}
      >
        <FloatButton tooltip={<div>???????????????17091913071</div>} />
        <FloatButton
          icon={<CommentOutlined />}
          tooltip={<div>????????????????????????</div>}
          onClick={() => window.open('https://www.laifaxin.com/assets/images/img/apan.png')}
        />
      </FloatButton.Group>
    </div>
  );
};

export default Login;
