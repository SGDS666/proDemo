import React, { useEffect } from 'react';
import { Modal, Form, Input, message, Tooltip } from 'antd';
import styles from './style.less';
import { apiSenderSave, apiSenderCheck } from '@/services/mails';
import { useSetState } from 'ahooks';
import { QuestionCircleOutlined } from '@ant-design/icons';

interface OperationModalProps {
  visible: boolean;
  current: any | undefined;
  onCancel: () => void;
  actionReload: () => void;
}

const formLayout = {
  labelCol: { span: 7 },
  wrapperCol: { span: 13 },
};

const MailSenderSystem: React.FC<OperationModalProps> = (props) => {
  const [form] = Form.useForm();
  const { visible, current, onCancel, actionReload } = props;
  const [state, setState] = useSetState<Record<string, any>>({
    testLoading: false,
    submitLoading: false,
    _id: null,
    nameStatus: 'error',
    nameHelp: '只能使用字母(a-z)、数字(0-9)、符号(_-.)组成',
  });

  useEffect(() => {
    if (form && visible) {
      form.resetFields();
      if (current) {
        setState({ nameStatus: 'success' });
        form.setFieldsValue(current);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const handleSubmit = async () => {
    const { nameStatus } = state;
    if (nameStatus === 'error') {
      return;
    }
    if (!form) return;
    form.submit();
    try {
      const values = await form.validateFields();
      setState({ submitLoading: true });
      const success = await apiSenderSave({ ...values });
      if (success) {
        form.resetFields();
        message.success(`${current ? '保存' : '新增'}系统账号成功！`);
        onCancel();
        actionReload();
      }
      setState({ submitLoading: false });
    } catch (errorInfo) {
      console.log('Failed:', errorInfo);
    }
  };

  const modalFooter = { okText: '保存', onOk: handleSubmit, onCancel };

  const formChange = async (changedValues: any, allValues: any) => {
    const { name } = changedValues;
    const { _id } = allValues;
    if (name) {
      const reg = /^[A-Za-z0-9_\-.]{6,30}$/;
      if (reg.test(name)) {
        const { success } = await apiSenderCheck({ id: _id, name });
        if (success) {
          setState({ nameHelp: '', nameStatus: 'success' });
        } else {
          setState({ nameHelp: '已有人使用了该用户名，请尝试其他用户名', nameStatus: 'error' });
        }
      } else if (name.length < 6) {
        setState({ nameHelp: '字符数长度6-30', nameStatus: 'error' });
      } else {
        setState({ nameHelp: '只能使用字母(a-z)、数字(0-9)、数点(.)组成', nameStatus: 'error' });
      }
    }
  };

  const getModalContent = () => {
    return (
      <Form {...formLayout} form={form} onValuesChange={formChange}>
        <Form.Item hidden name="_id" label="保存id">
          <Input />
        </Form.Item>
        <Form.Item
          name="name"
          label={
            <span>
              发件人邮箱&nbsp;
              <Tooltip title="只能使用字母(a-z)、数字(0-9)、数点(.)组成，创建后不能修改">
                <QuestionCircleOutlined />
              </Tooltip>
            </span>
          }
          validateStatus={state.nameStatus}
          help={state.nameHelp}
          rules={[{ required: true, message: '请输入发件人邮箱' }]}
        >
          <Input placeholder="如：name" addonAfter="@系统发信域名" disabled={current} />
        </Form.Item>
        <Form.Item
          name="fromName"
          label="发件人名称"
          rules={[{ required: true, message: '请输入发件人名称' }]}
        >
          <Input placeholder="如：张三" />
        </Form.Item>
      </Form>
    );
  };

  return (
    <Modal
      title={`${current ? '编辑' : '新增'}系统邮箱`}
      className={styles.standardListForm}
      width={640}
      bodyStyle={{ padding: '28px 0 0' }}
      destroyOnClose
      open={visible}
      confirmLoading={state.submitLoading}
      maskClosable={false}
      {...modalFooter}
    >
      {getModalContent()}
    </Modal>
  );
};

export default MailSenderSystem;
