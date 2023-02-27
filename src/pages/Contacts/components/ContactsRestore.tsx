import React from 'react';
import { Modal, Form, Alert, Row, Col, Switch } from 'antd';

interface OperationModalProps {
  visible: boolean;
  onCancel: () => void;
  onAction: (vals: any) => void;
  rowCount: number;
  loading: boolean;
}

const ContactsRestore: React.FC<OperationModalProps> = (props) => {
  const { visible, onCancel, onAction, rowCount, loading } = props;
  const [form] = Form.useForm();

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      onAction(values);
    } catch (errorInfo) {
      console.log('Failed:', errorInfo);
    }
  };

  return (
    <Modal
      title={
        <span>
          恢复纪录数 <a>{rowCount}</a>
        </span>
      }
      width={450}
      bodyStyle={{ padding: '28px 28px' }}
      destroyOnClose
      open={visible}
      onCancel={onCancel}
      okText="恢复"
      onOk={handleSubmit}
      confirmLoading={loading}
    >
      <div>
        <Alert
          message={
            <span>
              你正在恢复 <a>{`${rowCount}`}</a> 条纪录
            </span>
          }
          type="warning"
        />
        <div style={{ paddingTop: 12, paddingBottom: 12 }}> </div>
        <Form form={form}>
          <Row>
            <Col span={12}>
              <Form.Item name="replace" label="覆盖相同联系人" valuePropName="checked">
                <Switch />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="verify" label="恢复后重新验证" valuePropName="checked">
                <Switch />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </div>
    </Modal>
  );
};

export default ContactsRestore;
