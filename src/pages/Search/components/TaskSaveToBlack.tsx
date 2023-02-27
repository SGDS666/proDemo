import React, { useEffect } from 'react';
import { Modal, Button, message, Alert } from 'antd';
import { apiSearchTasksSaveBlack } from '@/services/search';
import { useRequest } from '@umijs/max';

interface FormProps {
  visible: boolean;
  onCancel: () => void;
  initValues: any;
  actionReload: () => void;
}

const TaskSaveToBlack: React.FC<FormProps> = (props) => {
  const { visible, onCancel, initValues, actionReload } = props;
  const { task_id, selectNum, selectAll, selectOrgs, keyword, filter, filters, logic } = initValues;

  const { run: saveRun, loading: createLoading } = useRequest(apiSearchTasksSaveBlack, {
    manual: true,
    onSuccess: () => {
      message.success('操作成功，请到客户/黑名单中查看数据');
      actionReload();
      onCancel();
    },
  });

  const handleSubmit = async () => {
    saveRun({ task_id, selectNum, selectAll, selectOrgs, keyword, filter, filters, logic });
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
      title={`企业域名拉入黑名单 已选中企业：${selectNum}`}
      open={visible}
      onCancel={() => onCancel()}
      footer={footer()}
    >
      <Alert
        message={'将所选中域名拉入黑名单，进入黑名单后不再保存相关邮箱'}
        type="warning"
        showIcon
        banner
        style={{ marginBottom: 12 }}
      />
    </Modal>
  );
};

export default TaskSaveToBlack;
