import React, { useEffect, useState } from 'react';
import { Modal, Button, Form, Input, message, Row, Col } from 'antd';
import { useSetState } from 'ahooks';
import { apiVerifyCaptcha, apiVerifyCode } from '@/services/user';
import { useRequest } from '@umijs/max';

interface CreateFormProps {
  visible: boolean;
  onCancel: () => void;
  actionReload: () => void;
  current: any;
}

const layout = {
  labelCol: { span: 5 },
  wrapperCol: { span: 18 },
};

const EmailVerify: React.FC<CreateFormProps> = (props) => {
  const { visible, onCancel, actionReload, current } = props;
  const [count, setcount]: [number, any] = useState(0);
  const [state, setState] = useSetState({
    current: null,
    email: '',
  });
  const [form] = Form.useForm();
  let interval: number | undefined;

  const { run: verifyRun, loading: verifyLoading } = useRequest(apiVerifyCode, {
    manual: true,
    onSuccess: () => {
      message.success('身份验证成功');
      onCancel();
      actionReload();
    },
  });

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      verifyRun(values);
    } catch (errorInfo) {
      console.log('Failed:', errorInfo);
    }
  };

  const { run: captchaRun, loading: captchaLoading } = useRequest(apiVerifyCaptcha, {
    manual: true,
    onSuccess: () => {
      let counts = 59;
      setcount(counts);
      interval = window.setInterval(() => {
        counts -= 1;
        setcount(counts);
        if (counts === 0) {
          clearInterval(interval);
        }
      }, 1000);
    },
  });

  useEffect(() => {
    if (visible) {
      const { email } = current;
      setState({ email });
    }
  }, [props.visible]);

  const footer = () => {
    return (
      <div style={{ textAlign: 'right' }}>
        <Button style={{ marginRight: 16 }} onClick={() => onCancel()}>
          取消
        </Button>
        <Button type="primary" onClick={() => handleSubmit()} loading={verifyLoading}>
          验证
        </Button>
      </div>
    );
  };

  return (
    <Modal
      destroyOnClose
      title="身份验证"
      open={visible}
      onCancel={() => onCancel()}
      footer={footer()}
    >
      <div style={{ fontSize: 16, paddingBottom: 12, paddingLeft: 12 }}>
        为了你的账户安全，请验证身份。验证成功后进行下一步操作。
      </div>
      <div style={{ fontSize: 16, paddingBottom: 12, paddingLeft: 12 }}>
        验证码将发送到您的邮箱：{state.email}
      </div>
      <Form {...layout} form={form} style={{ paddingLeft: 12 }}>
        <Row>
          <Col span={12}>
            <Form.Item
              name="captcha"
              rules={[
                {
                  required: true,
                  message: '请输入验证码',
                },
              ]}
            >
              <Input size="large" placeholder="6位邮箱验证码" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Button
              size="large"
              disabled={!!count}
              onClick={() => captchaRun()}
              loading={captchaLoading}
            >
              {count ? `${count} S` : '获取验证码'}
            </Button>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default EmailVerify;
