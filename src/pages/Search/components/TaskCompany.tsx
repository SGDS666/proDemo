import React, { useEffect } from 'react';
import {
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
  TreeSelect,
  Badge,
  Card,
} from 'antd';
import {
  DownOutlined,
  EyeOutlined,
  FacebookOutlined,
  FilterFilled,
  LeftOutlined,
  LinkedinOutlined,
  LinkOutlined,
  SaveOutlined,
  TwitterOutlined,
  UserAddOutlined,
  UserDeleteOutlined,
} from '@ant-design/icons';
import { apiSearchCompanyList, apiDomainSaveBlack, apiDomainCancelBlack } from '@/services/search';
import { useRequest } from '@umijs/max';
import { useSetState } from 'ahooks';
import styles from '../style.less';
import CompanyDetails from '@/components/Search/CompanyDetails';
import TaskSaveToContacts from './TaskSaveToContacts';
import TaskSaveToBlack from './TaskSaveToBlack';
import TaskSaveCancelBlack from './TaskSaveCancelBlack';
import DomainSaveToContatcs from '@/components/Search/DomainSaveToContacts';
import CompanyFilter from './CompanyFilters';
import { apiViewConfig, apiViewSave } from '@/services/views';
import ViewCreate from '@/components/Search/ViewCreate';
import { CountriesData } from '@/config/countries';
import type { ColumnsType } from 'antd/lib/table';
import RcResizeObserver from 'rc-resize-observer';
const { Text } = Typography;
interface FormProps {
  taskInfo: any;
  setStep: (step: string) => void;
  viewId: string;
  createReload: (vals: any) => void;
}

const TaskCompanies: React.FC<FormProps> = (props) => {
  const { taskInfo, setStep, viewId, createReload } = props;
  const { task_id, countryCount } = taskInfo;
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
    orgDetailsVisible: false,
    companyInfo: {},
    domain: '',
    saveContactsVisible: false,
    saveInitValues: {},
    saveBlackVisible: false,
    canelBlackVisible: false,
    domainSaveVisible: false,
    domainValues: {},
    logic: 'and',
    filters: [], // 视图过滤条件
    viewCreateVisible: false,
    countryCountTree: [],
    countryValues: [],
    viewOwner: '',
    viewSaveVisible: false,
    viewConfig: {},
    scrollY: 600,
  });

  const { run: orgListRun, loading: orgListLoading } = useRequest(apiSearchCompanyList, {
    manual: true,
    onSuccess: (data: any) => {
      if (!data) return;
      const { total, list, current, pageSize } = data;
      setState({ orgData: list, total, current, pageSize });
    },
  });

  const getTaskOrgsData = async (pageNumber?: number) => {
    const { keyword, countryCode, current, pageSize, sort, filters, logic } = state;
    const pageCurrent = pageNumber ? pageNumber : current;
    orgListRun({
      task_id,
      keyword,
      filter: { countryCode },
      filters,
      logic,
      current: pageCurrent,
      pageSize,
      sort,
    });
  };

  const onSearchTaskData = async () => {
    const { keyword, countryCode, pageSize, sort, filters, logic } = state;
    orgListRun({
      task_id,
      keyword,
      filter: { countryCode },
      filters,
      logic,
      current: 1,
      pageSize,
      sort,
    });
  };

  const checkTableFilterValue = (filters: any) => {
    const idx = filters.findIndex(
      (o: any) => o.property === 'countryCode' && o.operator === 'include',
    );
    if (idx >= 0) {
      setState({ countryValues: filters[idx].values });
    } else {
      setState({ countryValues: [] });
    }
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
        viewSaveVisible: false,
        viewConfig: data,
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
      checkTableFilterValue(filters);
    },
  });

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
    getTaskOrgsData(1);
  };

  const onLogicChangeAction = async (logic: string) => {
    setState({ logic, viewSaveVisible: true, current: 1 });
    const { keyword, countryCode, pageSize, filters, sort } = state;
    orgListRun({
      task_id,
      keyword,
      filter: { countryCode },
      filters,
      logic,
      current: 1,
      pageSize,
      sort,
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
    const { keyword, countryCode, filters: viewFilters, logic } = state;
    orgListRun({
      task_id,
      keyword,
      filter: { countryCode },
      current,
      pageSize,
      sort,
      logic,
      filters: viewFilters,
    });
  };

  const { run: saveBlackRun } = useRequest(apiDomainSaveBlack, {
    manual: true,
    onSuccess: () => {
      message.success('拉入黑名单成功');
      getTaskOrgsData();
    },
  });

  const { run: cancelBlackRun } = useRequest(apiDomainCancelBlack, {
    manual: true,
    onSuccess: () => {
      message.success('移出黑名单成功');
      getTaskOrgsData();
    },
  });

  const renderDisplayMore = (record: any) => {
    const { black, website, domain } = record;
    return (
      <>
        <a type="link" onClick={() => setState({ domain, orgDetailsVisible: true })}>
          详情
        </a>
        <Divider type="vertical" style={{ marginLeft: 6, marginRight: 6 }} />
        {website ? (
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

  const renderWebsite = (record: any) => {
    const { website, linkedin_url, facebook_url, twitter_url } = record;
    if (!website) {
      return null;
    }
    let url = website;
    if (website.indexOf('http') < 0) {
      url = `http://${website}`;
    }
    const linkedin = linkedin_url ? (
      <a target="_blank" href={linkedin_url} rel="noreferrer" className={styles['social-link']}>
        <LinkedinOutlined />
      </a>
    ) : null;
    const fackbook = facebook_url ? (
      <a target="_blank" href={facebook_url} rel="noreferrer" className={styles['social-link']}>
        <FacebookOutlined />
      </a>
    ) : null;
    const twitter = twitter_url ? (
      <a target="_blank" href={twitter_url} rel="noreferrer" className={styles['social-link']}>
        <TwitterOutlined />
      </a>
    ) : null;
    const popImg = (
      <Popover
        content={
          <img src={`https://image.thum.io/get/auth/64495/${url}`} width={512} height={512} />
        }
        title={false}
        placement="right"
      >
        <EyeOutlined />
      </Popover>
    );
    return (
      <Space>
        {popImg}
        <a target="_blank" href={website} rel="noreferrer" className={styles['social-link']}>
          <LinkOutlined />
        </a>
        {linkedin}
        {fackbook}
        {twitter}
      </Space>
    );
  };

  const renderFirstColumn = (record: any) => {
    const { black, saveTotal, savePersonal, saveGeneric, domain } = record;
    let { orgName } = record;
    if (!orgName) {
      orgName = domain;
    }
    const socials = renderWebsite(record);
    const popLogo = (
      <Popover
        content={<img src={`https://ico.laifaxin.com/ico/${domain}`} />}
        title={false}
        placement="right"
      >
        <img
          src={`https://ico.laifaxin.com/ico/${domain}`}
          width={35}
          height={35}
          style={{ marginTop: 8, marginRight: 12, borderRadius: '5px' }}
        />
      </Popover>
    );
    const saveTag = saveTotal ? (
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
    ) : null;
    const companyName = black ? (
      <Tooltip title={orgName}>
        <Text delete>
          <a
            style={{ color: '#999', fontSize: 14 }}
            onClick={() => setState({ domain, orgDetailsVisible: true })}
          >
            {orgName}
          </a>
        </Text>
      </Tooltip>
    ) : (
      <Tooltip title={orgName}>
        <a
          style={{ color: '#1991eb', fontSize: 14, fontWeight: 500 }}
          onClick={() => setState({ domain, orgDetailsVisible: true })}
        >
          {orgName}
        </a>
      </Tooltip>
    );
    // <div style={{ width: 240, whiteSpace: 'nowrap', overflow: 'hidden' }}>
    return (
      <Row>
        <Col>{popLogo}</Col>
        <Col>
          <div
            style={{
              width: 168,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {saveTag} {companyName}
          </div>
          <div style={{ marginTop: 6 }}>{socials}</div>
        </Col>
      </Row>
    );
  };

  const renderCountry = (record: any) => {
    const { company_country } = record;
    if (!company_country) {
      return '-';
    }
    const index = CountriesData.findIndex((o) => o.en === company_country);
    if (index >= 0) {
      const { cn } = CountriesData[index];
      return cn;
    }
    return company_country;
  };

  const renderOthers = (value: string, width: number) => {
    return (
      <Tooltip title={value}>
        <div style={{ width, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {value}
        </div>
      </Tooltip>
    );
  };

  const renderText = (value: string, width: number) => {
    if (!value) {
      return '-';
    }
    if (value.length <= 20) {
      return (
        <div
          style={{
            width,
            height: 48,
            whiteSpace: 'normal',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {value}
        </div>
      );
    }
    return (
      <Tooltip title={value}>
        <div
          style={{
            width,
            height: 48,
            whiteSpace: 'normal',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {value}
        </div>
      </Tooltip>
    );
  };

  const orgColumns: ColumnsType<any> = [
    {
      title: '企业名',
      dataIndex: 'orgName',
      render: (_: any, record: any) => renderFirstColumn(record),
      width: 240,
      sorter: (a: any, b: any) => a.orgName - b.orgName,
      fixed: 'left',
    },
    {
      title: '国家',
      dataIndex: 'countryCode',
      sorter: (a: any, b: any) => a.countryCode - b.countryCode,
      render: (_: any, record: any) => renderCountry(record),
      width: 64,
    },
    {
      title: '员工数',
      dataIndex: 'employees',
      sorter: (a: any, b: any) => a.employees - b.employees,
      width: 96,
    },
    {
      title: '精准邮箱',
      dataIndex: 'personal',
      sorter: (a: any, b: any) => a.personal - b.personal,
      width: 96,
    },
    {
      title: '普通邮箱',
      dataIndex: 'generic',
      sorter: (a: any, b: any) => a.generic - b.generic,
      width: 96,
    },
    {
      title: '谷歌收录数',
      dataIndex: 'gg_total',
      sorter: (a: any, b: any) => a.gg_total - b.gg_total,
      width: 108,
    },
    {
      title: '行业',
      dataIndex: 'industry',
      sorter: (a: any, b: any) => a.industry - b.industry,
      render: (_: any, record: any) => renderOthers(record.industry, 128),
      width: 128,
    },
    {
      title: '网站标题',
      dataIndex: 'gg_title',
      ellipsis: true,
      width: 240,
      render: (_: any, record: any) => renderText(record.gg_title, 240),
    },
    {
      title: '网站描述',
      dataIndex: 'gg_desc',
      // ellipsis: true,
      width: 480,
      render: (_: any, record: any) => renderText(record.gg_desc, 480),
    },
    {
      title: '操作',
      dataIndex: 'result',
      width: 108,
      fixed: 'right',
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
      const { orgId } = orgData[idx];
      keys.push(orgId);
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
    const { keyword, filters, logic, selectAll, selectKeys, orgData, total } = state;
    const selectOrgs = [];
    if (!selectAll) {
      // eslint-disable-next-line guard-for-in
      for (const idx in selectKeys) {
        const index = orgData.findIndex((o: any) => o.orgId === selectKeys[idx]);
        const { orgId, domain } = orgData[index];
        selectOrgs.push({ orgId, domain });
      }
    }
    const selectNum = selectAll ? total : selectKeys.length;
    const values = {
      task_id,
      selectNum,
      selectAll,
      selectOrgs,
      keyword,
      filters,
      logic,
      type: 'keyword',
    };
    setState({ saveContactsVisible: true, saveInitValues: values });
  };

  const onClickSaveBlackAction = () => {
    const { keyword, filters, selectAll, selectKeys, orgData, total } = state;
    const selectOrgs = [];
    if (!selectAll) {
      // eslint-disable-next-line guard-for-in
      for (const idx in selectKeys) {
        const index = orgData.findIndex((o: any) => o.orgId === selectKeys[idx]);
        const { orgId, domain } = orgData[index];
        selectOrgs.push({ orgId, domain });
      }
    }
    const selectNum = selectAll ? total : selectKeys.length;
    const values = { task_id, selectNum, selectAll, selectOrgs, keyword, filters };
    setState({ saveBlackVisible: true, saveInitValues: values });
  };

  const onClickCancelBlackAction = () => {
    const { keyword, filters, selectAll, selectKeys, orgData, total } = state;
    const selectOrgs = [];
    if (!selectAll) {
      // eslint-disable-next-line guard-for-in
      for (const idx in selectKeys) {
        const index = orgData.findIndex((o: any) => o.orgId === selectKeys[idx]);
        const { orgId, domain } = orgData[index];
        selectOrgs.push({ orgId, domain });
      }
    }
    const selectNum = selectAll ? total : selectKeys.length;
    const values = { task_id, selectNum, selectAll, selectOrgs, keyword, filters };
    setState({ cancelBlackVisible: true, saveInitValues: values });
  };

  const onFinishSaveBlack = () => {
    setState({ selectKeys: [], selectAll: false });
    getTaskOrgsData();
  };

  const tagRender = (prop: any) => {
    const { countryValues } = state;
    const { value } = prop;
    if (countryValues.length && countryValues[0] === value) {
      return <div>已选中 {countryValues.length} 个国家</div>;
    } else {
      return <span />;
    }
  };

  const onCountryChange = (value: any) => {
    setState({ countryValues: value });
    const { filters } = state;
    const idx = filters.findIndex(
      (o: any) => o.property === 'countryCode' && o.operator === 'include',
    );
    if (!value || !value.length) {
      if (idx >= 0) {
        filters.splice(idx, 1);
      }
      setState({ filters, selectKeys: [] });
      getTaskOrgsData(1);
      return;
    }
    if (idx >= 0) {
      filters[idx] = {
        property: 'countryCode',
        operator: 'include',
        values: value,
        valueType: 'select',
      };
    } else {
      filters.push({
        property: 'countryCode',
        operator: 'include',
        values: value,
        valueType: 'select',
      });
    }
    setState({ filters, selectKeys: [] });
    getTaskOrgsData(1);
  };

  const renderCountryCode = () => {
    if (!countryCount || !countryCount.length) {
      setState({ countryCountTree: [] });
      return;
    }
    const tree = [];
    // eslint-disable-next-line guard-for-in
    for (const idx in countryCount) {
      const { countryCode, count } = countryCount[idx];
      const index = CountriesData.findIndex((o) => o.abb2 === countryCode);
      if (index >= 0) {
        const { cn } = CountriesData[index];
        const title = (
          <div>
            ({count}) {cn}
          </div>
        );
        tree.push({ id: countryCode, value: countryCode, title });
      } else {
        const title = <div>({count}) 未知国家</div>;
        tree.push({ id: countryCode, value: countryCode, title: title });
      }
    }
    setState({ countryCountTree: tree });
  };

  useEffect(() => {
    if (task_id && viewId) {
      viewConfigRun({ viewId });
      setState({ selectKeys: [], countryValues: [] });
      renderCountryCode();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewId, task_id]);

  return (
    <>
      <Card>
        <Row gutter={24}>
          <Col xl={18} lg={18} md={18} sm={24} xs={24}>
            <Space size="large">
              <Button
                onClick={() => {
                  setStep('task');
                  setState({ filterVisible: false });
                }}
              >
                <LeftOutlined /> 返回
              </Button>
              <TreeSelect
                treeDataSimpleMode
                style={{ minWidth: 120, borderBottom: '1px solid grey' }}
                dropdownStyle={{ maxHeight: 400 }}
                placeholder={<div style={{ color: 'grey' }}>未选中国家</div>}
                treeData={state.countryCountTree}
                bordered={false}
                showArrow={true}
                treeCheckable={true}
                allowClear
                tagRender={tagRender}
                value={state.countryValues}
                onChange={onCountryChange}
              />
              <Input.Search
                key="searchKey"
                placeholder="企业名、官网、行业"
                onSearch={onSearchTaskData}
                value={state.keyword}
                onChange={(e) => setState({ keyword: e.target.value })}
                style={{ minWidth: 128, verticalAlign: 'middle' }}
              />
              {state.filters.length ? (
                <div style={{ height: 32, backgroundColor: 'lightgrey' }}>
                  <Button type="text" onClick={() => setState({ filterVisible: true })}>
                    <span className={styles['filter-item']}>
                      <FilterFilled /> {state.filters.length}个筛选
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
          <Col xl={6} lg={6} md={6} sm={24} xs={24} style={{ textAlign: 'right' }}>
            {state.selectKeys.length ? null : (
              <Button key="key1122" onClick={() => onOrgActionSelectChange(true)} type="primary">
                <SaveOutlined /> 保存邮箱
              </Button>
            )}
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
            家企业
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
          <Button key="saveBlack" onClick={() => onClickSaveBlackAction()} size="small">
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
            const scrollY = innerHeight - 346;
            setState({ scrollY });
          }
        }}
      >
        <Table
          size="middle"
          loading={orgListLoading}
          rowKey="orgId"
          dataSource={state.orgData}
          columns={orgColumns}
          showHeader={!state.selectKeys.length}
          pagination={{
            position: ['bottomCenter'],
            total: state.total,
            pageSize: state.pageSize,
            current: state.current,
            showTotal: (total) => `企业数量 ${total} `,
            showQuickJumper: true,
          }}
          rowSelection={{
            selectedRowKeys: state.selectKeys,
            onChange: onOrgSelectKeysChange,
            columnWidth: 32,
          }}
          onChange={onTblChange}
          scroll={{ x: '100%', y: state.scrollY }}
        />
      </RcResizeObserver>

      <CompanyDetails
        domain={state.domain}
        visible={state.orgDetailsVisible}
        onCancel={() => setState({ orgDetailsVisible: false })}
      />
      <TaskSaveToContacts
        visible={state.saveContactsVisible}
        onCancel={() => setState({ saveContactsVisible: false })}
        initValues={state.saveInitValues}
        actionReload={() => setState({ selectKeys: [], selectAll: false })}
      />
      <DomainSaveToContatcs
        visible={state.domainSaveVisible}
        onCancel={() => setState({ domainSaveVisible: false })}
        initValues={state.domainValues}
        actionReload={() => setState({ selectKeys: [], selectAll: false })}
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
      <CompanyFilter
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
        actionReload={(vals: any) => createReload(vals)}
        filters={state.filters}
        viewType="searchCompany"
      />
    </>
  );
};

export default TaskCompanies;
