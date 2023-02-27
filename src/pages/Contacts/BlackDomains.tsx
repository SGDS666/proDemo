import React, { useEffect } from 'react';
import { Button, Checkbox, DatePicker, Input, message, Modal, Space, Table } from 'antd';
import { useSetState } from 'ahooks';
import RightContainer from '@/components/Global/RightContainer';
import {
  apiBlackDomainsList,
  apiBlackDomainsDelete,
  apiBlackDomainsSave,
} from '@/services/contacts';
import { useRequest } from '@umijs/max';
import { exTimeToDateTime, getDomainsFromString } from '@/utils/common';
import styles from './style.less';
import locale from 'antd/es/date-picker/locale/zh_CN';
import ProCard from '@ant-design/pro-card';

const BlackDomains: React.FC = () => {
  const [state, setState] = useSetState<Record<string, any>>({
    total: 0,
    current: 1,
    pageSize: 10,
    filters: [],
    domainData: [],
    tblSelectKeys: [],
    selectAll: false,
    restoreVisible: false,
    domains: '',
    domainText: '',
    countLoading: false,
    countCount: 0,
  });

  const { run: dataRun, loading } = useRequest(apiBlackDomainsList, {
    manual: true,
    onSuccess: (data: any) => {
      if (!data) return;
      const { current, total, pageSize, list } = data;
      setState({ current, total, pageSize, domainData: list });
    },
  });

  const getData = () => {
    const { current, pageSize, filters, keyword } = state;
    dataRun({ current, pageSize, filters, keyword });
  };

  const { run: saveRun, loading: saveLoading } = useRequest(apiBlackDomainsSave, {
    manual: true,
    onSuccess: (data: any) => {
      if (!data) return;
      const { saved } = data;
      const { domainCount } = state;
      message.success(`提交域名数：${domainCount}, 成功保存：${saved} `);
      if (saved) {
        getData();
      }
      setState({ domainText: '', domains: '', domainCount: 0 });
    },
  });

  const columns = [
    {
      title: '域名',
      dataIndex: 'domain',
      key: 'email',
    },
    {
      title: '创建时间',
      dataIndex: 'create_time',
      key: 'create_time',
      render: (_: any, record: any) => {
        const { create_time } = record;
        return exTimeToDateTime(create_time);
      },
    },
  ];

  const onTblSelectKeysChange = (selectedKeys: any) => {
    setState({ tblSelectKeys: selectedKeys, selectAll: false });
  };

  const onPageParamsChange = (current: number, pageSize: number) => {
    setState({ current, pageSize });
    const { filters } = state;
    dataRun({ current, pageSize, filters });
  };

  const onSelectAll = () => {
    const { domainData } = state;
    const keys = [];
    // eslint-disable-next-line guard-for-in
    for (const idx in domainData) {
      const { _id } = domainData[idx];
      keys.push(_id);
    }
    setState({ tblSelectKeys: keys });
  };

  const onActionSelectChange = (checked: boolean) => {
    if (checked) {
      onSelectAll();
      setState({ selectAll: false });
    } else {
      setState({ tblSelectKeys: [], selectAll: false });
    }
  };

  const reloadContactsTableData = async () => {
    const { current, pageSize, filters, keyword } = state;
    await dataRun({ current, pageSize, filters, keyword });
    setState({ tblSelectKeys: [] });
  };

  const onDateChange = (dates: any) => {
    if (!dates) {
      setState({ filters: {} });
      return;
    }
    const [moment1, moment2] = dates;
    const time1 = moment1.startOf('day').valueOf();
    const time2 = moment2.endOf('day').valueOf();
    setState({ filters: { create_time: { $gte: time1, $lte: time2 } } });
    reloadContactsTableData();
  };

  const { run: deleteRun, loading: deleteLoading } = useRequest(apiBlackDomainsDelete, {
    manual: true,
    onSuccess: () => {
      setState({ restoreVisible: false, selectAll: false, selectKeys: [] });
      reloadContactsTableData();
    },
  });

  const onDomainTextBlur = (value: string) => {
    setState({ countLoading: true, domainCount: 0 });
    const domains = getDomainsFromString(value);
    setState({ domainCount: domains.length, countLoading: false, domains: domains.join('\n') });
  };

  const countDomains = () => {
    setState({ countLoading: true, domainCount: 0 });
    const { domainText } = state;
    const domains = getDomainsFromString(domainText);
    setState({ domainCount: domains.length, countLoading: false, domains: domains.join('\n') });
  };

  const onClickSaveAction = () => {
    const { domainText } = state;
    const domains = getDomainsFromString(domainText);
    saveRun({ domains });
  };

  const onClickDeleteAction = () => {
    const num = state.selectAll ? state.total : state.tblSelectKeys.length;
    const { filters, keyword, tblSelectKeys, selectAll } = state;
    Modal.confirm({
      title: `删除域名数：${num}`,
      content: `确定删除已选中的域名？`,
      onOk: () => deleteRun({ filters, keyword, selectKeys: tblSelectKeys, selectAll }),
    });
  };

  useEffect(() => {
    getData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <RightContainer pageTitle={false} pageGroup="contacts" pageActive="black-domains">
      <ProCard split="vertical" bordered headerBordered>
        <ProCard title={false} colSpan="50%">
          <Space size="large">
            <span>
              <span style={{ fontSize: 16 }}>拉黑时间：</span>
              <DatePicker.RangePicker
                size="large"
                locale={locale}
                onChange={onDateChange}
                showTime={{ format: 'HH:mm' }}
                format="YYYY-MM-DD HH:mm"
              />
            </span>
            <Input.Search
              key="searchKey"
              placeholder="域名关键字"
              enterButton
              style={{ maxWidth: 300, verticalAlign: 'middle' }}
              value={state.keyword}
              onChange={(e) => setState({ keyword: e.target.value })}
              onSearch={() => reloadContactsTableData()}
              size="large"
            />
          </Space>
          <div className={styles['tbl-operator']} hidden={!state.tblSelectKeys.length}>
            <Space size={24}>
              <Checkbox
                indeterminate={state.tblSelectKeys.length !== state.domainData.length}
                checked={state.tblSelectKeys.length > 0}
                onChange={(e) => onActionSelectChange(e.target.checked)}
              />
              <span>
                已选 <a>{state.selectAll ? state.total : state.tblSelectKeys.length}</a>/
                {state.total} 项数据
                <span key="b" style={{ marginLeft: 12 }}>
                  {state.selectAll ? null : (
                    <a
                      onClick={() => {
                        setState({ selectAll: true });
                        onSelectAll();
                      }}
                    >
                      选择全部
                    </a>
                  )}
                </span>
              </span>
              <Button
                key="111"
                size="small"
                type="primary"
                onClick={() => onClickDeleteAction()}
                loading={deleteLoading}
              >
                删除
              </Button>
            </Space>
          </div>
          <Table
            rowKey="_id"
            loading={loading}
            dataSource={state.domainData}
            columns={columns}
            pagination={{
              position: ['bottomCenter'],
              total: state.total,
              pageSize: state.pageSize,
              current: state.current,
              showTotal: (total) => `总纪录数 ${total} `,
              onChange: onPageParamsChange,
            }}
            rowSelection={{
              selectedRowKeys: state.tblSelectKeys,
              onChange: onTblSelectKeysChange,
              columnWidth: 32,
            }}
            showHeader={!state.tblSelectKeys.length}
          />
        </ProCard>
        <ProCard title={false}>
          <div>
            <Input.TextArea
              placeholder="请输入域名文本内容，自动识别"
              rows={10}
              onBlur={(e) => onDomainTextBlur(e.target.value)}
              value={state.domainText}
              onChange={(e) => setState({ domainText: e.target.value })}
            />
          </div>
          <div style={{ marginTop: 24, marginBottom: 24 }}>
            <Input.TextArea placeholder="请输入域名列表" disabled rows={10} value={state.domains} />
          </div>

          <div style={{ paddingLeft: 24 }}>
            <Space size="large">
              <Button
                size="small"
                type="primary"
                onClick={() => countDomains()}
                loading={state.countLoading}
              >
                域名识别
              </Button>
              <span>
                有效域名总数：<a>{state.domainCount}</a>
              </span>
              <Button
                size="small"
                type="primary"
                onClick={() => onClickSaveAction()}
                loading={saveLoading}
                disabled={!state.domainCount}
              >
                保存
              </Button>
            </Space>
          </div>
        </ProCard>
      </ProCard>
    </RightContainer>
  );
};

export default BlackDomains;
