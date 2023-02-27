import React from 'react';
import { Modal, Button, Form, Input, message, Radio, Spin, theme } from 'antd';
import { apiViewAdd } from '@/services/views';
import { useModel, useRequest } from '@umijs/max';

interface CreateFormProps {
  visible: boolean;
  onCancel: () => void;
  actionReload: (vals: any) => void;
  filters: any[];
  viewType: string;
}

const ViewCreate: React.FC<CreateFormProps> = (props) => {
  const { visible, onCancel, actionReload, filters, viewType } = props;
  const [form] = Form.useForm();
  const { token } = theme.useToken()
  const { run, loading } = useRequest(apiViewAdd, {
    manual: true,
    onSuccess: (data: any) => {
      if (!data) return;
      message.success('创建新视图成功');
      onCancel();
      actionReload(data);
    },
  });
  const { initialState } = useModel('@@initialState');
  if (!initialState) {
    return <Spin size="large">未登录</Spin>;
  }
  const currentUser = initialState?.currentUser || {};
  const { uid, userid } = currentUser;

  const onFinishAction = async (values: any) => {
    if (!filters) {
      await run(values);
    } else {
      await run({ ...values, filters });
    }
  };

  return (
    <Modal
      destroyOnClose
      title="创建筛选视图"
      open={visible}
      onCancel={() => onCancel()}
      footer={null}
      style={{ color: token.colorText }}
      maskClosable={false}
    >
      <Form
        form={form}
        onFinish={(vals) => onFinishAction({ ...vals, type: viewType })}
        layout="vertical"
        size="large"
        style={{ paddingLeft: 24, paddingRight: 24 }}
        initialValues={{ shared: 'private' }}
      >
        <Form.Item
          label="视图名称"
          name="name"
          rules={[{ required: true, message: '请输入视图名称' }]}
        >
          <Input placeholder="视图名称" />
        </Form.Item>
        <Form.Item
          label="分享给"
          name="shared"
          rules={[{ required: true, message: '请选择分享对象' }]}
        >
          <Radio.Group>
            <Radio value="private" style={{ width: '100%' }}>
              我自己
            </Radio>
            <Radio value="everyone" style={{ width: '100%' }} disabled={uid === userid}>
              所有人
            </Radio>
          </Radio.Group>
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>
            创建
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ViewCreate;
