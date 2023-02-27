import React, { useRef } from 'react';
import RightContainer from '@/components/Global/RightContainer';
import { apiOperationsShow } from '@/services/enterprise';
import type { ActionType, ProColumns } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';

const EnterpriseOpenrations: React.FC = () => {
  const actionRef = useRef<ActionType>();

  const columns: ProColumns<API.RuleListItem>[] = [
    {
      title: '用户ID',
      dataIndex: 'uid',
    },
    {
      title: '呢称',
      dataIndex: 'nickname',
    },
    {
      title: '功能类型',
      dataIndex: '',
    },
    {
      title: '操作内容',
      dataIndex: 'content',
      hideInSearch: true,
    },
    {
      title: '时间时间',
      dataIndex: 'create_time',
      valueType: 'dateTime',
      hideInSearch: true,
    },
  ];

  return (
    <RightContainer pageTitle={false} pageGroup="enterprise" pageActive="openrations">
      <ProTable<API.RuleListItem, API.PageParams>
        headerTitle={'日志列表'}
        actionRef={actionRef}
        rowKey="_id"
        search={{
          labelWidth: 120,
        }}
        request={apiOperationsShow}
        columns={columns}
        rowSelection={false}
      />
    </RightContainer>
  );
};

export default EnterpriseOpenrations;
