import React from 'react';
import { Modal, Button, Form, Input, message } from 'antd';
import { apiPermissionsManage } from '@/services/enterprise';
import { useRequest } from '@umijs/max';

interface CreateFormProps {
  visible: boolean;
  onCancel: () => void;
  actionReload: (id: string) => void;
}

const RoleCreateForm: React.FC<CreateFormProps> = (props) => {
  const { visible, onCancel, actionReload } = props;
  const [form] = Form.useForm();

  const { run, loading } = useRequest(apiPermissionsManage, {
    manual: true,
    onSuccess: (data: any) => {
      if (!data) return;
      message.success('创建成功');
      onCancel();
      if (data) {
        const { id } = data;
        actionReload(id);
      }
    },
  });

  return (
    <Modal destroyOnClose title="角色创建" open={visible} onCancel={() => onCancel()} footer={null}>
      <Form
        form={form}
        onFinish={(vals) => run({ ...vals, action: 'add' })}
        layout="vertical"
        size="large"
        style={{ paddingLeft: 24, paddingRight: 24 }}
        initialValues={{ scale: 1 }}
      >
        <Form.Item
          label="角色名称"
          name="role_name"
          rules={[{ required: true, message: '角色名称' }]}
        >
          <Input placeholder="请输入角色名称" />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>
            新增
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default RoleCreateForm;
