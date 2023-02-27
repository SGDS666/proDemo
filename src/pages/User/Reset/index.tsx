import type { FC } from 'react';
import { useState, useEffect } from 'react';
import { Form, Button, Col, Input, Popover, Progress, Row, message } from 'antd';
import type { Store } from 'antd/es/form/interface';
import { Link, history, useRequest } from '@umijs/max';
import { reqResetCaptcha, reqResetPassword } from '@/services/user';
import UserLayout from '@/layouts/UserLayout';

import styles from './style.less';

const FormItem = Form.Item;

const { host } = window.location;

const passwordStatusMap = {
  ok: (
    <div className={styles.success}>
      <span>强度：强</span>
    </div>
  ),
  pass: (
    <div className={styles.warning}>
      <span>强度：中</span>
    </div>
  ),
  poor: (
    <div className={styles.error}>
      <span>强度：太短</span>
    </div>
  ),
};

const passwordProgressMap: {
  ok: 'success';
  pass: 'normal';
  poor: 'exception';
} = {
  ok: 'success',
  pass: 'normal',
  poor: 'exception',
};

const ResetPassord: FC = () => {
  const [count, setCount]: [number, any] = useState(0);
  const [visible, setVisible]: [boolean, any] = useState(false);
  const [popover, setPopover]: [boolean, any] = useState(false);
  const confirmDirty = false;
  let interval: number | undefined;
  const [form] = Form.useForm();

  useEffect(
    () => () => {
      clearInterval(interval);
    },
    [interval],
  );

  const getPasswordStatus = () => {
    const value = form.getFieldValue('password');
    if (value && value.length > 9) {
      return 'ok';
    }
    if (value && value.length > 5) {
      return 'pass';
    }
    return 'poor';
  };

  const { run: getCaptchaRun, loading: getCaptchaLoading } = useRequest(reqResetCaptcha, {
    manual: true,
    onSuccess: () => {
      message.success('发送验证码成功');
      let counts = 59;
      setCount(counts);
      interval = window.setInterval(() => {
        counts -= 1;
        setCount(counts);
        if (counts === 0) {
          clearInterval(interval);
        }
      }, 1000);
    },
    onError: (error) => {
      if (error?.message) {
        message.error(`${error.message}`);
      }
    },
  });

  const onGetCaptcha = async () => {
    const error = form.getFieldError('email');
    if (error && error.length) {
      message.error(error);
      return;
    }
    const vals = form.getFieldsValue();
    const { email } = vals;
    if (!email) {
      message.error('邮箱地址不能为空');
      return;
    }
    getCaptchaRun({ email, host });
  };

  const { run: resetRun, loading: resetLoading } = useRequest(reqResetPassword, {
    manual: true,
    onSuccess: () => {
      message.success('注册成功！');
      const email = form.getFieldValue('email');
      history.push(`/user/reset-success?account=${email}`);
    },
    onError: (error) => {
      if (error?.message) {
        message.error(error?.message);
      }
    },
  });

  const onSumit = async (vals: Store) => {
    const { email, password, captcha } = vals;
    resetRun({ email, password, captcha, host });
  };

  const checkConfirm = (_: any, value: string) => {
    const promise = Promise;
    if (value && value !== form.getFieldValue('password')) {
      return promise.reject('两次输入的密码不匹配!');
    }
    return promise.resolve();
  };

  const checkPassword = (_: any, value: string) => {
    const promise = Promise;
    // 没有值的情况
    if (!value) {
      setVisible(!!value);
      return promise.reject('请输入密码!');
    }
    // 有值的情况
    if (!visible) {
      setVisible(!!value);
    }
    setPopover(!popover);
    if (value.length < 6) {
      return promise.reject('');
    }
    if (value && confirmDirty) {
      form.validateFields(['confirm']);
    }
    return promise.resolve();
  };

  const renderPasswordProgress = () => {
    const value = form.getFieldValue('password');
    const passwordStatus = getPasswordStatus();
    return value && value.length ? (
      <div className={styles[`progress-${passwordStatus}`]}>
        <Progress
          status={passwordProgressMap[passwordStatus]}
          className={styles.progress}
          strokeWidth={6}
          percent={value.length * 10 > 100 ? 100 : value.length * 10}
          showInfo={false}
        />
      </div>
    ) : null;
  };

  return (
    <UserLayout>
      <div className={styles.main}>
        <h3>请输入你需要找回的邮箱地址</h3>
        <Form form={form} name="PasswordReset" onFinish={onSumit}>
          <FormItem
            name="email"
            rules={[
              {
                required: true,
                message: '请输入邮箱地址!',
              },
              {
                type: 'email',
                message: '邮箱地址格式错误!',
              },
            ]}
          >
            <Input size="large" placeholder="邮箱地址" />
          </FormItem>
          <Row gutter={8}>
            <Col span={16}>
              <FormItem
                name="captcha"
                rules={[
                  {
                    required: true,
                    message: '请输入验证码',
                  },
                ]}
              >
                <Input size="large" placeholder="验证码" />
              </FormItem>
            </Col>
            <Col span={8}>
              <Button
                size="large"
                disabled={!!count}
                className={styles.getCaptcha}
                onClick={onGetCaptcha}
                loading={getCaptchaLoading}
              >
                {count ? `${count} s` : '获取验证码'}
              </Button>
            </Col>
          </Row>
          <Popover
            getPopupContainer={(node) => {
              if (node && node.parentNode) {
                return node.parentNode as HTMLElement;
              }
              return node;
            }}
            content={
              visible && (
                <div style={{ padding: '4px 0' }}>
                  {passwordStatusMap[getPasswordStatus()]}
                  {renderPasswordProgress()}
                  <div style={{ marginTop: 10 }}>
                    请至少输入 6 个字符。请不要使用容易被猜到的密码。
                  </div>
                </div>
              )
            }
            overlayStyle={{ width: 240 }}
            placement="right"
            open={visible}
          >
            <FormItem
              name="password"
              className={
                form.getFieldValue('password') &&
                form.getFieldValue('password').length > 0 &&
                styles.password
              }
              rules={[
                {
                  validator: checkPassword,
                },
              ]}
            >
              <Input size="large" type="password" placeholder="新密码，至少6位，区分大小写" />
            </FormItem>
          </Popover>
          <FormItem
            name="confirm"
            rules={[
              {
                required: true,
                message: '请输入确认密码',
              },
              {
                validator: checkConfirm,
              },
            ]}
          >
            <Input size="large" type="password" placeholder="确认密码" />
          </FormItem>
          <FormItem>
            <Button
              size="large"
              loading={resetLoading}
              className={styles.submit}
              type="primary"
              htmlType="submit"
            >
              重置密码
            </Button>
            <Link className={styles.login} to="/user/login">
              返回登录
            </Link>
          </FormItem>
        </Form>
      </div>
    </UserLayout>
  );
};
export default ResetPassord;
