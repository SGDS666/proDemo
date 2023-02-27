import React, { forwardRef, useEffect, useImperativeHandle } from 'react';
import { apiOrgPersonals } from '@/services/search';
import { useRequest } from '@umijs/max';
import { Spin, Table } from 'antd';
import type { ColumnsType } from 'antd/lib/table';
import { LinkOutlined } from '@ant-design/icons';
import { useSetState } from 'ahooks';

interface InfoProps {
  orgId: string;
}
const OrgPersonal: React.FC<InfoProps> = (props, ref) => {
  const { orgId } = props;
  const [state, setState] = useSetState<Record<string, any>>({
    total: 0,
    current: 1,
    pageSize: 10,
    emailsData: [],
    keyword: '',
  });

  const { run, loading, refresh } = useRequest(apiOrgPersonals, {
    debounceInterval: 500,
    onSuccess: (data: any) => {
      if (!data) return;
      const { total, list } = data;
      setState({ emailsData: list, total });
    },
  });

  useImperativeHandle(ref, () => {
    return { flush: refresh };
  });

  const renderLink = (record: any) => {
    const { sourcePage: link } = record;
    if (link) {
      return (
        <a target="_blank" rel="noopener noreferrer" href={link}>
          <LinkOutlined />
        </a>
      );
    }
    return null;
  };

  const columns: ColumnsType<any> = [
    {
      title: '名字',
      key: 'firstName',
      dataIndex: 'firstName',
    },
    {
      title: '姓氏',
      key: 'lastName',
      dataIndex: 'lastName',
    },
    {
      title: '职位',
      key: 'lastName',
      dataIndex: 'position',
    },
    {
      title: '邮箱地址',
      key: 'email',
      dataIndex: 'email',
    },
    {
      title: '来源',
      key: 'link',
      width: 64,
      render: (_: any, record: any) => renderLink(record),
    },
  ];

  const onPageParamsChange = (current: number, pageSize: number) => {
    setState({ current, pageSize });
    run({ orgId, filter: {}, current, pageSize });
  };

  useEffect(() => {
    run({ orgId, filter: {}, current: 1, pageSize: 10 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <Spin spinning={loading} tip="加载中...">
        <div style={{ marginBottom: 12 }}>
          <span style={{ color: '#70757a' }}>每个精准邮箱消耗 2 点</span>
        </div>
        <Table
          columns={columns}
          dataSource={state?.emailsData}
          rowKey="email"
          pagination={{
            position: ['bottomCenter'],
            total: state.total,
            pageSize: state.pageSize,
            current: state.current,
            showTotal: (total) => `精准邮箱数 ${total} `,
            onChange: onPageParamsChange,
          }}
        />
      </Spin>
    </div>
  );
};

export default forwardRef(OrgPersonal);
