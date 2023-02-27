import React, { useEffect } from 'react';
import { Modal, Button, message, Alert } from 'antd';
import { apiSearchTasksCancelBlack } from '@/services/search';
import { useRequest } from '@umijs/max';

interface FormProps {
  visible: boolean;
  onCancel: () => void;
  initValues: any;
  actionReload: () => void;
}

const TaskSaveCancelBlack: React.FC<FormProps> = (props) => {
  const { visible, onCancel, initValues, actionReload } = props;
  const { task_id, selectNum, selectAll, selectOrgs, keyword, filter, filters } = initValues;

  const { run: saveRun, loading: createLoading } = useRequest(apiSearchTasksCancelBlack, {
    manual: true,
    onSuccess: () => {
      message.success('操作成功');
      actionReload();
      onCancel();
    },
  });

  const handleSubmit = async () => {
    saveRun({ task_id, selectNum, selectAll, selectOrgs, keyword, filter, filters });
  };

  const footer = () => {
    return (
      <div
        style={{
          textAlign: 'center',
        }}
      >
        <Button style={{ marginRight: 16 }} onClick={() => onCancel()}>
          取消
        </Button>
        <Button type="primary" onClick={() => handleSubmit()} loading={createLoading}>
          提交
        </Button>
      </div>
    );
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  return (
    <Modal
      destroyOnClose
      width={480}
      title={`企业域名黑名单 已选中企业：${selectNum}`}
      open={visible}
      onCancel={() => onCancel()}
      footer={footer()}
    >
      <Alert
        message={'将所选中域名从黑名单移除'}
        type="info"
        showIcon
        banner
        style={{ marginBottom: 12 }}
      />
    </Modal>
  );
};

export default TaskSaveCancelBlack;
