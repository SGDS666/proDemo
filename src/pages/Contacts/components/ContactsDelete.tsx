import React from 'react';
import { Modal, Form, InputNumber, Alert, message } from 'antd';

interface OperationModalProps {
  visible: boolean;
  onCancel: () => void;
  multiDelete: () => void;
  rowCount: number;
  loading: boolean;
}

const ContactsDelete: React.FC<OperationModalProps> = (props) => {
  const { visible, onCancel, multiDelete, rowCount, loading } = props;
  const [form] = Form.useForm();

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const { deleteRows } = values;
      if (rowCount !== deleteRows) {
        message.error('请输入正确的删除纪录数量');
        return;
      }
      multiDelete();
    } catch (errorInfo) {
      console.log('Failed:', errorInfo);
    }
  };

  return (
    <Modal
      title={
        <span>
          删除纪录数 <a>{rowCount}</a>
        </span>
      }
      width={450}
      bodyStyle={{ padding: '28px 28px' }}
      destroyOnClose
      open={visible}
      onCancel={onCancel}
      okText="删除"
      onOk={handleSubmit}
      confirmLoading={loading}
    >
      <div>
        <Alert
          message={
            <span>
              你正在删除 <a>{`${rowCount}`}</a> 条纪录，删除90天后无法恢复。
            </span>
          }
          type="error"
        />
        <div style={{ paddingTop: 12 }}>输入你需要删除的纪录数</div>
        <Form form={form}>
          <Form.Item name="deleteRows" rules={[{ required: true, message: '请输入删除纪录数' }]}>
            <InputNumber placeholder={`${rowCount}`} style={{ width: '100%' }} size="large" />
          </Form.Item>
        </Form>
      </div>
    </Modal>
  );
};

export default ContactsDelete;
