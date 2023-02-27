import React, { useEffect } from 'react';
import { Modal, Button, Input, message } from 'antd';
import { useSetState } from 'ahooks';
import { apiTaskRename } from '@/services/tasks';
import { useRequest } from '@umijs/max';

interface FormProps {
  visible: boolean;
  onCancel: () => void;
  gtid: string;
  name: string;
  taskReload: () => void;
}

const TaskRename: React.FC<FormProps> = (props) => {
  const { visible, onCancel, gtid, name, taskReload } = props;
  const [state, setState] = useSetState<Record<string, any>>({
    name: '',
    gtid: '',
  });

  const { run: renameRun } = useRequest(apiTaskRename, {
    manual: true,
    onSuccess: () => {
      message.success('任务名称修改成功');
      onCancel();
      taskReload();
    },
  });

  const saveTaskName = async () => {
    const { name: newName } = state;
    renameRun({ gtid, name: newName });
  };

  useEffect(() => {
    if (visible) {
      setState({ name, gtid });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  return (
    <Modal
      destroyOnClose
      width={420}
      title={null}
      open={visible}
      onCancel={() => onCancel()}
      footer={null}
    >
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 16, fontWeight: 550 }}>修改任务名称</div>
        <Input
          style={{ width: 360, marginTop: 24, marginBottom: 36 }}
          size="large"
          value={state.name}
          onChange={(e) => setState({ name: e.target.value })}
        />
        <Button type="primary" onClick={saveTaskName}>
          保存
        </Button>
      </div>
    </Modal>
  );
};

export default TaskRename;
