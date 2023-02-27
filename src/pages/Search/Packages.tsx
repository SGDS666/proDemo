import RightContainer from '@/components/Global/RightContainer';
import React, { useRef } from 'react';
import { Space, Button, Tag, Menu, Card, theme } from 'antd';
import type { ProColumns, ActionType } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { apiPackageList } from '@/services/expenses';
import styles from './style.less';
import { useSetState } from 'ahooks';
const { useToken } = theme
const Packages: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const [state, setState] = useSetState<Record<string, any>>({
    selectKey: 'effect',
  });
  const { token } = useToken()
  const renderStatus = (record: any) => {
    const { start_time, end_time, count } = record;
    const now = Date.now();
    if (start_time <= now && end_time >= now) {
      if (count > 0) {
        return <Tag color="success">使用中</Tag>;
      } else {
        return <Tag color="default">使用完</Tag>;
      }
    }
    if (start_time > now) {
      return <Tag color="default">未生效</Tag>;
    }
    if (end_time < now) {
      if (count > 0) {
        return <Tag color="error">已过期</Tag>;
      } else {
        return <Tag color="default">使用完</Tag>;
      }
    }
    return null;
  };

  const columns: ProColumns<any>[] = [
    {
      title: '序号',
      dataIndex: 'id',
      valueType: 'indexBorder',
      tip: '序号id,系统自动生成',
    },
    {
      title: '套餐类型',
      dataIndex: 'type',
      valueType: 'text',
      valueEnum: {
        search: { text: '获客点数' },
      },
    },
    {
      title: '总数',
      dataIndex: 'total',
      valueType: 'text',
      search: false,
    },
    {
      title: '剩余',
      dataIndex: 'count',
      valueType: 'text',
      search: false,
    },
    {
      title: '状态',
      dataIndex: 'status',
      valueType: 'text',
      render: (_: any, record: any) => renderStatus(record),
    },
    {
      title: '生效时间',
      dataIndex: 'start_time',
      hideInSearch: true,
      valueType: 'dateTime',
    },
    {
      title: '过期时间',
      dataIndex: 'end_time',
      hideInSearch: true,
      valueType: 'dateTime',
    },
    {
      title: '获得时间',
      dataIndex: 'create_time',
      hideInSearch: true,
      valueType: 'dateTime',
    },
    {
      title: '订单号/管理员',
      dataIndex: 'order_id',
      valueType: 'text',
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
    if (!sorter) {
      // eslint-disable-next-line no-param-reassign
      sorter = {};
    }
    const { selectKey } = state;
    const now = Date.now();
    if (selectKey === 'effect') {
      return apiPackageList({
        ...params,
        sorter,
        count: { $gt: 0 },
        filter: { start_time: { $lte: now }, end_time: { $gte: now } },
      });
    }
    if (selectKey === 'done') {
      return apiPackageList({
        ...params,
        sorter,
        count: { $lte: 0 },
        filter: { start_time: { $lte: now }, end_time: { $gte: now } },
      });
    }
    if (selectKey === 'uneffect') {
      return apiPackageList({ ...params, sorter, filter: { start_time: { $gt: now } } });
    }
    if (selectKey === 'expired') {
      return apiPackageList({ ...params, sorter, filter: { end_time: { $lt: now } } });
    }
    return apiPackageList({ ...params, sorter, filter });
  };
  return (
    <RightContainer pageTitle={false} pageGroup="search" pageActive="packages">
      <Card>
        <div className={styles.main}>
          <div className={`${styles.leftMenu} both-right`} style={{ borderColor: token.colorBorderSecondary }} >
            <Menu
              mode="inline"
              selectedKeys={[state.selectKey]}
              onClick={({ key }) => menuOnClick(key)}
              items={[
                { key: "all", label: "全部" },
                { key: "effect", label: "使用中" },
                { key: "done", label: "使用完" },
                { key: "uneffect", label: "未生效" },
                { key: "expired", label: "已过期" }
              ]}
            >

            </Menu>
          </div>
          <div className={`${styles.right} both-down`}>
            <ProTable<any>
              headerTitle="套餐余额"
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
      </Card>
    </RightContainer>
  );
};

export default Packages;
