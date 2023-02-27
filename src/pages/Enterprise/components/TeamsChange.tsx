import React, { useEffect, useState } from 'react';
import { Modal, Button, Form, Input, message, TreeSelect } from 'antd';
import { apiTeamsChange, apiTeamsShow } from '@/services/enterprise';
import { useRequest } from '@umijs/max';

interface CreateFormProps {
  visible: boolean;
  onCancel: () => void;
  actionReload: () => void;
  values: any;
}

const TeamsChange: React.FC<CreateFormProps> = (props) => {
  const { visible, onCancel, actionReload, values } = props;
  const [form] = Form.useForm();
  const [userId, setUserId] = useState('');

  const { run, loading } = useRequest(apiTeamsChange, {
    manual: true,
    onSuccess: () => {
      message.success('操作成功');
      onCancel();
      actionReload();
    },
  });
  const { run: runTree, data: treeData } = useRequest(apiTeamsShow, { manual: true });

  useEffect(() => {
    if (visible) {
      const { userid } = values;
      setUserId(userid);
      form.resetFields();
      form.setFieldsValue({ ...values });
      runTree();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  return (
    <Modal destroyOnClose title="更换部门" open={visible} onCancel={() => onCancel()} footer={null}>
      <Form
        form={form}
        onFinish={(vals) => run({ ...vals, userid: userId })}
        layout="vertical"
        size="large"
        style={{ paddingLeft: 24, paddingRight: 24 }}
      >
        <Form.Item
          label="成员名称"
          name="nickname"
          rules={[{ required: true, message: '请输入成员名称' }]}
        >
          <Input placeholder="请输入成员名称" disabled />
        </Form.Item>
        <Form.Item label="所属部门" name="teams">
          <TreeSelect
            style={{ width: '100%' }}
            dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
            treeDefaultExpandAll
            treeData={treeData}
            multiple
          />
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

export default TeamsChange;
