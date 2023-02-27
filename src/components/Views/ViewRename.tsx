import React, { useEffect } from 'react';
import { Modal, Button, Input, message } from 'antd';
import { useSetState } from 'ahooks';
import { apiViewRename } from '@/services/views';
import { useRequest } from '@umijs/max';

interface FormProps {
  visible: boolean;
  onCancel: () => void;
  viewId: string;
  viewName: string;
  actionReload: () => void;
}

const TaskRename: React.FC<FormProps> = (props) => {
  const { visible, onCancel, viewId, viewName, actionReload } = props;
  const [state, setState] = useSetState<Record<string, any>>({
    viewId: '',
    viewName: '',
  });

  const { run: renameRun } = useRequest(apiViewRename, {
    manual: true,
    onSuccess: () => {
      message.success('视图名称修改成功');
      onCancel();
      actionReload();
    },
  });

  const saveViewName = async () => {
    const { viewName: name } = state;
    renameRun({ viewId, name });
  };

  useEffect(() => {
    if (visible) {
      setState({ viewName, viewId });
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
        <div style={{ fontSize: 16, fontWeight: 550 }}>重命名视图</div>
        <Input
          style={{ width: 360, marginTop: 24, marginBottom: 36 }}
          size="large"
          value={state.viewName}
          onChange={(e) => setState({ viewName: e.target.value })}
        />
        <Button type="primary" onClick={saveViewName}>
          保存
        </Button>
      </div>
    </Modal>
  );
};

export default TaskRename;
