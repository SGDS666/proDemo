import React, { useEffect } from 'react';
import { Modal, Button, Form, Input, message, TreeSelect } from 'antd';
import { apiTeamsManage, apiTeamsShow } from '@/services/enterprise';
import { useRequest } from '@umijs/max';

interface CreateFormProps {
  visible: boolean;
  onCancel: () => void;
  actionReload: () => void;
}

const TeamsCreate: React.FC<CreateFormProps> = (props) => {
  const { visible, onCancel, actionReload } = props;
  const [form] = Form.useForm();

  const { run, loading } = useRequest(apiTeamsManage, {
    manual: true,
    onSuccess: () => {
      message.success('创建成功');
      onCancel();
      actionReload();
    },
  });
  const { run: runTree, data: treeData } = useRequest(apiTeamsShow, { manual: true });

  useEffect(() => {
    if (visible) {
      runTree();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  return (
    <Modal destroyOnClose title="创建部门" open={visible} onCancel={() => onCancel()} footer={null}>
      <Form
        form={form}
        onFinish={(vals) => run({ ...vals, action: 'add' })}
        layout="vertical"
        size="large"
        style={{ paddingLeft: 24, paddingRight: 24 }}
        initialValues={{ father: '0' }}
      >
        <Form.Item
          label="部门名称"
          name="team_name"
          rules={[{ required: true, message: '请输入部门名称' }]}
        >
          <Input placeholder="请输入部门名称" />
        </Form.Item>
        <Form.Item
          label="上级部门"
          name="father"
          rules={[{ required: true, message: '请选择上级部门' }]}
        >
          <TreeSelect
            style={{ width: '100%' }}
            dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
            treeDefaultExpandAll
            treeData={treeData}
          />
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

export default TeamsCreate;
