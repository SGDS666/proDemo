import RightContainer from '@/components/Global/RightContainer';
import React, { useRef, useState } from 'react';
import { Menu, Space, Button } from 'antd';
import styles from './style.less';
import { useSetState } from 'ahooks';
import type { ProColumns, ActionType } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { apiOrderList } from '@/services/expenses';


const Orders: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const [hasOrder, setHasOrder] = useState(false);
  const [state, setState] = useSetState<Record<string, any>>({
    mode: 'inline',
    selectKey: 'pay',
    total: 0,
    readCount: 0,
    unreadCount: 0,
    status: 1,
  });

  const columns: ProColumns<any>[] = [
    {
      title: '序号',
      dataIndex: 'id',
      valueType: 'indexBorder',
      tip: '序号id,系统自动生成',
    },
    {
      title: '订单号',
      dataIndex: 'order_id',
      valueType: 'text',
    },
    {
      title: '订单类型',
      dataIndex: 'goods_type',
      valueType: 'text',
      valueEnum: {
        balance: { text: '充值余额' },
        sendCount: { text: '群发套餐' },
        searchMonth: { text: '获客月套餐' },
        searchYear: { text: '获客年套餐' },
        newYear: { text: '首充套餐' },
      },
    },
    {
      title: '订单内容',
      dataIndex: 'subject',
      valueType: 'text',
    },
    {
      title: '状态',
      dataIndex: 'status',
      valueType: 'text',
      valueEnum: {
        0: { text: '未付款', status: 'Default' },
        1: { text: '付款成功', status: 'Success' },
      },
    },
    {
      title: '支付应用',
      dataIndex: 'app',
      valueType: 'text',
      valueEnum: {
        wechat: { text: '微信' },
        alipay: { text: '支付宝' },
      },
    },
    {
      title: '创建时间',
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
      setState({ status: undefined });
    }
    if (key === 'pay') {
      setState({ status: 1 });
    }
    if (key === 'unpay') {
      setState({ status: 0 });
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
    const { status } = state;
    return apiOrderList({ ...params, sorter, filter, status });
  };
  return (
    <RightContainer pageTitle={false} pageGroup="expenses" pageActive="orders">
      <div className={styles.main} style={{ overflow: "hidden" }}>
        <div className={`${styles.leftMenu} both-right`}>
          <Menu
            mode={state.mode}
            selectedKeys={[state.selectKey]}
            onClick={({ key }) => menuOnClick(key)}
            items={[
              { key: "all", label: "全部订单" },
              { key: "pay", label: "已支付订单" },
              { key: "unpay", label: "未支付订单" }
            ]}
          >

          </Menu>
        </div>
        <div className={`${styles.right} both-down`}>
          <ProTable<any>
            headerTitle="订单列表"
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

export default Orders;
