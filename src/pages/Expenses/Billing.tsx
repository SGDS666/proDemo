import React, { useRef, useState } from 'react';
import { Menu, Space, Button } from 'antd';
import styles from './style.less';
import { useSetState } from 'ahooks';
import type { ProColumns, ActionType } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { apiBillList } from '@/services/expenses';
import numeral from 'numeral';
import RightContainer from '@/components/Global/RightContainer';


const Billing: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const [hasOrder, setHasOrder] = useState(false);
  const [state, setState] = useSetState<Record<string, any>>({
    mode: 'inline',
    selectKey: 'recharge',
    total: 0,
    readCount: 0,
    unreadCount: 0,
    source: 'recharge',
  });

  const columns: ProColumns<any>[] = [
    {
      title: '序号',
      dataIndex: 'id',
      valueType: 'indexBorder',
      tip: '序号id,系统自动生成',
    },
    {
      title: '账单类型',
      dataIndex: 'source',
      valueType: 'text',
      valueEnum: {
        recharge: { text: '充值到账' },
        create: { text: '任务消耗' },
        return: { text: '任务退回' },
        exchange: { text: '礼包兑换' },
        send: { text: '普通发送' },
        admin: { text: '系统赠送' },
      },
    },
    {
      title: '费用类型',
      dataIndex: 'type',
      valueType: 'text',
      valueEnum: {
        balance: { text: '余额' },
        sendCount: { text: '群发资源包' },
        search: { text: '获客点数' },
      },
    },
    {
      title: '费用',
      dataIndex: 'count',
      render: (_, record) => {
        const { type, count } = record;
        let symbol = '';
        if (count > 0) {
          symbol = '+';
        }
        if (type === 'balance') {
          return `${symbol + numeral(count / 1000).format('0,0.00')} 元`;
        }
        return symbol + count;
      },
    },
    {
      title: '提示',
      dataIndex: 'message',
      valueType: 'text',
    },
    {
      title: '账单时间',
      dataIndex: 'create_time',
      hideInSearch: true,
      valueType: 'dateTime',
      sorter: (a, b) => a.create_time - b.create_time,
    },
  ];

  const actionReload = () => {
    if (actionRef.current) {
      actionRef.current.reload();
    }
  };

  const menuOnClick = (key: string) => {
    setState({ selectKey: key });
    if (key === 'all') {
      setState({ source: undefined });
    } else {
      setState({ source: key });
    }
    actionReload();
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
    const { source } = state;
    return apiBillList({ ...params, sorter, filter, source });
  };

  return (
    <RightContainer pageTitle={false} pageGroup="expenses" pageActive="billing">
      <div className={styles.main} style={{ overflow: "hidden" }}>
        <div className={`${styles.leftMenu} both-right`} >
          <Menu
            mode="inline"
            selectedKeys={[state.selectKey]}
            onClick={({ key }) => menuOnClick(key)}
            items={
              [
                { key: "all", label: "全部账单" },
                { key: "recharge", label: "充值到账" },
                { key: "exchange", label: "礼包兑换" },
                { key: "create", label: "任务消耗" },
                { key: "send", label: "普通发送" },
                { key: "return", label: "任务退回" },
              ]
            }
          >

          </Menu>
        </div>
        <div className={`${styles.right} both-down`}>
          <ProTable<any>
            headerTitle="账单列表"
            actionRef={actionRef}
            rowKey="_id"
            toolBarRender={(action, { selectedRows }) => [
              selectedRows && selectedRows.length > 0 && (
                <Space key="skey">
                  <Button key="333">批量删除</Button>
                </Space>
              ),
            ]}
            tableAlertRender={({ selectedRowKeys }) => (
              <div>
                已选择 <a style={{ fontWeight: 600 }}>{selectedRowKeys.length}</a> 项&nbsp;&nbsp;
              </div>
            )}
            request={(params, sorter, filter) => getTableData(params, sorter, filter)}
            columns={columns}
            search={false}
            pagination={{
              pageSize: 10,
              showQuickJumper: false,
            }}
          />
        </div>
      </div>
    </RightContainer>
  );
};

export default Billing;
