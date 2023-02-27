import React, { useEffect, useState } from 'react';
import { Modal, Button, Form, Input, message } from 'antd';
import { apiPermissionsManage } from '@/services/enterprise';
import { useRequest } from '@umijs/max';

interface CreateFormProps {
  visible: boolean;
  onCancel: () => void;
  actionReload: () => void;
  values: any;
}

const RoleUpdateForm: React.FC<CreateFormProps> = (props) => {
  const { visible, onCancel, actionReload, values } = props;
  const [form] = Form.useForm();
  const [roleId, setRoleId] = useState('');

  const { run, loading } = useRequest(apiPermissionsManage, {
    manual: true,
    onSuccess: () => {
      message.success('修改成功');
      onCancel();
      actionReload();
    },
  });

  useEffect(() => {
    if (visible) {
      const { role_id, role_name } = values;
      setRoleId(role_id);
      form.setFieldsValue({ role_id, role_name });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  return (
    <Modal
      destroyOnClose
      title="角色名称修改"
      open={visible}
      onCancel={() => onCancel()}
      footer={null}
    >
      <Form
        form={form}
        onFinish={(vals) => run({ ...vals, role_id: roleId, action: 'update' })}
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
            保存
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default RoleUpdateForm;
