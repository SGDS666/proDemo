import React, { useRef } from 'react';
import { Menu, Row, Col, Button } from 'antd';
import type { ProColumns, ActionType } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import styles from './style.less';
import { useSetState } from 'ahooks';
import { apiTaskLogs } from '@/services/tasks';
import SendDetails from './SendDetails';
import SetTagsModal from './SetTagsModal';

interface ParamProps {
  task: any;
}
const Span: React.FC<{ name: string, count: number }> = ({ name, count }) => {
  return (
    <Row>
      <Col span={18}>
        <span>{name}</span>
      </Col>
      <Col span={6}>
        <span>{count}</span>
      </Col>
    </Row>
  )
}
const Recipients: React.FC<ParamProps> = (props) => {
  const actionRef = useRef<ActionType>();
  const { task } = props;
  const [state, setState] = useSetState<Record<string, any>>({
    loading: false,
    selectKey: 'delivered',
    detailsVisible: false,
    current: {},
    tagsCount: 0,
    setTagsVisible: false,
    logsTotal: 0,
    changeType: 'add',
  });

  const {
    gtid,
    total_count,
    send_count,
    error_count,
    opened_num,
    clicked_num,
    bounced_count,
    unsubscribed,
    spamreports,
    notsent_count,
    reply_num,
  } = task;
  // setState({ total_count, send_count, error_count, opened_count, clicked_count });

  const columns: ProColumns<any>[] = [
    {
      title: '序号',
      dataIndex: 'id',
      valueType: 'indexBorder',
      tip: '序号id,系统自动生成',
    },
    {
      title: '发信地址',
      dataIndex: 'from',
      valueType: 'text',
    },
    {
      title: '收信地址',
      dataIndex: 'to',
      valueType: 'text',
    },
    {
      title: '阅读次数',
      dataIndex: 'read_num',
      sorter: (a, b) => a.read_num - b.read_num,
      sortDirections: ['descend', 'ascend'],
    },
    {
      title: '点击次数',
      dataIndex: 'click_num',
      sorter: (a, b) => a.click_num - b.click_num,
      sortDirections: ['descend', 'ascend'],
    },
    {
      title: '发送时间',
      dataIndex: 'create_time',
      hideInSearch: true,
      valueType: 'dateTime',
      // sortOrder: 'descend',
      // sorter: (a, b) => a.create_time - b.create_time,
    },
    {
      title: '操作',
      dataIndex: 'option',
      valueType: 'option',
      render: (_, record) => (
        <>
          <a onClick={() => setState({ detailsVisible: true, current: record })}>更多信息</a>
        </>
      ),
    },
  ];

  const actionReload = () => {
    if (actionRef.current) {
      actionRef.current.reload();
    }
  };

  const menuOnClick = (key: string) => {
    setState({ selectKey: key });
    actionReload();
  };

  const getTableData = async (params: any, sorter: any, filter: any) => {
    const { selectKey } = state;
    // eslint-disable-next-line no-param-reassign
    filter = { ...filter, gtid, status: selectKey };
    const data = await apiTaskLogs({ ...params, sorter, filter });
    setState({ logsTotal: data.total });
    return data;
  };

  const setTaskSendTags = async (type: string) => {
    setState({ setTagsVisible: true, changeType: type });
  };

  const renderTitle = () => {
    const { selectKey } = state;
    if (selectKey === 'total') {
      return `发送 ${total_count}`;
    }
    if (selectKey === 'error') {
      return `失败 ${error_count}`;
    }
    if (selectKey === 'delivered') {
      return `送达 ${send_count}`;
    }
    if (selectKey === 'opened') {
      return `阅读 ${opened_num}`;
    }
    if (selectKey === 'reply') {
      return `回复 ${reply_num}`;
    }
    if (selectKey === 'clicked') {
      return `点击 ${clicked_num}`;
    }
    if (selectKey === 'bounced') {
      return `退信 ${bounced_count}`;
    }
    if (selectKey === 'unsubscribed') {
      return `退订 ${unsubscribed}`;
    }
    if (selectKey === 'spamreports') {
      return `投诉 ${spamreports}`;
    }
    if (selectKey === 'notsent') {
      return `未发送 ${notsent_count}`;
    }
    return null;
  };

  return (
    <div className={styles.main}>
      <div className={styles.leftMenu}>
        <Menu
          mode="inline"
          selectedKeys={[state.selectKey]}
          onClick={({ key }) => menuOnClick(key)}
          items={
            [
              {
                key: "total",
                label: <Span name='发送' count={total_count} />

              },
              {
                key: "error",
                label: <Span name='失败' count={error_count} />
              },
              {
                key: "delivered",
                label: <Span name='送达' count={send_count} />

              },
              {
                key: "opened",
                label: <Span name='阅读' count={opened_num} />


              },
              {
                key: "clicked",
                label: <Span name='点击' count={clicked_num} />

              },
              {
                key: "bounced",
                label: <Span name='退信' count={bounced_count} />

              },
              {
                key: "unsubscribed",
                label: <Span name='退订' count={unsubscribed} />

              },
              {
                key: "spamreports",
                label: <Span name='投诉' count={spamreports} />


              },
              {
                key: "notsent",
                label: <Span name='未发送' count={notsent_count} />

              }
            ]
          }
        >
        </Menu>
      </div>
      <div className={styles.right}>
        <ProTable<any>
          headerTitle={renderTitle()}
          actionRef={actionRef}
          rowKey="to"
          toolBarRender={() =>
            state.logsTotal
              ? [
                <Button key="addTags" type="primary" onClick={() => setTaskSendTags('add')}>
                  贴标签
                </Button>,
                <Button key="delTags" onClick={() => setTaskSendTags('remove')}>
                  撕标签
                </Button>,
              ]
              : []
          }
          tableAlertRender={({ selectedRowKeys }) => (
            <div>
              已选择 <a style={{ fontWeight: 600 }}>{selectedRowKeys.length}</a> 项&nbsp;&nbsp;
            </div>
          )}
          request={(params, sorter, filter) => getTableData(params, sorter, filter)}
          columns={columns}
          rowSelection={false}
          search={false}
        />
      </div>
      <SendDetails
        visible={state.detailsVisible}
        onCancel={() => setState({ detailsVisible: false })}
        current={state.current}
      />
      <SetTagsModal
        visible={state.setTagsVisible}
        onCancel={() => setState({ setTagsVisible: false })}
        changeType={state.changeType}
        setCount={state.logsTotal}
        gtid={gtid}
        status={state.selectKey}
      />
    </div>
  );
};

export default Recipients;
