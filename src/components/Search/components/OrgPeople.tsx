import React, { useEffect } from 'react';
import { apiOrgPeople } from '@/services/search';
import { useRequest } from '@umijs/max';
import { Input, Spin, Table } from 'antd';
import { LinkedinOutlined, MailOutlined } from '@ant-design/icons';
import { useSetState } from 'ahooks';

interface InfoProps {
  orgId: string;
}
const OrgPeople: React.FC<InfoProps> = (props) => {
  const { orgId } = props;
  const [state, setState] = useSetState<Record<string, any>>({
    total: 0,
    current: 1,
    pageSize: 10,
    peopleData: [],
    keyword: '',
  });

  const { run, loading } = useRequest(apiOrgPeople, {
    debounceInterval: 500,
    onSuccess: (data: any) => {
      if (!data) return;
      const { total, list } = data;
      setState({ peopleData: list, total });
    },
  });

  const renderCountryFlag = (record: any) => {
    const { countryCode } = record;
    if (!countryCode) return null;
    return (
      <img src={`https://files.laifaxin.com/flags/countries_flags/${countryCode}.png`} width={24} />
    );
  };

  const renderSocial = (record: any) => {
    if (!record) return null;
    const { linkedin_url, zoominfo_url } = record;
    if (linkedin_url) {
      return (
        <a target="_blank" rel="noopener noreferrer" href={linkedin_url}>
          <h3>
            <LinkedinOutlined />
          </h3>
        </a>
      );
    }
    if (zoominfo_url) {
      return (
        <a target="_blank" rel="noopener noreferrer" href={zoominfo_url}>
          <h3>🅉</h3>
        </a>
      );
    }
    return null;
  };

  const columns = [
    {
      title: '名字',
      dataIndex: 'peoName',
      render: (text: string) => <a>{text}</a>,
    },
    {
      title: '职位',
      dataIndex: 'position',
    },
    {
      title: '',
      dataIndex: 'countryCode',
      render: (_: any, record: any) => renderCountryFlag(record),
    },
    {
      title: '地址',
      dataIndex: 'location',
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      render: () => (
        <a>
          <MailOutlined />
        </a>
      ),
    },
    {
      title: '社媒',
      key: 'linkedin_id',
      width: 48,
      render: (_: any, record: any) => renderSocial(record),
    },
  ];

  const getPeopleData = () => {
    const { current, pageSize, keyword } = state;
    run({ orgId, keyword, filter: {}, current, pageSize });
  };

  const onPageParamsChange = (current: number, pageSize: number) => {
    setState({ current, pageSize });
    run({ orgId, keyword: '', filter: {}, current, pageSize });
  };

  useEffect(() => {
    getPeopleData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <Spin spinning={loading} tip="加载中...">
        <Input.Search
          key="searchKey"
          placeholder="搜索关键词(职位、名字)"
          onSearch={getPeopleData}
          onChange={(e) => setState({ keyword: e.target.value })}
          enterButton
          style={{ width: 360, marginBottom: 12, verticalAlign: 'middle' }}
        />
        <Table
          columns={columns}
          dataSource={state.peopleData}
          size="small"
          rowKey="peoId"
          pagination={{
            position: ['bottomCenter'],
            total: state.total,
            pageSize: state.pageSize,
            current: state.current,
            showTotal: (total) => `员工资料数 ${total} `,
            onChange: onPageParamsChange,
          }}
        />
      </Spin>
    </div>
  );
};

export default OrgPeople;
