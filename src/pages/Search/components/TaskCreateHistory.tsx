import React, { useEffect } from 'react';
import { Modal, Table, Input, message, Radio, Spin } from 'antd';
import { apiOperationHistory } from '@/services/operation';
import { useModel, useRequest } from '@umijs/max';
import { useSetState } from 'ahooks';

interface CreateFormProps {
  visible: boolean;
  onCancel: () => void;
  actionReload: (val: any) => void;
  hisId: string;
}

const TaskCreateHistory: React.FC<CreateFormProps> = (props) => {
  const { visible, onCancel, actionReload, hisId } = props;
  const [state, setState] = useSetState<Record<string, any>>({
    operationData: [],
    current: 1,
    pageSize: 10,
    total: 0,
    filter: { operation: 'SearchTaskCreate' },
  });
  const { run: historyRun } = useRequest(apiOperationHistory, { manual: true });
  const { initialState } = useModel('@@initialState');

  useEffect(() => {
    if (visible) {
      historyRun({ current: 1, pageSize: 10, filter: { operation: 'SearchTaskCreate' } });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  if (!initialState) {
    return <Spin size="large">未登录</Spin>;
  }
  const { uid, userid, teamIds } = initialState.currentUser;

  const onFinishAction = async (values: any) => {};

  const renderType = (item: any) => {};

  const renderPlatform = (item: any) => {};

  const columns: any = [
    {
      title: '备注',
      dataIndex: 'comment',
      key: 'comment',
      render: (text: string) => <a>{text}</a>,
    },
    {
      title: '使用时间',
      dataIndex: 'update_time',
      key: 'update_time',
    },
  ];

  return (
    <Modal
      destroyOnClose
      title="搜索历史任务纪录"
      open={visible}
      onCancel={() => onCancel()}
      footer={null}
      maskClosable={false}
    >
      <Table columns={columns} dataSource={state.operationData} />
    </Modal>
  );
};

export default TaskCreateHistory;
