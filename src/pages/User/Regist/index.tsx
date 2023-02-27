import type { FC } from 'react';
import { useState, useEffect } from 'react';
import { Form, Button, Col, Input, Popover, Progress, Row, message } from 'antd';
import type { Store } from 'antd/es/form/interface';
import { Link, history, useRequest } from '@umijs/max';
import { reqRegist, reqRegistCaptcha } from '@/services/user';
import UserLayout from '@/layouts/UserLayout';

import styles from './style.less';

const FormItem = Form.Item;

const { host } = window.location;
const url = window.location.href;
const urltag = url.split('/').pop();
const inviteCode = urltag === 'regist' ? '' : urltag;

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

const Register: FC = () => {
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

  const { run: getCaptchaRun, loading: getCaptchaLoading } = useRequest(reqRegistCaptcha, {
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
      // console.log(22, error.info);
      message.error(`${error.message}`);
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

  const { run: registRun, loading: registLoading } = useRequest(reqRegist, {
    manual: true,
    onSuccess: () => {
      message.success('注册成功！');
      const email = form.getFieldValue('email');
      history.push(`/user/regist-success?account=${email}`);
    },
    onError: (error) => {
      if (error?.message) {
        message.error(error?.message);
      }
    },
  });

  const onSumit = async (vals: Store) => {
    const { email, password, captcha } = vals;
    registRun({
      email,
      password,
      captcha,
      host,
      inviteCode,
    });
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
        <h3>来发信注册</h3>
        <Form form={form} name="UserRegister" onFinish={onSumit}>
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
            <Input size="large" placeholder="邮箱" />
          </FormItem>
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
                    <span>请至少输入 6 个字符。请不要使用容易被猜到的密码。</span>
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
              <Input size="large" type="password" placeholder="至少6位密码，区分大小写" />
            </FormItem>
          </Popover>
          <FormItem
            name="confirm"
            rules={[
              {
                required: true,
                message: '确认密码',
              },
              {
                validator: checkConfirm,
              },
            ]}
          >
            <Input size="large" type="password" placeholder="确认密码" />
          </FormItem>
          <Row gutter={8}>
            <Col span={16}>
              <FormItem
                name="captcha"
                rules={[
                  {
                    required: true,
                    message: '请输入验证码!',
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
          <FormItem>
            <Button
              size="large"
              loading={registLoading}
              className={styles.submit}
              type="primary"
              htmlType="submit"
            >
              <span>注册</span>
            </Button>
            <Link className={styles.login} to="/user/login">
              <span>使用已有账户登录</span>
            </Link>
          </FormItem>
        </Form>
      </div>
    </UserLayout>
  );
};
export default Register;
