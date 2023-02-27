import React from 'react';
import { Modal, Form } from 'antd';
import ContactField from '@/components/Contacts/ContactField';

interface OperationModalProps {
  visible: boolean;
  onCancel: () => void;
  multiTags: (params: any) => void;
  rowCount: number;
  loading: boolean;
  action: 'push' | 'pull';
  tagsItem: any;
}

const ContactsTags: React.FC<OperationModalProps> = (props) => {
  const { visible, onCancel, multiTags, rowCount, loading, action, tagsItem } = props;
  const [form] = Form.useForm();

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      multiTags(values);
    } catch (errorInfo) {
      console.log('Failed:', errorInfo);
    }
  };

  const renderTitle = () => {
    if (action === 'push') {
      return (
        <div>
          贴标签 (已选择<a>{rowCount}</a>个联系人)
        </div>
      );
    }
    return (
      <div>
        撕标签 (已选择<a>{rowCount}</a>个联系人)
      </div>
    );
  };

  const renderLable = () => {
    if (action === 'push') {
      return <div style={{ fontSize: 16 }}>添加以下标签 (可选择多个)</div>;
    }
    return <div style={{ fontSize: 16 }}>删除以下标签 (可选择多个)</div>;
  };

  return (
    <Modal
      title={renderTitle()}
      width={450}
      bodyStyle={{ padding: '28px 28px' }}
      destroyOnClose
      open={visible}
      onCancel={onCancel}
      okText="提交"
      onOk={handleSubmit}
      confirmLoading={loading}
    >
      <div>
        <Form layout="vertical" form={form}>
          <Form.Item
            label={renderLable()}
            name="tagValues"
            rules={[{ required: true, message: '请选择标签' }]}
          >
            <ContactField field={tagsItem} size="large" />
          </Form.Item>
        </Form>
      </div>
    </Modal>
  );
};

export default ContactsTags;
