import React from 'react';
import { Modal, Button, Form, Input, message, Select } from 'antd';
import { apiCreateOrganize } from '@/services/enterprise';
import { useRequest } from '@umijs/max';

interface CreateFormProps {
  visible: boolean;
  onCancel: () => void;
  actionReload: () => void;
}

const OrgCreateForm: React.FC<CreateFormProps> = (props) => {
  const { visible, onCancel, actionReload } = props;
  const [form] = Form.useForm();

  const { run, loading } = useRequest(apiCreateOrganize, {
    manual: true,
    onSuccess: () => {
      message.success('创建成功');
      onCancel();
      actionReload();
    },
  });

  return (
    <Modal
      destroyOnClose
      title="创建团队或企业"
      open={visible}
      onCancel={() => onCancel()}
      footer={null}
    >
      <Form
        form={form}
        onFinish={run}
        layout="vertical"
        size="large"
        style={{ paddingLeft: 24, paddingRight: 24 }}
        initialValues={{ scale: 1 }}
      >
        <Form.Item
          label="团队或企业名称"
          name="name"
          rules={[{ required: true, message: '请输入团队或企业名称' }]}
        >
          <Input placeholder="请输入团队或企业名称" />
        </Form.Item>
        <Form.Item label="预计使用规模" name="scale">
          <Select>
            <Select.Option value={1} key="selectKey1">
              1 ~ 10 人
            </Select.Option>
            <Select.Option value={2} key="selectKey2">
              11 ~ 50 人
            </Select.Option>
            <Select.Option value={3} key="selectKey3">
              51 ~ 100 人
            </Select.Option>
            <Select.Option value={4} key="selectKey4">
              101 ~ 300 人
            </Select.Option>
            <Select.Option value={5} key="selectKey5">
              301 ~ 1000 人
            </Select.Option>
            <Select.Option value={6} key="selectKey6">
              101 人及以上
            </Select.Option>
          </Select>
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

export default OrgCreateForm;
