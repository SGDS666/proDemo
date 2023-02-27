import React, { useEffect, useRef, useState } from 'react';
import { Badge, Button, Card, Divider, Menu, Popconfirm } from 'antd';
import RightContainer from '@/components/Global/RightContainer';
import { useSetState } from 'ahooks';
import { useModel, useRequest } from '@umijs/max';
import type { ProColumns } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { RollbackOutlined } from '@ant-design/icons';
import styles from './style.less';
import {
  apiMessageShow,
  apiMessageDetails,
  apiMessagesDelete,
  apiMessagesRead,
} from '@/services/notice';
import { exTimeToDateTime } from '@/utils/common';



const Tasks: React.FC = () => {
  const actionRef = useRef<any>();
  const [hasOrder, setHasOrder] = useState(false);
  const [state, setState] = useSetState<Record<string, any>>({
    selectKey: 'all', // 消息类型
    detailsShow: false, // 显示消息明细
    tblSelectKeys: [],
  });
  const { messageRun, messageData: countData } = useModel('user');

  // const { run: countRun, data: countData } = useRequest(apiMessageCount, { manual: true });

  const {
    run: detailRun,
    data: messageData,
    loading: detailLoading,
  } = useRequest(apiMessageDetails, {
    manual: true,
    onSuccess: (data) => {
      const { status } = data;
      if (status === 0) {
        // countRun();
        messageRun();
        actionRef.current.reload();
      }
    },
  });

  const getMessageDetails = (msgId: string) => {
    detailRun({ msgId });
    setState({ detailsShow: true });
  };

  const columns: ProColumns<any>[] = [
    {
      title: '标题内容',
      dataIndex: 'title',
      valueType: 'text',
      render: (_, record) => {
        const { status, title, _id } = record;
        if (`${status}` === '0') {
          return (
            <a onClick={() => getMessageDetails(_id)}>
              <div className={styles.unreadFont}>
                <Badge status="processing" />
                {title}
              </div>
            </a>
          );
        }
        return (
          <a onClick={() => getMessageDetails(_id)}>
            <div className={styles.readFont}>{title}</div>
          </a>
        );
      },
    },
    {
      title: '创建时间',
      dataIndex: 'create_time',
      hideInSearch: true,
      valueType: 'dateTime',
      width: 180,
      // sortOrder: 'descend',
      // sorter: (a, b) => a.create_time - b.create_time,
    },
    {
      title: '消息类型',
      dataIndex: 'type',
      valueType: 'text',
      width: 180,
      valueEnum: {
        service: { text: '服务消息' },
        activity: { text: '活动消息' },
        security: { text: '安全消息' },
        payment: { text: '充值消息' },
        task: { text: '任务消息' },
        partner: { text: '推广消息' },
      },
    },
  ];

  const actionReload = () => {
    if (actionRef.current) {
      actionRef.current.reload();
    }
  };

  const getTableData = async (params: any, sorter: any, filter: any) => {
    if (!sorter) {
      // eslint-disable-next-line no-param-reassign
      sorter = {};
    }
    if (Object.keys(sorter).length) {
      setHasOrder(true);
    }
    if (!hasOrder && Object.keys(sorter).length === 0) {
      // eslint-disable-next-line no-param-reassign
      sorter = { create_time: 'descend' };
    }
    const { selectKey } = state;
    if (selectKey === 'all') {
      return apiMessageShow({ ...params, sorter, filter });
    }
    return apiMessageShow({ ...params, sorter, filter, type: selectKey });
  };

  const menuOnClick = (key: string) => {
    setState({ selectKey: key });
    actionReload();
  };

  const renderTitle = () => {
    const { selectKey } = state;
    if (selectKey === 'all') {
      if (countData?.total) {
        return `所有消息 ${countData?.total}`;
      }
      return `所有消息`;
    }
    if (selectKey === 'task') {
      if (countData?.task) {
        return `任务消息 ${countData?.task}`;
      }
      return `任务消息`;
    }
    if (selectKey === 'service') {
      if (countData?.service) {
        return `服务消息 ${countData?.service}`;
      }
      return `服务消息`;
    }
    if (selectKey === 'activity') {
      if (countData?.activity) {
        return `活动消息 ${countData?.activity}`;
      }
      return `活动消息`;
    }
    if (selectKey === 'payment') {
      if (countData?.payment) {
        return `充值消息 ${countData?.payment}`;
      }
      return `充值消息`;
    }
    if (selectKey === 'partner') {
      if (countData?.partner) {
        return `推广消息 ${countData?.partner}`;
      }
      return `推广消息`;
    }
    return selectKey;
  };

  const { run: deleteRun, loading: deleteLoading } = useRequest(apiMessagesDelete, {
    manual: true,
    onSuccess: async () => {
      // await countRun();
      messageRun();
      actionReload();
    },
  });

  const confirmDelete = async (selectKeys: any) => {
    const { selectKey } = state;
    await deleteRun({ type: selectKey, msgIds: selectKeys });
    setState({ tblSelectKeys: [] });
  };

  const { run: readRun, loading: readLoading } = useRequest(apiMessagesRead, {
    manual: true,
    onSuccess: async () => {
      // await countRun();
      messageRun();
      actionReload();
    },
  });

  const confirmRead = async (selectKeys: any) => {
    const { selectKey } = state;
    await readRun({ type: selectKey, msgIds: selectKeys });
    setState({ tblSelectKeys: [] });
  };

  const onTblSelectKeysChange = (selectedKeys: any) => {
    setState({ tblSelectKeys: selectedKeys });
  };

  useEffect(() => {
    // countRun();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <RightContainer pageTitle={false} pageGroup="notifications" pageActive="messages">
      <Card style={{ display: !state.detailsShow ? 'none' : '' }}>
        <div>
          <a onClick={() => setState({ detailsShow: false })}>
            <RollbackOutlined /> 返回上级
          </a>
        </div>
        <Divider />
        <Card loading={detailLoading}>
          <h2 style={{ textAlign: 'center' }}>{messageData?.title}</h2>
          <h4 style={{ textAlign: 'center' }}>{exTimeToDateTime(messageData?.create_time)}</h4>
          <Divider />
          <div dangerouslySetInnerHTML={{ __html: messageData?.content }} />
        </Card>
      </Card>
      <Card style={{ display: state.detailsShow ? 'none' : '' }}>
        <div className={styles.main}>
          <div className={styles.leftMenu}>
            <Menu
              mode="inline"
              selectedKeys={[state.selectKey]}
              onClick={({ key }) => menuOnClick(key)}
              items={[
                { key: "all", label: <>所有消息 <Badge count={countData?.total} style={{ backgroundColor: '#2db7f5' }} /> </> },
                { key: "service", label: <>服务消息 <Badge count={countData?.service} style={{ backgroundColor: '#2db7f5' }} /> </> },
                {
                  key: "activity", label: <>活动消息{' '}
                    <Badge count={countData?.activity} style={{ backgroundColor: '#2db7f5' }} /></>
                },
                { key: "payment", label: <>充值消息 <Badge count={countData?.payment} style={{ backgroundColor: '#2db7f5' }} /></> },
                { key: "task", label: <> 任务消息 <Badge count={countData?.task} style={{ backgroundColor: '#2db7f5' }} /></> },
                { key: "partner", label: <>推广消息 <Badge count={countData?.partner} style={{ backgroundColor: '#2db7f5' }} /> </> },
              ]}
            >
           
            </Menu>
          </div>
          <div className={styles.right}>
            <ProTable<any>
              headerTitle={renderTitle()}
              actionRef={actionRef}
              rowKey="_id"
              tableAlertRender={({ selectedRowKeys }) => (
                <div>
                  已选择 <a style={{ fontWeight: 600 }}>{selectedRowKeys.length}</a> 项&nbsp;&nbsp;
                  <Popconfirm
                    title="确认删除选中的消息吗?"
                    onConfirm={() => confirmDelete(selectedRowKeys)}
                  >
                    <Button size="small" loading={deleteLoading}>
                      批量删除
                    </Button>
                  </Popconfirm>
                  &nbsp;&nbsp;
                  <Popconfirm
                    title="确认标记选中的消息为已读吗?"
                    onConfirm={() => confirmRead(selectedRowKeys)}
                  >
                    <Button size="small" loading={readLoading}>
                      标记已读
                    </Button>
                  </Popconfirm>
                </div>
              )}
              request={(params, sorter, filter) => getTableData(params, sorter, filter)}
              columns={columns}
              rowSelection={{
                selectedRowKeys: state.tblSelectKeys,
                onChange: onTblSelectKeysChange,
              }}
              search={false}
            />
          </div>
        </div>
      </Card>
    </RightContainer>
  );
};

export default Tasks;
