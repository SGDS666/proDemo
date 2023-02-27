import React, { useEffect } from 'react';
import { Modal, Button, Form, Input, message } from 'antd';
import { apiTagsSave } from '@/services/contacts';
import { useRequest } from '@umijs/max';

interface CreateFormProps {
  visible: boolean;
  onCancel: () => void;
  actionReload: () => void;
  initValues: any;
}

const formLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 16 },
};

const TagsDirUpdate: React.FC<CreateFormProps> = (props) => {
  const { visible, onCancel, actionReload, initValues } = props;
  const [form] = Form.useForm();

  const { run: saveRun, loading: addLoading } = useRequest(apiTagsSave, {
    manual: true,
    onSuccess: () => {
      message.success('更新目录成功');
      onCancel();
      actionReload();
    },
  });

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const { id } = initValues;
      saveRun({ ...values, id });
    } catch (errorInfo) {
      console.log('Failed:', errorInfo);
    }
  };

  useEffect(() => {
    if (visible) {
      form.resetFields();
      form.setFieldsValue(initValues);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const footer = () => {
    return (
      <div
        style={{
          textAlign: 'center',
        }}
      >
        <Button style={{ marginRight: 16 }} onClick={() => onCancel()}>
          取消
        </Button>
        <Button type="primary" onClick={() => handleSubmit()} loading={addLoading}>
          提交
        </Button>
      </div>
    );
  };

  return (
    <Modal
      destroyOnClose
      title="修改目录"
      open={visible}
      onCancel={() => onCancel()}
      footer={footer()}
      maskClosable={false}
    >
      <Form {...formLayout} form={form}>
        <Form.Item
          label="目录名称"
          name="name"
          rules={[{ required: true, message: '请输入目录名称' }]}
        >
          <Input placeholder="请输入目录名称" />
        </Form.Item>
        <Form.Item label="备注" name="description">
          <Input />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default TagsDirUpdate;
