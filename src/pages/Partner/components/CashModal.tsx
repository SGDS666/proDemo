import React, { useEffect, useState } from 'react';
import { history, useRequest } from '@umijs/max';
import { Modal, Button, Form, Input, Select, InputNumber, Row, Col, Tag, message } from 'antd';
import { useSetState } from 'ahooks';
import { apiUserBankInfo, apiUserVerifyCaptcha } from '@/services/user';
import { apiCashOut } from '@/services/payment';
import numeral from 'numeral';

interface CreateFormProps {
  visible: boolean;
  onCancel: () => void;
  actionReload: () => void;
}

const layout = {
  labelCol: { span: 5 },
  wrapperCol: { span: 18 },
};

const bankOptions = [
  { label: '中国银行', value: '中国银行' },
  { label: '中国工商银行', value: '中国工商银行' },
  { label: '中国建设银行', value: '中国建设银行' },
  { label: '中国农业银行', value: '中国农业银行' },
  { label: '中国邮政储蓄银行', value: '中国邮政储蓄银行' },
  { label: '中国光大银行', value: '中国光大银行' },
  { label: '中国民生银行', value: '中国民生银行' },
  { label: '中信银行', value: '中信银行' },
  { label: '交通银行', value: '交通银行' },
  { label: '华夏银行', value: '华夏银行' },
  { label: '招商银行', value: '招商银行' },
  { label: '兴业银行', value: '兴业银行' },
  { label: '广发银行', value: '广发银行' },
  { label: '平安银行', value: '平安银行' },
];

const CashModal: React.FC<CreateFormProps> = (props) => {
  const { visible, onCancel, actionReload } = props;
  const [count, setcount]: [number, any] = useState(0);
  const [state, setState] = useSetState({
    submitLoading: false,
    captchaLoading: false,
    name: '',
    commission: 0,
    maxCash: 0,
    email: '',
    cashTax: 0,
    cash: 0,
  });
  const [form] = Form.useForm();
  let interval: number | undefined;

  const handleSubmit = async () => {
    setState({ submitLoading: true });
    try {
      const values = await form.validateFields();
      const success = await apiCashOut(values);
      if (success) {
        message.success('提现成功，等待管理员审核。');
        onCancel();
        actionReload();
      }
    } catch (errorInfo) {
      console.log('Failed:', errorInfo);
    }
    setState({ submitLoading: false });
  };

  const onGetCaptcha = async () => {
    setState({ captchaLoading: true });
    const success = await apiUserVerifyCaptcha({ action: 'cash' });
    setState({ captchaLoading: false });
    if (!success) {
      return;
    }
    let counts = 59;
    setcount(counts);
    interval = window.setInterval(() => {
      counts -= 1;
      setcount(counts);
      if (counts === 0) {
        clearInterval(interval);
      }
    }, 1000);
  };

  const { run: infoRun } = useRequest(apiUserBankInfo, {
    manual: true,
    onSuccess: (data: any) => {
      if (!data) return;
      const { name, commission, email } = data;
      if (!name) {
        message.warning('未实名，请实名认证后再提现');
        onCancel();
        history.replace('/account/authc');
        return;
      }
      if (email.indexOf('@') <= 0) {
        message.warning('未绑定邮箱，请绑定邮箱后再提现');
        onCancel();
        history.replace('/account/settings');
        return;
      }
      const maxCash = Math.floor(commission / 1000 / 100) * 100;
      setState({ name, commission, maxCash, email });
    },
  });

  const getBankInfo = async () => {
    infoRun();
  };

  const checkIdNumber = (_: any, value: string) => {
    const promise = Promise;
    const reg = /^([1-9]{1})(\d{14}|\d{15}|\d{18})$/;
    if (value && !reg.test(value)) {
      return promise.reject('非法银行卡卡号');
    }
    return promise.resolve();
  };

  const onCashMoneyChange = (value: any) => {
    if (value <= 800) {
      setState({ cash: value, cashTax: 0 });
    }
    if (value > 800 && value <= 4000) {
      const tax = (value - 800) * 0.2;
      setState({ cash: value - tax, cashTax: tax });
    }
    if (value > 4000) {
      const tax = value * 0.8 * 0.2;
      setState({ cash: value - tax, cashTax: tax });
    }
  };

  useEffect(() => {
    if (visible) {
      getBankInfo();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const footer = () => {
    return (
      <div style={{ textAlign: 'right' }}>
        <Button style={{ marginRight: 16 }} onClick={() => onCancel()}>
          取消
        </Button>
        <Button type="primary" onClick={() => handleSubmit()} loading={state.submitLoading}>
          提交
        </Button>
      </div>
    );
  };

  return (
    <Modal
      destroyOnClose
      title="佣金提现"
      open={visible}
      onCancel={() => onCancel()}
      footer={footer()}
    >
      <Form {...layout} form={form} style={{ paddingLeft: 12 }}>
        <Form.Item name="realName" label="收款人" extra="收款人是你的实名姓名,请使用其名下的银行卡">
          <Tag color="default">
            <span style={{ fontSize: 16 }}>{state.name}</span>
          </Tag>
        </Form.Item>
        <Form.Item
          name="cardId"
          label="银行卡号"
          rules={[{ required: true, message: '请输入银行卡号' }, { validator: checkIdNumber }]}
        >
          <Input size="large" placeholder="请输入银行卡号" />
        </Form.Item>
        <Form.Item name="bankName" label="银行" rules={[{ required: true, message: '请选择银行' }]}>
          <Select
            placeholder="请选择银行"
            size="large"
            optionFilterProp="children"
            options={bankOptions}
          />
        </Form.Item>
        <Form.Item
          label="提现金额"
          extra={`可提现余额：${numeral(state.commission / 1000).format(
            '0,0.00',
          )}元, 最低100, 且是100的整数倍`}
        >
          <Row gutter={8}>
            <Col span={8}>
              <Form.Item name="money" noStyle rules={[{ required: true, message: '提现金额' }]}>
                <InputNumber
                  size="large"
                  min={100}
                  max={state.maxCash}
                  step={100}
                  onChange={onCashMoneyChange}
                />
              </Form.Item>
            </Col>
            <Col span={16}>
              <Tag color="default" style={{ marginTop: 8 }}>
                <span>{`实际到账：${state.cash}元 个税扣除：${state.cashTax}元`}</span>
              </Tag>
            </Col>
          </Row>
        </Form.Item>
        <Form.Item label="验证码" extra={`验证码将发送到您的邮箱: ${state.email}`}>
          <Row gutter={8}>
            <Col span={8}>
              <Form.Item
                name="captcha"
                noStyle
                rules={[{ required: true, message: '请输入验证码' }]}
              >
                <Input size="large" placeholder="6位验证码" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Button
                size="large"
                disabled={!!count}
                onClick={onGetCaptcha}
                loading={state.captchaLoading}
              >
                {count ? `${count} S` : '获取验证码'}
              </Button>
            </Col>
          </Row>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CashModal;
