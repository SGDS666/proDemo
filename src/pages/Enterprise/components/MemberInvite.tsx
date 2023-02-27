import React from 'react';
import { Modal, Button, Form, Input, message } from 'antd';
import { apiMembersInvite } from '@/services/enterprise';
import { useRequest } from '@umijs/max';

interface CreateFormProps {
  visible: boolean;
  onCancel: () => void;
  actionReload: () => void;
}

const MemberInvite: React.FC<CreateFormProps> = (props) => {
  const { visible, onCancel, actionReload } = props;
  const [form] = Form.useForm();

  const { run, loading } = useRequest(apiMembersInvite, {
    manual: true,
    onSuccess: () => {
      message.success('邀请成功, 邀请已发送到对方邮箱');
      onCancel();
      actionReload();
    },
  });

  return (
    <Modal
      destroyOnClose
      title="邀请成员加入企业"
      open={visible}
      onCancel={() => onCancel()}
      footer={null}
    >
      <Form
        form={form}
        onFinish={(vals) => run({ ...vals })}
        layout="vertical"
        size="large"
        style={{ paddingLeft: 24, paddingRight: 24 }}
        initialValues={{ scale: 1 }}
      >
        <Form.Item
          label="成员邮箱地址"
          name="email"
          rules={[
            { required: true, message: '请输入邮箱地址' },
            {
              type: 'email',
              message: '邮箱地址格式错误!',
            },
          ]}
        >
          <Input placeholder="请输入邮箱地址" />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>
            邀请
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default MemberInvite;
