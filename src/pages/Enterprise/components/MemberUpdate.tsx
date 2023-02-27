import React, { useEffect, useState } from 'react';
import { Modal, Button, Form, Input, message } from 'antd';
import { apiMembersModify } from '@/services/enterprise';
import { useRequest } from '@umijs/max';

interface CreateFormProps {
  visible: boolean;
  onCancel: () => void;
  actionReload: () => void;
  values: any;
}

const MemberUpdate: React.FC<CreateFormProps> = (props) => {
  const { visible, onCancel, actionReload, values } = props;
  const [form] = Form.useForm();
  const [userId, setUserId] = useState('');

  const { run, loading } = useRequest(apiMembersModify, {
    manual: true,
    onSuccess: () => {
      message.success('保存成功');
      onCancel();
      actionReload();
    },
  });

  useEffect(() => {
    if (visible) {
      form.resetFields();
      const { userid } = values;
      setUserId(userid);
      form.setFieldsValue(values);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  return (
    <Modal
      destroyOnClose
      title="修改成员资料"
      open={visible}
      onCancel={() => onCancel()}
      footer={null}
    >
      <Form
        form={form}
        onFinish={(vals) => run({ ...vals, userid: userId })}
        layout="vertical"
        size="large"
        style={{ paddingLeft: 24, paddingRight: 24 }}
        initialValues={{ scale: 1 }}
      >
        <Form.Item
          label="成员呢称"
          name="nickname"
          rules={[{ required: true, message: '成员呢称' }]}
        >
          <Input placeholder="成员呢称" />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>
            保存
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default MemberUpdate;
