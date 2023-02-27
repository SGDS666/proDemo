import React, { useEffect, useState } from 'react';
import { Modal, Button, Form, Input, message, Popover, Progress } from 'antd';
import { useSetState } from 'ahooks';
import { apiPasswordChange } from '@/services/user';
import { history, useRequest } from '@umijs/max';
import styles from './password.less';

interface CreateFormProps {
  visible: boolean;
  onCancel: () => void;
  current: any;
}

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

const PasswordChange: React.FC<CreateFormProps> = (props) => {
  const { visible: proVisible, onCancel, current } = props;
  const [form] = Form.useForm();
  const [visible, setVisible]: [boolean, any] = useState(false);
  const [popover, setPopover]: [boolean, any] = useState(false);
  const [state, setState] = useSetState({ email: '' });

  const { run: changeRun, loading: changeLoading } = useRequest(apiPasswordChange, {
    manual: true,
    onSuccess: () => {
      message.success('修改密码成功');
      onCancel();
      history.push('/user/login');
    },
  });

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
      return promise.reject('密码长度小于6位');
    }
    return promise.resolve();
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      changeRun(values);
    } catch (errorInfo) {
      console.log('Failed:', errorInfo);
    }
  };

  useEffect(() => {
    if (proVisible) {
      const { email } = current;
      setState({ email });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.visible]);

  const footer = () => {
    return (
      <div style={{ textAlign: 'right' }}>
        <Button style={{ marginRight: 16 }} onClick={() => onCancel()}>
          取消
        </Button>
        <Button type="primary" onClick={() => handleSubmit()} loading={changeLoading}>
          提交
        </Button>
      </div>
    );
  };

  return (
    <Modal
      destroyOnClose
      title="修改密码"
      open={proVisible}
      onCancel={() => onCancel()}
      footer={footer()}
      width={448}
    >
      <div style={{ fontSize: 16, paddingBottom: 12, paddingLeft: 12 }}>
        您的账号：{state.email}
      </div>
      <Form form={form} style={{ paddingLeft: 12 }}>
        <Form.Item name="originPass" rules={[{ required: true, message: '请输入原密码' }]}>
          <Input placeholder="请输入原密码" size="large" />
        </Form.Item>
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
          <Form.Item
            name="password"
            className={styles.password}
            rules={[
              {
                validator: checkPassword,
              },
            ]}
          >
            <Input size="large" type="password" placeholder="新密码，至少6位，区分大小写" />
          </Form.Item>
        </Popover>
        <Form.Item
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
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default PasswordChange;
