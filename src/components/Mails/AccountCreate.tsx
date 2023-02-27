import {
  Button,
  Checkbox,
  Col,
  DatePicker,
  Form,
  Input,
  InputNumber,
  message,
  Modal,
  Popover,
  Radio,
  Row,
} from 'antd';
import React, { useState } from 'react';
import { useRequest } from '@umijs/max';
import { apiAccountsAdd, apiAccountsPosteConfig } from '@/services/mails';
import moment from 'moment';
import { ExclamationCircleOutlined } from '@ant-design/icons';

const formLayout = {
  labelCol: { span: 4 },
  wrapperCol: { span: 18 },
};

interface CreateFormProps {
  visible: boolean;
  onCancel: () => void;
  actionReload: () => void;
}

const MailAccountCreate: React.FC<CreateFormProps> = (props) => {
  const { visible, onCancel, actionReload } = props;
  const [hiddenVal, setHiddenVal] = useState(true);
  const [form] = Form.useForm();
  const [needSync, setNeedSync] = useState(false);
  const [connStatus, setConnStatus] = useState<any>({});

  const { run: addRun, loading: addLoading } = useRequest(apiAccountsAdd, {
    manual: true,
    onSuccess: (data: any) => {
      if (!data) return;
      setConnStatus(data);
      const { success } = data;
      if (success) {
        message.success('新增账号成功');
        form.resetFields();
        onCancel();
        actionReload();
      } else {
        message.error('新增账号失败');
      }
    },
  });
  const { run: configRun } = useRequest(apiAccountsPosteConfig, { manual: true });

  const onAddClick = async (skip_error: boolean) => {
    if (!form) return;
    form.submit();
    try {
      const vals = await form.validateFields();
      const { re_status, re_error, se_status, se_error, re_sync, re_time } = vals;
      let realTime = undefined;
      if (re_sync && re_time) {
        realTime = moment(re_time).valueOf();
      }
      await addRun({
        ...vals,
        skip_error,
        se_proto: 'smtp',
        re_status,
        re_error,
        se_status,
        se_error,
        re_sync,
        re_time: realTime,
      });
    } catch (errorInfo: any) {
      const { errorFields } = errorInfo;
      if (errorFields) {
        const { errors, name } = errorFields[0];
        if (errors) {
          message.error(errors.toString());
        }
        if (name.indexOf('re_server') >= 0 || name.indexOf('se_server') >= 0) {
          setHiddenVal(false);
        }
      }
      console.log('Failed:', errorInfo);
    }
  };

  const onUserBlur = async () => {
    const mail_addr = await form.getFieldValue('mail_addr');
    const error = form.getFieldError('mail_addr');
    if (!mail_addr || error.length) {
      return;
    }
    const data = await configRun({ email: mail_addr });
    if (data) {
      form.setFieldsValue({ ...data, mail_acc: mail_addr });
    }
  };

  const onSyncChange = (checked: boolean) => {
    setNeedSync(checked);
    if (checked) {
      form.setFieldsValue({ re_time: moment().subtract(30, 'days') });
    }
  };

  const ErrorContent = () => {
    if (!connStatus) return null;
    if (!connStatus.check) return null;
    const { re_status, re_error, se_status, se_error } = connStatus;
    return (
      <div style={{ maxWidth: 720, overflow: 'hidden' }}>
        <div>
          收信：
          {re_status ? (
            <span style={{ color: 'green' }}>成功</span>
          ) : (
            <span style={{ color: 'red' }}>失败</span>
          )}
          {re_status ? null : <span style={{ marginLeft: '12px' }}>原因：{re_error}</span>}
        </div>
        <div>
          发信：
          {se_status ? (
            <span style={{ color: 'green' }}>成功</span>
          ) : (
            <span style={{ color: 'red' }}>失败</span>
          )}
          {se_status ? null : <span style={{ marginLeft: '12px' }}>原因：{se_error}</span>}
        </div>
      </div>
    );
  };

  const renderCreateButton = () => {
    if (!connStatus || !connStatus.check) {
      return (
        <Button
          type="primary"
          htmlType="submit"
          loading={addLoading}
          onClick={() => onAddClick(false)}
        >
          创建
        </Button>
      );
    }
    const { re_status, se_status } = connStatus;
    if (re_status && se_status) {
      return (
        <Button
          type="primary"
          htmlType="submit"
          loading={addLoading}
          onClick={() => onAddClick(false)}
        >
          创建
        </Button>
      );
    } else if (re_status || se_status) {
      return (
        <Button
          type="primary"
          htmlType="submit"
          loading={addLoading}
          onClick={() => onAddClick(true)}
          danger
          ghost
        >
          继续保存
        </Button>
      );
    }
    return (
      <Button
        type="primary"
        htmlType="submit"
        loading={addLoading}
        onClick={() => onAddClick(false)}
        disabled
      >
        创建
      </Button>
    );
  };

  return (
    <Modal
      destroyOnClose
      title="新建邮箱账号"
      open={visible}
      onCancel={() => onCancel()}
      footer={null}
      width={640}
    >
      <Form
        {...formLayout}
        form={form}
        initialValues={{ re_proto: 'imap', re_ssl: true, re_port: 993, se_ssl: true, se_port: 465 }}
        onChange={() => setConnStatus({})}
      >
        <Form.Item
          name="re_proto"
          label="收信协议"
          rules={[{ required: true, message: '请输入邮箱账号' }]}
          hidden={hiddenVal}
        >
          <Radio.Group>
            <Radio value="imap">IMAP</Radio>
          </Radio.Group>
        </Form.Item>
        <Form.Item
          name="mail_addr"
          label="邮箱地址"
          rules={[
            { required: true, message: '请输入邮箱账号' },
            { type: 'email', message: '请输入正确的邮箱地址' },
          ]}
          hidden={!hiddenVal}
        >
          <Input placeholder="如：name@domain.com" onBlur={() => onUserBlur()} />
        </Form.Item>
        <Form.Item
          name="mail_acc"
          label="邮箱账号"
          rules={[{ required: true, message: '请输入邮箱账号' }]}
          hidden={hiddenVal}
        >
          <Input placeholder="如：name@domain.com" />
        </Form.Item>
        <Form.Item
          name="mail_pass"
          label="邮箱密码"
          rules={[{ required: true, message: '请输入密码' }]}
          hidden={!hiddenVal}
        >
          <Input.Password placeholder="******" />
        </Form.Item>
        <Form.Item name="mail_name" label="发信名称" hidden={!hiddenVal}>
          <Input placeholder="如：张三" />
        </Form.Item>
        <Row hidden={hiddenVal}>
          <Col span={14}>
            <Form.Item
              name="re_server"
              label="收信(IMAP)"
              rules={[{ required: true, message: '请输入收信服务器地址' }]}
              labelCol={{ span: 7 }}
              wrapperCol={{ span: 16 }}
            >
              <Input placeholder="如：imap.domain.com" />
            </Form.Item>
          </Col>
          <Col span={3}>
            <Form.Item
              name="re_ssl"
              label="SSL"
              labelCol={{ span: 14 }}
              wrapperCol={{ span: 10 }}
              valuePropName="checked"
              rules={[{ required: true, message: '必填' }]}
            >
              <Checkbox />
            </Form.Item>
          </Col>
          <Col span={3} style={{ marginLeft: 12 }}>
            <Form.Item
              name="re_port"
              label="端口"
              labelCol={{ span: 15 }}
              wrapperCol={{ span: 9 }}
              rules={[{ required: true, message: '必填' }]}
            >
              <InputNumber controls={false} style={{ width: 68 }} />
            </Form.Item>
          </Col>
        </Row>
        <Row style={{ marginBottom: 0 }} hidden={hiddenVal}>
          <Col span={14}>
            <Form.Item
              name="se_server"
              label="发信(SMTP)"
              rules={[{ required: true, message: '请输入发信服务器地址' }]}
              labelCol={{ span: 7 }}
              wrapperCol={{ span: 16 }}
            >
              <Input placeholder="如：smtp.domain.com" />
            </Form.Item>
          </Col>
          <Col span={3}>
            <Form.Item
              name="se_ssl"
              label="SSL"
              labelCol={{ span: 14 }}
              wrapperCol={{ span: 10 }}
              valuePropName="checked"
              rules={[{ required: true, message: '必填' }]}
            >
              <Checkbox />
            </Form.Item>
          </Col>
          <Col span={3} style={{ marginLeft: 12 }}>
            <Form.Item
              name="se_port"
              label="端口"
              labelCol={{ span: 15 }}
              wrapperCol={{ span: 9 }}
              rules={[{ required: true, message: '必填' }]}
            >
              <InputNumber controls={false} style={{ width: 68 }} />
            </Form.Item>
          </Col>
        </Row>
        <Row hidden={!hiddenVal}>
          <Col span={8}>
            <Form.Item
              name="re_sync"
              label="邮件同步"
              labelCol={{ span: 12 }}
              wrapperCol={{ span: 12 }}
              valuePropName="checked"
            >
              <Checkbox onChange={(e) => onSyncChange(e.target.checked)} />
            </Form.Item>
          </Col>
          {needSync ? (
            <Col span={16}>
              同步
              <Form.Item name="re_time" label="" noStyle>
                <DatePicker style={{ marginLeft: '4px', marginRight: '4px' }} />
              </Form.Item>
              之后邮件
            </Col>
          ) : null}
        </Row>
        {connStatus.check ? (
          <>
            <Form.Item
              label={false}
              valuePropName="checked"
              wrapperCol={{ offset: 4 }}
              rules={[{ required: true, message: '必填' }]}
            >
              <ExclamationCircleOutlined style={{ color: 'red' }} /> 添加失败{' '}
              <Popover content={ErrorContent} title={false}>
                <a style={{ color: 'red' }}>查看详情</a>
              </Popover>
            </Form.Item>
          </>
        ) : null}

        <div style={{ marginBottom: '24px', textAlign: 'right' }}>
          {hiddenVal ? (
            <Button style={{ marginRight: '24px' }} onClick={() => setHiddenVal(false)}>
              手动设置
            </Button>
          ) : (
            <Button style={{ marginRight: '24px' }} onClick={() => setHiddenVal(true)}>
              返回
            </Button>
          )}
          {renderCreateButton()}
        </div>
      </Form>
    </Modal>
  );
};

export default MailAccountCreate;
