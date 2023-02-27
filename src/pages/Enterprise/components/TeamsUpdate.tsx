import React, { useEffect } from 'react';
import { Modal, Button, Form, Input, message, TreeSelect } from 'antd';
import { apiTeamsManage, apiTeamsProfile, apiTeamsShow } from '@/services/enterprise';
import { useRequest } from '@umijs/max';

interface CreateFormProps {
  visible: boolean;
  onCancel: () => void;
  actionReload: () => void;
  teamId: string;
}

const TeamsUpdate: React.FC<CreateFormProps> = (props) => {
  const { visible, onCancel, actionReload, teamId } = props;
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
  const getProfileData = async () => {
    const { success, data } = await apiTeamsProfile({ teamId });
    if (success) {
      form.setFieldsValue({ ...data });
    }
  };

  useEffect(() => {
    if (visible) {
      runTree();
      getProfileData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  return (
    <Modal
      destroyOnClose
      title="修改部门资料"
      open={visible}
      onCancel={() => onCancel()}
      footer={null}
    >
      <Form
        form={form}
        onFinish={(vals) => run({ ...vals, action: 'add' })}
        layout="vertical"
        size="large"
        style={{ paddingLeft: 24, paddingRight: 24 }}
      >
        <Form.Item
          label="部门名称"
          name="team_name"
          rules={[{ required: true, message: '请输入部门名称' }]}
        >
          <Input placeholder="请输入部门名称" />
        </Form.Item>
        <Form.Item label="上级部门" name="father">
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

export default TeamsUpdate;
