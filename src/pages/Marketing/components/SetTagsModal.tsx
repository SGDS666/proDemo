import React, { useEffect } from 'react';
import { Modal, Form, message, Alert } from 'antd';
import { useSetState } from 'ahooks';
import { apiTaskSendTags } from '@/services/tasks';
import { apiTagsList } from '@/services/contacts';
import ContactField from '@/components/Contacts/ContactField';
import { useRequest } from '@umijs/max';

interface OperationModalProps {
  visible: boolean;
  onCancel: () => void;
  changeType: string;
  setCount: number;
  gtid: string;
  status: string;
}

const SetTagsModal: React.FC<OperationModalProps> = (props) => {
  const { visible, onCancel, changeType, setCount, gtid, status } = props;
  const [form] = Form.useForm();
  const [state, setState] = useSetState({
    changeField: null,
    changeValue: null,
    tagsOptions: [],
    tagsItem: {},
  });

  const { run: tagsListRun } = useRequest(apiTagsList, {
    manual: true,
    onSuccess: (data: any) => {
      if (!data) return;
      setState({ tagsItem: { belongTo: 'contact', dataIndex: 'tags', items: data } });
    },
  });

  const { run: tagsRun } = useRequest(apiTaskSendTags, {
    manual: true,
    onSuccess: () => {
      message.success('标签更新成功');
      onCancel();
      form.resetFields();
    },
  });

  useEffect(() => {
    if (visible) {
      tagsListRun();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const { changeValue } = values;
      if (!changeValue || !changeValue.length) {
        message.error('标签不能为空');
        return;
      }
      tagsRun({ gtid, status, tags: changeValue, type: changeType });
    } catch (errorInfo) {
      console.log('Failed:', errorInfo);
    }
  };

  const onValuesChange = (changedValues: any) => {
    setState({ ...changedValues });
  };

  const renderTitle = () => {
    if (changeType === 'add') {
      return (
        <div>
          贴标签 (已选择<a>{setCount}</a>个联系人)
        </div>
      );
    }
    return (
      <div>
        撕标签 (已选择<a>{setCount}</a>个联系人)
      </div>
    );
  };

  const renderLable = () => {
    if (changeType === 'add') {
      return <div style={{ fontSize: 16 }}>添加以下标签 (可选择多个)</div>;
    }
    return <div style={{ fontSize: 16 }}>删除以下标签 (可选择多个)</div>;
  };

  return (
    <Modal
      title={renderTitle()}
      width={480}
      bodyStyle={{ padding: '24px 48px 24px' }}
      destroyOnClose
      open={visible}
      onCancel={onCancel}
      okText="确定"
      onOk={handleSubmit}
    >
      <div>
        <Alert
          message="直接输入新标签名称可自动创建"
          type="info"
          showIcon
          style={{ marginBottom: 12 }}
        />
        <Form layout="vertical" form={form} onValuesChange={onValuesChange}>
          <Form.Item
            label={renderLable()}
            name="changeValue"
            rules={[{ required: true, message: '请选择标签' }]}
          >
            <ContactField field={state.tagsItem} size="large" />
          </Form.Item>
        </Form>
      </div>
    </Modal>
  );
};

export default SetTagsModal;
