import React, { useEffect } from 'react';
import { Modal, Button, message, Radio, Spin } from 'antd';
import { useSetState } from 'ahooks';
import { apiViewShareSet } from '@/services/contacts';
import { useModel, useRequest } from '@umijs/max';

interface FormProps {
  visible: boolean;
  onCancel: () => void;
  viewId: string;
  viewShared: string;
  actionReload: () => void;
}

const TaskShare: React.FC<FormProps> = (props) => {
  const { initialState } = useModel('@@initialState');
  const { visible, onCancel, viewId, viewShared, actionReload } = props;
  const [state, setState] = useSetState<Record<string, any>>({
    viewId: '',
    viewName: '',
    shared: '',
  });

  const { run: setRun } = useRequest(apiViewShareSet, {
    manual: true,
    onSuccess: () => {
      message.success('修改成功');
      onCancel();
      actionReload();
    },
  });

  const saveAction = async () => {
    const { shared } = state;
    setRun({ viewId, shared });
  };

  useEffect(() => {
    if (visible) {
      setState({ shared: viewShared, viewId });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  if (!initialState) {
    return <Spin size="large">未登录</Spin>;
  }
  const { uid, userid, teamIds } = initialState.currentUser;

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
        <div style={{ fontSize: 16, fontWeight: 550 }}>视图分享设置</div>
        <Radio.Group
          value={state.shared}
          onChange={(e) => setState({ shared: e.target.value })}
          style={{ width: 360, marginLeft: 24, marginTop: 24, marginBottom: 36 }}
          size="large"
        >
          <Radio value="private" style={{ width: '100%' }}>
            我自己
          </Radio>
          <Radio value="team" style={{ width: '100%' }} disabled={!teamIds || !teamIds.length}>
            我的部门
          </Radio>
          <Radio value="everyone" style={{ width: '100%' }} disabled={uid === userid || !userid}>
            所有人
          </Radio>
        </Radio.Group>
        <Button type="primary" onClick={saveAction}>
          保存
        </Button>
      </div>
    </Modal>
  );
};

export default TaskShare;
