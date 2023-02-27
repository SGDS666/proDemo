import {
  Button,
  Checkbox,
  Col,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Menu,
  message,
  Popconfirm,
  Popover,
  Radio,
  Row,
  Space,
  Tabs,
} from 'antd';
import React, { useEffect } from 'react';
import ProCard from '@ant-design/pro-card';
import { useSetState } from 'ahooks';
import { useRequest } from '@umijs/max';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  PlusOutlined,
  QuestionCircleOutlined,
} from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-layout';
import {
  apiAccountsItems,
  apiAccountsConfig,
  apiAccountsPosteConfig,
  apiAccountsSave,
  apiAccountPassword,
  apiAccountsDelete,
} from '@/services/mails';
import MailAccountCreate from '@/components/Mails/AccountCreate';
import moment from 'moment';

const formLayout = {
  labelCol: { span: 4 },
  wrapperCol: { span: 18 },
};

const Accounts: React.FC = () => {
  const [form] = Form.useForm();
  const [state, setState] = useSetState<Record<string, any>>({
    createVisible: false,
    accId: '',
    mail_addr: '',
    configType: 'account',
    needSync: false,
    verifyStatus: {},
  });

  const { data: accData, refresh: accRefresh } = useRequest(apiAccountsItems);
  const { run: configRun } = useRequest(apiAccountsConfig, {
    manual: true,
    onSuccess: (data: any) => {
      if (!data) return;
      const { re_sync } = data;
      setState({ needSync: re_sync });
      let re_time = moment().subtract(30, 'days');
      if (data.re_time) {
        re_time = moment(data.re_time);
      }
      form.setFieldsValue({ ...data, re_time });
    },
  });

  const { run: saveRun, loading: saveLoading } = useRequest(apiAccountsSave, {
    manual: true,
    onSuccess: (data: any) => {
      if (data) {
        setState({ verifyStatus: data });
        const { success } = data;
        if (success) {
          message.success('操作成功');
          accRefresh();
        } else {
          message.error('操作失败');
        }
      }
    },
  });

  const { run: deleteRun, loading: deleteLoading } = useRequest(apiAccountsDelete, {
    manual: true,
    onSuccess: () => {
      message.success('删除成功');
      setState({ accId: '' });
      accRefresh();
    },
  });

  const { run: posteConfigRun } = useRequest(apiAccountsPosteConfig, {
    manual: true,
    onSuccess: (data) => {
      form.setFieldsValue({ ...data });
    },
  });

  const onAccountClick = (e: any) => {
    form.resetFields();
    const key = e.key;
    setState({ accId: key });
    configRun({ maid: key });
  };

  const onUserBlur = async () => {
    const mail_addr = await form.getFieldValue('mail_addr');
    const error = form.getFieldError('mail_addr');
    if (!mail_addr || error.length) {
      return;
    }
    posteConfigRun({ email: mail_addr });
  };

  const onClickSaveAction = async (verify: boolean) => {
    if (!form) return;
    form.submit();
    const { accId } = state;
    try {
      const vals = await form.validateFields();
      const { re_status, re_error, se_status, se_error, re_sync, re_time } = vals;
      let realTime = undefined;
      if (re_sync && re_time) {
        realTime = moment(re_time).valueOf();
      }
      await saveRun({
        ...vals,
        se_proto: 'smtp',
        re_status,
        re_error,
        se_status,
        se_error,
        re_sync,
        re_time: realTime,
        verify,
        maid: accId,
      });
    } catch (errorInfo) {
      console.log('Failed:', errorInfo);
    }
  };

  const ErrorContent = () => {
    const { verifyStatus } = state;
    if (!verifyStatus) return null;
    if (!verifyStatus.check) return null;
    const { re_status, re_error, se_status, se_error } = verifyStatus;
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

  const { run: passwordRun } = useRequest(apiAccountPassword, {
    manual: true,
    onSuccess: (data: any) => {
      if (data) {
        const { password } = data;
        form.setFieldsValue({ mail_pass: password });
      }
    },
  });

  const onPasswordFocus = () => {
    const { accId } = state;
    const password = form.getFieldValue('mail_pass');
    if (!password || password.length <= 40) {
      return;
    }
    passwordRun({ maid: accId });
  };

  const onDeleteAction = () => {
    const { accId } = state;
    deleteRun({ maid: accId });
  };

  const renderConfig = () => {
    if (!state.accId) {
      return null;
    }
    return (
      <div>
        <Form
          {...formLayout}
          form={form}
          initialValues={{
            re_proto: 'imap',
            re_ssl: true,
            re_port: 993,
            se_ssl: true,
            se_port: 465,
          }}
        >
          <Form.Item
            name="re_proto"
            label="收信协议"
            rules={[{ required: true, message: '请输入邮箱账号' }]}
            hidden={state.configType === 'account'}
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
            hidden={state.configType === 'server'}
          >
            <Input placeholder="如：name@domain.com" onBlur={() => onUserBlur()} />
          </Form.Item>
          <Form.Item
            name="mail_acc"
            label="邮箱账号"
            rules={[{ required: true, message: '请输入邮箱账号' }]}
            hidden={state.configType === 'account'}
          >
            <Input placeholder="如：name@domain.com" />
          </Form.Item>
          <Form.Item
            name="mail_pass"
            label="邮箱密码"
            rules={[{ required: true, message: '请输入密码' }]}
            hidden={state.configType === 'server'}
          >
            <Input.Password placeholder="******" onFocus={() => onPasswordFocus()} />
          </Form.Item>
          <Form.Item name="mail_name" label="发信名称" hidden={state.configType === 'server'}>
            <Input placeholder="如：张三" />
          </Form.Item>
          <Row hidden={state.configType === 'account'}>
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
          <Row style={{ marginBottom: 0 }} hidden={state.configType === 'account'}>
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
          <Row hidden={state.configType === 'server'}>
            <Col span={8}>
              <Form.Item
                name="re_sync"
                label="邮件同步"
                labelCol={{ span: 12 }}
                wrapperCol={{ span: 12 }}
                valuePropName="checked"
              >
                <Checkbox onChange={(e) => setState({ needSync: e.target.checked })} />
              </Form.Item>
            </Col>
            {state.needSync ? (
              <Col span={16}>
                同步
                <Form.Item name="re_time" label="" noStyle>
                  <DatePicker style={{ marginLeft: '4px', marginRight: '4px' }} />
                </Form.Item>
                之后邮件
              </Col>
            ) : null}
          </Row>
          {state.verifyStatus.check ? (
            <>
              <Form.Item
                label={false}
                valuePropName="checked"
                wrapperCol={{ offset: 4 }}
                rules={[{ required: true, message: '必填' }]}
              >
                <ExclamationCircleOutlined style={{ color: 'red' }} /> 添加失败{' '}
                <Popover title={false} content={ErrorContent}>
                  <a style={{ color: 'red' }}>查看详情</a>
                </Popover>
              </Form.Item>
            </>
          ) : null}

          <div style={{ marginBottom: '24px', textAlign: 'center' }}>
            <Button
              type="primary"
              htmlType="submit"
              onClick={() => onClickSaveAction(true)}
              loading={saveLoading}
            >
              验证并保存
            </Button>
            <Button
              htmlType="submit"
              style={{ marginLeft: 24 }}
              onClick={() => onClickSaveAction(false)}
              loading={saveLoading}
            >
              保存
            </Button>
            <Popconfirm
              title="确认删除该账号? 该操作不可恢复"
              onConfirm={onDeleteAction}
              okText="删除"
              cancelText="取消"
            >
              <Button danger style={{ marginLeft: 24 }} htmlType="submit" loading={deleteLoading}>
                删除
              </Button>
            </Popconfirm>
          </div>
        </Form>
      </div>
    );
  };

  const renderAccountSetting = () => {
    if (!accData) return null;
    if (!accData.length) return null;
    return (
      <div style={{ minWidth: '320px', maxWidth: '640px' }}>
        <Tabs
          activeKey={state.configType}
          centered
          onChange={(val: string) => setState({ configType: val })}
        >
          <Tabs.TabPane tab="设置" key="account">
            {renderConfig()}
          </Tabs.TabPane>
          <Tabs.TabPane tab="服务器" key="server">
            {renderConfig()}
          </Tabs.TabPane>
        </Tabs>
      </div>
    );
  };

  useEffect(() => {}, [state.accId]);

  return (
    <PageContainer title={false}>
      <ProCard split="vertical">
        <ProCard
          title={<span style={{ paddingLeft: 24 }}>账号列表</span>}
          colSpan="312px"
          ghost
          headerBordered
        >
          <Menu mode="inline" selectedKeys={[state.accId]} onClick={onAccountClick}>
            {accData?.map((item: any) => {
              const { mail_addr, maid, re_status, se_status } = item;
              if (re_status === 'success' && se_status === 'success') {
                return (
                  <Menu.Item key={maid} icon={<CheckCircleOutlined style={{ color: '#52c41a' }} />}>
                    {mail_addr}
                  </Menu.Item>
                );
              }
              if (re_status === 'failed' || se_status === 'failed') {
                return (
                  <Menu.Item key={maid} icon={<CloseCircleOutlined style={{ color: 'red' }} />}>
                    {mail_addr}
                  </Menu.Item>
                );
              }
              return (
                <Menu.Item key={maid} icon={<QuestionCircleOutlined />}>
                  {mail_addr}
                </Menu.Item>
              );
            })}
          </Menu>
          <div style={{ marginTop: 24, marginLeft: 24, paddingBottom: 48 }}>
            <Space size="large">
              <Button type="primary" onClick={() => setState({ createVisible: true })}>
                <PlusOutlined />
                新增账号
              </Button>
            </Space>
          </div>
        </ProCard>
        <ProCard
          title={<span style={{ paddingLeft: 24 }}>{state.mail_addr}</span>}
          headerBordered
          ghost
        >
          {accData && accData.length ? (
            renderAccountSetting()
          ) : (
            <div
              style={{
                width: '100%',
                paddingTop: 256,
                textAlign: 'center',
                paddingLeft: 12,
                display: 'inline',
              }}
            >
              <div style={{ fontSize: 16 }}>请添加邮箱账号</div>
            </div>
          )}
        </ProCard>
      </ProCard>
      <MailAccountCreate
        visible={state.createVisible}
        onCancel={() => setState({ createVisible: false })}
        actionReload={() => accRefresh()}
      />
    </PageContainer>
  );
};

export default Accounts;
