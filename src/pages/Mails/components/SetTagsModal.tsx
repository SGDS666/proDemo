import React, { useEffect } from 'react';
import { Modal, Form, Select, message } from 'antd';
import { useRequest, useSetState } from 'ahooks';
import { apiTagsOptions, apiTagsSet } from '@/services/contacts';
import { getTextEmails } from '@/utils/common';

interface OperationModalProps {
  visible: boolean;
  onCancel: () => void;
  changeType: string;
  text: string;
  actionReload: (vals: any) => void;
}

const SetTagsModal: React.FC<OperationModalProps> = (props) => {
  const { visible, onCancel, changeType, text, actionReload } = props;
  const [form] = Form.useForm();
  const [state, setState] = useSetState({
    changeField: null,
    changeValue: null,
    tagsOptions: [],
  });

  const getTagsOptions = async () => {
    const data = await apiTagsOptions();
    setState({ tagsOptions: data });
  };

  useEffect(() => {
    if (visible) {
      getTagsOptions();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const { run: tagsRun } = useRequest(apiTagsSet, {
    manual: true,
    onSuccess: (data: any) => {
      if (!data) return;
      message.success('标签更新成功');
      onCancel();
      actionReload(data);
      form.resetFields();
    },
  });

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const { changeValue } = values;
      if (!changeValue || !changeValue.length) {
        message.error('标签不能为空');
        return;
      }
      const emails = getTextEmails(text);
      if (emails && emails.length) {
        const email = emails[0];
        tagsRun({ email, tags: changeValue, type: changeType });
      } else {
        message.error('非法邮件地址');
      }
    } catch (errorInfo) {
      console.log('Failed:', errorInfo);
    }
  };

  const onValuesChange = (changedValues: any) => {
    setState({ ...changedValues });
  };

  const renderLable = () => {
    if (changeType === 'add') {
      return <div style={{ fontSize: 16 }}>添加以下标签 (可选择多个)</div>;
    }
    return <div style={{ fontSize: 16 }}>删除以下标签 (可选择多个)</div>;
  };

  return (
    <Modal
      title={null}
      width={480}
      bodyStyle={{ padding: '24px 48px 24px' }}
      destroyOnClose
      open={visible}
      onCancel={onCancel}
      okText="确定"
      onOk={handleSubmit}
    >
      <div>
        <Form layout="vertical" form={form} onValuesChange={onValuesChange}>
          <Form.Item
            label={renderLable()}
            name="changeValue"
            rules={[{ required: true, message: '请选择标签' }]}
          >
            <Select
              mode="tags"
              allowClear
              showSearch
              showArrow
              options={state.tagsOptions}
              optionFilterProp="label"
              size="large"
            />
          </Form.Item>
        </Form>
      </div>
    </Modal>
  );
};

export default SetTagsModal;
