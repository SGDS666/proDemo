import React, { useEffect, useState } from 'react';
import { Modal, Button, Form, Input, message, Row, Col } from 'antd';
import { apiRenewCaptcha, apiRenewEmail } from '@/services/user';
import { history, useRequest } from '@umijs/max';

interface CreateFormProps {
  visible: boolean;
  onCancel: () => void;
  actionReload: () => void;
}

const layout = {
  labelCol: { span: 5 },
  wrapperCol: { span: 18 },
};

const EmailChange: React.FC<CreateFormProps> = (props) => {
  const [form] = Form.useForm();
  const { visible, onCancel } = props;
  const [count, setcount]: [number, any] = useState(0);
  let interval: number | undefined;

  const { run: captchaRun, loading: captchaLoading } = useRequest(apiRenewCaptcha, {
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

  const { run: renewRun, loading: renewLoading } = useRequest(apiRenewEmail, {
    manual: true,
    onSuccess: () => {
      message.success('修改邮箱成功');
      onCancel();
      history.push('/user/login');
    },
  });

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      renewRun(values);
    } catch (errorInfo) {
      console.log('Failed:', errorInfo);
    }
  };

  const onGetCaptcha = async () => {
    const error = form.getFieldError('email');
    if (error.length > 0) {
      message.error(error[0]);
      return;
    }
    const email = form.getFieldValue('email');
    if (!email) {
      message.error('请输入正确的邮件地址！');
      return;
    }
    captchaRun({ email });
  };

  const emailChange = (value: string) => {
    if (value) {
      const realValue = value.trim();
      if (realValue !== value) {
        form.setFieldsValue({ email: realValue });
      }
    }
  };

  useEffect(() => {
    if (visible) {
      form.resetFields();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.visible]);

  const footer = () => {
    return (
      <div style={{ textAlign: 'center' }}>
        <Button type="primary" onClick={() => handleSubmit()} loading={renewLoading}>
          确认
        </Button>
      </div>
    );
  };

  return (
    <Modal
      destroyOnClose
      title="更改邮箱"
      open={visible}
      onCancel={() => onCancel()}
      footer={footer()}
    >
      <Form {...layout} form={form} style={{ paddingLeft: 12 }}>
        <Form.Item
          name="email"
          rules={[
            {
              required: true,
              message: '邮箱地址不能为空',
            },
            {
              type: 'email',
              message: '非法邮箱地址',
            },
          ]}
        >
          <Input
            size="large"
            placeholder="输入新邮箱"
            onChange={(e) => emailChange(e.target.value)}
          />
        </Form.Item>
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
            <Button size="large" disabled={!!count} onClick={onGetCaptcha} loading={captchaLoading}>
              {count ? `${count} S` : '获取验证码'}
            </Button>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default EmailChange;
