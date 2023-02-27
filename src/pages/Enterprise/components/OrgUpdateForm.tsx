import React, { useEffect } from 'react';
import { Modal, Button, Form, Input, message, Select } from 'antd';
import { apiProfileModify } from '@/services/enterprise';
import { useRequest } from '@umijs/max';

interface CreateFormProps {
  visible: boolean;
  onCancel: () => void;
  actionReload: () => void;
  values: any;
}

const OrgUpdateForm: React.FC<CreateFormProps> = (props) => {
  const { visible, onCancel, actionReload, values } = props;
  const [form] = Form.useForm();

  const { run, loading } = useRequest(apiProfileModify, {
    manual: true,
    onSuccess: () => {
      message.success('修改成功');
      onCancel();
      actionReload();
    },
  });

  useEffect(() => {
    if (visible) {
      form.resetFields();
      form.setFieldsValue(values);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  return (
    <Modal
      destroyOnClose
      title="修改团队或企业"
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
            保存
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default OrgUpdateForm;
