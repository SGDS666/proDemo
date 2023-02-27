import React, { useEffect } from 'react';
import {
  Card,
  Table,
  Space,
  Button,
  Checkbox,
  Input,
  Row,
  Col,
  Typography,
  Divider,
  Dropdown,
  message,
  Popover,
  Tooltip,
  Badge,
} from 'antd';
import {
  DownOutlined,
  EyeTwoTone,
  FilterFilled,
  LeftOutlined,
  SaveOutlined,
  UserAddOutlined,
  UserDeleteOutlined,
} from '@ant-design/icons';
import { apiDomainCancelBlack, apiDomainSaveBlack, apiSearchDomainList } from '@/services/search';
import { useRequest } from '@umijs/max';
import { useSetState } from 'ahooks';
import styles from '../style.less';
import DomainDetails from '@/components/Search/DomainDetails';
import TaskSaveToContacts from './TaskSaveToContacts';
import TaskSaveToBlack from './TaskSaveToBlack';
import DomainSaveToContatcs from '@/components/Search/DomainSaveToContacts';
import TaskSaveCancelBlack from './TaskSaveCancelBlack';
import { apiViewConfig, apiViewSave } from '@/services/views';
import DomainFilters from './DomainFilters';
import ViewCreate from '@/components/Search/ViewCreate';
import RcResizeObserver from 'rc-resize-observer';
const { Text } = Typography;

interface FormProps {
  taskInfo: any;
  setStep: (step: string) => void;
  viewId: string;
  createReload: (params?:any) => void;
}

const TaskDomains: React.FC<FormProps> = (props) => {
  const { taskInfo, setStep, viewId, createReload } = props;
  const { task_id } = taskInfo;
  const [state, setState] = useSetState<Record<string, any>>({
    countryCode: undefined,
    keyword: undefined,
    pageSize: 10,
    orgData: [],
    total: 0,
    current: 1,
    sort: {},
    selectKeys: [],
    selectAll: false,
    step: 'task', // task | org | people
    domainDetailsVisible: false,
    domainInfo: {},
    saveContactsVisible: false,
    saveInitValues: {},
    saveBlackVisible: false,
    domainValues: {},
    domainSaveVisible: false,
    cancelBlackVisible: false,
    logic: 'and', // 视图逻辑
    filters: [], // 视图过滤条件
    viewCreateVisible: false,
    viewOwner: '',
    viewSaveVisible: false,
    viewConfig: {},
    scrollY: 600,
  });

  const { run: orgListRun, loading: orgListLoading } = useRequest(apiSearchDomainList, {
    manual: true,
    onSuccess: (data: any) => {
      if (!data) return;
      const { total, list, current, pageSize } = data;
      setState({ orgData: list, total, current, pageSize });
    },
  });

  const getTaskDomainsData = () => {
    const { keyword, countryCode, current, pageSize, filters, sort, logic } = state;
    orgListRun({
      task_id,
      keyword,
      filter: { countryCode },
      current,
      pageSize,
      sort,
      filters,
      logic,
    });
  };

  const onTblChange = (pagination: any, filters: any, sorter: any) => {
    const { current, pageSize } = pagination;
    const sort: any = {};
    const { field, order } = sorter;
    if (order === 'ascend') {
      sort[field] = 1;
    } else if (order === 'descend') {
      sort[field] = -1;
    }
    setState({ sort });
    const { keyword, filters: viewFilters, logic } = state;
    orgListRun({
      task_id,
      keyword,
      filter: {},
      filters: viewFilters,
      logic,
      current,
      pageSize,
      sort,
    });
  };

  const { run: saveBlackRun } = useRequest(apiDomainSaveBlack, {
    manual: true,
    onSuccess: () => {
      message.success('拉入黑名单成功');
      getTaskDomainsData();
    },
  });

  const { run: cancelBlackRun } = useRequest(apiDomainCancelBlack, {
    manual: true,
    onSuccess: () => {
      message.success('移出黑名单成功');
      getTaskDomainsData();
    },
  });

  const renderDisplayMore = (record: any) => {
    const { domain, black } = record;
    return (
      <>
        <a onClick={() => setState({ domainInfo: record, domainDetailsVisible: true })}>详情</a>
        <Divider type="vertical" style={{ marginLeft: 12, marginRight: 12 }} />
        {domain ? (
          <Dropdown 
          menu={{
            items: black ?
              [
                {
                  key: "save",
                  icon: <SaveOutlined />,
                  label: "保存邮箱",
                  onClick: () => setState({ domainSaveVisible: true, domainValues: { domain } })
                },
                {
                  key: "cancelBlack",
                  icon: <UserDeleteOutlined />,
                  label: "移出黑名单",
                  onClick: () => cancelBlackRun({ domain })
                }
              ]

              :

              [
                {
                  key: "saveBlack",
                  label: "拉入黑名单",
                  icon: <UserAddOutlined />,
                  onClick: () => saveBlackRun({ domain })
                }
              ]
          }}
          >
            <a>
              更多 <DownOutlined />
            </a>
          </Dropdown>
        ) : null}
      </>
    );
  };

  const renderDomain = (record: any) => {
    const { domain, black } = record;
    if (!domain) {
      return null;
    }
    let url = domain;
    if (url.indexOf('http') < 0) {
      url = `http://${domain}`;
    }
    const popImg = (
      <Popover
        content={
          <img src={`https://image.thum.io/get/auth/64495/${url}`} width={512} height={512} />
        }
        title={false}
        placement="right"
      >
        <EyeTwoTone style={{ fontSize: 16 }} />
      </Popover>
    );
    const popLogo = (
      <Popover
        content={<img src={`https://ico.laifaxin.com/ico/${domain}`} />}
        title={false}
        placement="right"
      >
        <img src={`https://ico.laifaxin.com/ico/${domain}`} width={24} height={24} />
      </Popover>
    );
    if (black) {
      return (
        <Space>
          {popImg}
          {popLogo}
          <Text delete>{domain}</Text>
        </Space>
      );
    }
    return (
      <Space>
        {popImg}
        {popLogo}
        <a target="_blank" rel="noopener noreferrer" href={url}>
          {domain}
        </a>
      </Space>
    );
  };

  const renderSaveStatus = (item: any) => {
    const { saveTotal, savePersonal, saveGeneric } = item;
    if (saveTotal > 0) {
      return (
        <Tooltip
          title={
            <>
              <div>
                精准邮箱已保存数量：<a>{savePersonal}</a>
              </div>
              <div>
                通用邮箱已保存数量：<a>{saveGeneric}</a>
              </div>
            </>
          }
        >
          <Badge color="blue" />
        </Tooltip>
      );
    }
    return null;
  };

  const orgColumns = [
    {
      title: '',
      dataIndex: 'domain',
      render: (_: any, record: any) => renderSaveStatus(record),
      search: false,
      width: 24,
    },
    {
      title: '域名',
      dataIndex: 'domain',
      render: (_: any, record: any) => renderDomain(record),
      sorter: (a: any, b: any) => a.domain - b.domain,
      search: false,
      ellipsis: true,
      width: 200,
    },
    {
      title: '精准邮箱',
      dataIndex: 'personal',
      sorter: (a: any, b: any) => a.personal - b.personal,
      width: 108,
      search: false,
    },
    {
      title: '普通邮箱',
      dataIndex: 'generic',
      sorter: (a: any, b: any) => a.generic - b.generic,
      width: 108,
      search: false,
    },
    {
      title: '谷歌收录数',
      dataIndex: 'gg_total',
      sorter: (a: any, b: any) => a.gg_total - b.gg_total,
      width: 128,
      search: false,
    },
    {
      title: '官网标题',
      dataIndex: 'gg_title',
      search: false,
      ellipsis: true,
      width: 250,
    },
    {
      title: '网站描述',
      dataIndex: 'gg_desc',
      search: false,
      ellipsis: true,
      width: 500,
    },
    {
      title: '更多',
      dataIndex: 'result',
      width: 156,
      render: (_: any, record: any) => renderDisplayMore(record),
    },
  ];

  const onOrgSelectKeysChange = (selectedKeys: any) => {
    setState({ selectKeys: selectedKeys, selectAll: false });
  };

  const onSelectAll = () => {
    const { orgData } = state;
    const keys = [];
    // eslint-disable-next-line guard-for-in
    for (const idx in orgData) {
      const { domain } = orgData[idx];
      keys.push(domain);
    }
    setState({ selectKeys: keys });
  };

  const onOrgActionSelectChange = (checked: boolean) => {
    if (checked) {
      onSelectAll();
      setState({ selectAll: false });
    } else {
      setState({ selectKeys: [], selectAll: false });
    }
  };

  const onClickSaveAction = () => {
    const { keyword, selectAll, selectKeys, orgData, total, filters, logic } = state;
    const selectOrgs = [];
    if (!selectAll) {
      // eslint-disable-next-line guard-for-in
      for (const idx in selectKeys) {
        const index = orgData.findIndex((o: any) => o.domain === selectKeys[idx]);
        const { domain } = orgData[index];
        selectOrgs.push({ domain });
      }
    }
    const selectNum = selectAll ? total : selectKeys.length;
    const values = {
      task_id,
      selectNum,
      selectAll,
      selectOrgs,
      keyword,
      filter: {},
      filters,
      logic,
      type: 'domain',
    };
    setState({ saveContactsVisible: true, saveInitValues: values });
  };

  const onFinishSaveBlack = () => {
    setState({ selectKeys: [], selectAll: false });
    getTaskDomainsData();
  };

  const onClickBlackAction = () => {
    const { keyword, selectAll, selectKeys, orgData, total, filters } = state;
    const selectOrgs = [];
    if (!selectAll) {
      // eslint-disable-next-line guard-for-in
      for (const idx in selectKeys) {
        const index = orgData.findIndex((o: any) => o.domain === selectKeys[idx]);
        const { domain } = orgData[index];
        selectOrgs.push({ domain });
      }
    }
    const selectNum = selectAll ? total : selectKeys.length;
    const values = { task_id, selectNum, selectAll, selectOrgs, keyword, filter: {}, filters };
    setState({ saveBlackVisible: true, saveInitValues: values });
  };

  const onClickCancelBlackAction = () => {
    const { keyword, selectAll, selectKeys, orgData, total, filters } = state;
    const selectOrgs = [];
    if (!selectAll) {
      // eslint-disable-next-line guard-for-in
      for (const idx in selectKeys) {
        const index = orgData.findIndex((o: any) => o.domain === selectKeys[idx]);
        const { domain } = orgData[index];
        selectOrgs.push({ domain });
      }
    }
    const selectNum = selectAll ? total : selectKeys.length;
    const values = { task_id, selectNum, selectAll, selectOrgs, keyword, filter: {}, filters };
    setState({ cancelBlackVisible: true, saveInitValues: values });
  };

  const onFilterApplyAction = async (vals: any, index: any, act: 'add' | 'update' | 'delete') => {
    const { filters } = state;
    if (act === 'add') {
      filters.push(vals);
    } else if (act === 'update') {
      if (index >= 0) {
        filters[index] = vals;
      } else {
        filters.push(vals);
      }
    } else {
      filters.splice(index, 1);
    }
    setState({ filters, viewSaveVisible: true });
    getTaskDomainsData();
  };

  const onLogicChangeAction = async (logic: string) => {
    setState({ logic, viewSaveVisible: true, current: 1 });
    const { keyword, countryCode, pageSize, filters, sort } = state;
    orgListRun({
      task_id,
      keyword,
      filter: { countryCode },
      current: 1,
      pageSize,
      sort,
      filters,
      logic,
    });
  };

  const { run: viewConfigRun } = useRequest(apiViewConfig, {
    manual: true,
    onSuccess: (data: any) => {
      if (!data) return;
      const { filters, viewOwner, logic } = data;
      setState({
        logic,
        filters,
        current: 1,
        pageSize: 10,
        viewOwner,
        keyword: '',
        viewConfig: data,
        viewSaveVisible: false,
      });
      orgListRun({
        task_id,
        keyword: '',
        filter: {},
        filters,
        logic,
        current: 1,
        pageSize: 10,
        sort: {},
      });
    },
  });

  useEffect(() => {
    if (task_id && viewId) {
      viewConfigRun({ viewId });
      setState({ selectKeys: [] });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewId, task_id]);

  const { run: viewSaveRun, loading: viewSaveLoading } = useRequest(apiViewSave, {
    manual: true,
    onSuccess: () => {
      message.success('保存成功');
      setState({ viewSaveVisible: false });
    },
  });

  const onSaveViewAction = () => {
    const { filters, logic } = state;
    viewSaveRun({ viewId, filters, logic });
  };

  const saveViewContent = () => {
    let canSave = false;
    if (state.viewOwner) {
      canSave = true;
    }
    if (canSave) {
      return (
        <div style={{ width: 300 }}>
          <h3>可编辑视图</h3>
          <div>此视图由您创建。您可以将筛选条件保存到此视图。</div>
          <div style={{ marginTop: 12, marginBottom: 12 }}>
            <Button
              onClick={onSaveViewAction}
              loading={viewSaveLoading}
              style={{ backgroundColor: 'lightgrey' }}
            >
              保存
            </Button>
            <Button style={{ marginLeft: 24 }} onClick={() => viewConfigRun({ viewId })}>
              重置
            </Button>
          </div>
          <a
            style={{ textDecoration: 'underline', marginBottom: 12 }}
            onClick={() => setState({ viewCreateVisible: true })}
          >
            另存为新视图
          </a>
        </div>
      );
    }
    return (
      <div style={{ width: 300 }}>
        <h3>只读视图</h3>
        <div>这是一个系统标准视图或由其他创建。另存为新视图以保留您的更改。</div>
        <div style={{ marginTop: 12, marginBottom: 12 }}>
          <Button disabled>保存</Button>
          <Button style={{ marginLeft: 24 }} onClick={() => viewConfigRun({ viewId })}>
            重置
          </Button>
        </div>
        <a
          style={{ textDecoration: 'underline', marginBottom: 12 }}
          onClick={() => setState({ viewCreateVisible: true })}
        >
          另存为新视图
        </a>
      </div>
    );
  };

  const renderTotal = (total: number) => {
    return (
      <div style={{ fontWeight: 'bold' }}>
        企业数量 <a>{total}</a>
      </div>
    );
  };

  return (
    <div>
      <Card>
        <Row>
          <Col span={18}>
            <Space size="large">
              <Button
                onClick={() => {
                  setStep('task');
                  setState({
                    selectKeys: [],
                    selectAll: false,
                    current: 1,
                    keyword: '',
                    filterVisible: false,
                  });
                }}
              >
                <LeftOutlined /> 返回
              </Button>
              <Input.Search
                key="searchKey"
                placeholder="关键词(域名)"
                onSearch={getTaskDomainsData}
                onChange={(e) => setState({ keyword: e.target.value })}
                value={state.keyword}
                enterButton
                style={{ minWidth: 256, verticalAlign: 'middle' }}
              />
              {state.filters.length ? (
                <div style={{ height: 32, backgroundColor: 'lightgrey' }}>
                  <Button type="text" onClick={() => setState({ filterVisible: true })}>
                    <span className={styles['filter-item']} style={{ fontWeight: 'bold' }}>
                      <FilterFilled /> 筛选 ({state.filters.length})
                    </span>
                  </Button>
                </div>
              ) : (
                <Button type="text" onClick={() => setState({ filterVisible: true })}>
                  <span className={styles['filter-item']}>
                    <FilterFilled /> 筛选
                  </span>
                </Button>
              )}
              {state.viewSaveVisible ? (
                <Popover
                  content={saveViewContent}
                  title={false}
                  trigger="click"
                  placement="bottomRight"
                >
                  <Button type="link">保存</Button>
                </Popover>
              ) : null}
            </Space>
          </Col>
          <Col span={6} style={{ textAlign: 'right' }}>
            <Space size="large">
              {state.selectKeys.length ? (
                <Button key="111" onClick={() => onClickSaveAction()} type="primary">
                  保存到联系人
                </Button>
              ) : (
                <Button key="key1122" onClick={() => onOrgActionSelectChange(true)} type="primary">
                  <SaveOutlined /> 保存邮箱
                </Button>
              )}
            </Space>
          </Col>
        </Row>
      </Card>
      <div className={styles['tbl-operator']} hidden={!state.selectKeys.length}>
        <Space size={24}>
          <Checkbox
            indeterminate={state.selectKeys.length !== state.orgData.length}
            checked={state.selectKeys.length}
            onChange={(e) => onOrgActionSelectChange(e.target.checked)}
          />
          <span>
            已选 <a>{state.selectAll ? state.total : state.selectKeys.length}</a>/{state.total}{' '}
            个域名
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
          <Button key="111" onClick={() => onClickSaveAction()} size="small" type="primary">
            保存到联系人
          </Button>
          <Button key="222" onClick={() => onClickBlackAction()} size="small">
            拉入黑名单
          </Button>
          <Button key="cancelBlack" onClick={() => onClickCancelBlackAction()} size="small">
            取消黑名单
          </Button>
        </Space>
      </div>
      <RcResizeObserver
        key="resize-observer"
        onResize={() => {
          const { innerHeight } = window;
          if (innerHeight >= 500) {
            const scrollY = innerHeight - 412;
            setState({ scrollY });
          }
        }}
      >
        <Table
          loading={orgListLoading}
          rowKey="domain"
          dataSource={state.orgData}
          columns={orgColumns}
          showHeader={!state.selectKeys.length}
          pagination={{
            position: ['bottomCenter'],
            total: state.total,
            pageSize: state.pageSize,
            current: state.current,
            showTotal: (total) => renderTotal(total),
            showQuickJumper: true,
          }}
          rowSelection={{
            selectedRowKeys: state.selectKeys,
            onChange: onOrgSelectKeysChange,
            columnWidth: 32,
          }}
          onChange={onTblChange}
          scroll={{ x: '100%', y: state.scrollY }}
          size="middle"
        />
      </RcResizeObserver>
      <DomainDetails
        domainInfo={state.domainInfo}
        visible={state.domainDetailsVisible}
        onCancel={() => setState({ domainDetailsVisible: false })}
      />
      <TaskSaveToContacts
        visible={state.saveContactsVisible}
        onCancel={() => setState({ saveContactsVisible: false })}
        initValues={state.saveInitValues}
        actionReload={() => {}}
      />
      <TaskSaveToBlack
        visible={state.saveBlackVisible}
        onCancel={() => setState({ saveBlackVisible: false })}
        initValues={state.saveInitValues}
        actionReload={() => onFinishSaveBlack()}
      />
      <TaskSaveCancelBlack
        visible={state.cancelBlackVisible}
        onCancel={() => setState({ cancelBlackVisible: false })}
        initValues={state.saveInitValues}
        actionReload={() => onFinishSaveBlack()}
      />
      <DomainSaveToContatcs
        visible={state.domainSaveVisible}
        onCancel={() => setState({ domainSaveVisible: false })}
        initValues={state.domainValues}
        actionReload={() => {}}
      />
      <DomainFilters
        visible={state.filterVisible}
        onCancel={() => setState({ filterVisible: false })}
        filters={state.filters}
        logic={state.logic}
        onApplyAction={onFilterApplyAction}
        onLogicChange={onLogicChangeAction}
        viewConfig={state.viewConfig}
      />
      <ViewCreate
        visible={state.viewCreateVisible}
        onCancel={() => setState({ viewCreateVisible: false })}
        actionReload={() => createReload()}
        filters={state.filters}
        viewType="searchDomain"
      />
    </div>
  );
};

export default TaskDomains;
