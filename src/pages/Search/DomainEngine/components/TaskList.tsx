import React, { useEffect } from 'react';
import {
  Button,
  Input,
  Space,
  Card,
  Table,
  Progress,
  Tag,
  Typography,
  message,
  Modal,
  Divider,
  Dropdown,
  Tooltip,
  Badge,
  Checkbox,
  Avatar,
  Radio,
  Row,
  Col,
} from 'antd';
import { useSetState } from 'ahooks';
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  DeleteOutlined,
  DownOutlined,
  HomeOutlined,
  InfoCircleOutlined,
  MailOutlined,
  MinusCircleOutlined,
  PlaySquareOutlined,
  SaveOutlined,
  SyncOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import {
  apiSearchTasksShow,
  apiSearchTasksStatus,
  apiSearchTasksDelete,
  apiSearchTasksDrop,
  apiSearchTasksStop,
  apiSearchTasksStart,
  apiSearchTasksRename,
  apiSearchTasksCreate,
} from '@/services/search';
import { apiSubordinateUsers } from '@/services/enterprise';
import { useRequest } from '@umijs/max';
import {
  checkBadDomain,
  checkTaskIdSubmit,
  exTimes,
  exTimeToDateTime,
  getDomainFromString,
  getDomainsFromString,
} from '@/utils/common';
// import TaskCreate from './TaskCreate';
import type { ColumnsType } from 'antd/lib/table';
import TaskSaveToContacts from '../../components/TaskSaveToContacts';
import TaskDetails from '@/components/Search/TaskDetails';
const { Paragraph } = Typography;
import styles from '@/pages/index.less';
import RcResizeObserver from 'rc-resize-observer';
import { GoogleIcon, LinkedInIcon, ZoominfoIcon } from '@/components/Icon';
import { apiCompanyInfoCheck } from '@/services/search';
import CompanyDetails from '@/components/Search/CompanyDetails';
import { useEmotionCss } from '@ant-design/use-emotion-css';

interface FormProps {
  setStep: (step: string) => void;
  setTaskInfo: (info: any) => void;
}

const IconText = ({ icon, count, name }: { icon: any; count: number; name: string }) => (
  <span style={{ marginRight: 12 }}>
    {React.createElement(icon, { style: { marginInlineEnd: 8 } })}
    <a style={{ marginRight: 2 }}>{count}</a>
    {name}
  </span>
);

const TaskList: React.FC<FormProps> = (props) => {
  const { setStep, setTaskInfo } = props;
  const [state, setState] = useSetState<Record<string, any>>({
    country: undefined,
    language: undefined,
    keyword: undefined,
    platform: 'linkedin',
    taskTotal: 0,
    total: 0,
    current: 1,
    pageSize: 10,
    tasksData: [],
    createVisible: false,
    app: 'wechat',
    codeUrl: 'https://web.laifaxin.com',
    id: '',
    paySearchVisible: false,
    qrcodeVisible: false,
    saveContactsVisible: false,
    saveInitValues: {},
    infoVisible: false,
    taskInfo: {},
    userTreeData: [],
    owners: [],
    filterValues: { type: 'domain' },
    scrollY: 600,
    sort: {},
    tblSelectKeys: [],
    showFilter: false,
    domain: '',
    realDomain: '',
    domainSearchType: 'single',
    domainCount: 0,
    companyDetailsVisible: false,
    domainWords: '',
    companyDetailColumnWidth: 480,
  });

  const { run: infoCheckRun, loading: checkInfoLoading } = useRequest(apiCompanyInfoCheck, {
    manual: true,
  });

  const { data: usersData } = useRequest(apiSubordinateUsers, {
    onSuccess: (data: any) => {
      if (!data) return;
      setState({ owners: data });
      const treeData = [];
      // eslint-disable-next-line guard-for-in
      for (const idx in data) {
        const { nickname, userid } = data[idx];
        treeData.push({ title: nickname, value: userid, key: userid });
      }
      setState({ userTreeData: treeData });
    },
  });

  // const openQrcode = (id: string, app: string, codeUrl: string) => {
  //   setState({ id, app, codeUrl, qrcodeVisible: true });
  // };

  const { run: statusRun } = useRequest(apiSearchTasksStatus, {
    manual: true,
    onSuccess: (data: any) => {
      if (!data) return;
      const { tasksData } = state;
      const { task_id } = data;
      if (!task_id) {
        return;
      }
      const index = tasksData.findIndex((o: any) => o.task_id === task_id);
      tasksData[index] = { ...tasksData[index], ...data };
      setState({ tasksData: [...tasksData] });
    },
  });

  const { run: listRun, loading: listLoading } = useRequest(apiSearchTasksShow, {
    manual: true,
    pollingInterval: 15000,
    debounceInterval: 500,
    onSuccess: async (data: any) => {
      let { taskTotal, showFilter } = state;
      const { list, current, total } = data;
      if (total && total > taskTotal) {
        taskTotal = total;
      }
      setState({ tasksData: list, current, total, taskTotal, tblSelectKeys: [] });
      if (!showFilter && total >= 10) {
        showFilter = true;
        setState({ showFilter });
      }
      // eslint-disable-next-line guard-for-in
      for (const idx in list) {
        const { task_id, status } = list[idx];
        if (/[a-zA-Z]/.test(task_id)) {
          if (
            status === 'running' ||
            status === 'waiting' ||
            status === 'paused' ||
            status === 'continue'
          ) {
            await statusRun({ task_id });
          }
        }
      }
    },
  });

  const reloadTasksData = (values?: any) => {
    const { filterValues, pageSize, sort } = state;
    if (!values) {
      // eslint-disable-next-line no-param-reassign
      values = filterValues;
    }
    listRun({ filter: values, current: 1, pageSize, sort });
  };

  const { run: createRun, loading: createLoading } = useRequest(apiSearchTasksCreate, {
    manual: true,
    onSuccess: () => {
      message.success('创建域名查询任务成功，请稍后查看结果');
      reloadTasksData();
    },
  });

  const { run: startRun } = useRequest(apiSearchTasksStart, {
    manual: true,
    onSuccess: () => {
      message.success('操作成功');
      reloadTasksData();
    },
  });

  const onClickStart = (record: any) => {
    const { task_id } = record;
    Modal.confirm({
      title: `继续运行`,
      content: `确定继续运行该任务？`,
      onOk: () => startRun({ task_id }),
    });
  };

  const { run: stopRun } = useRequest(apiSearchTasksStop, {
    manual: true,
    onSuccess: () => {
      message.success('操作成功');
      reloadTasksData();
    },
  });

  const { run: renameRun } = useRequest(apiSearchTasksRename, {
    manual: true,
    onSuccess: () => {
      const { filterValues, pageSize, sort, current } = state;
      listRun({ filter: filterValues, current, pageSize, sort });
    },
  });

  const onClickStop = (record: any) => {
    const { task_id } = record;
    Modal.confirm({
      title: `暂停任务`,
      content: `确定暂停该任务？`,
      onOk: () => stopRun({ task_id }),
    });
  };

  const { run: deleteRun } = useRequest(apiSearchTasksDelete, {
    manual: true,
    onSuccess: () => {
      message.success('操作成功');
      reloadTasksData();
    },
  });

  const onClickDelete = (record: any) => {
    const { task_id } = record;
    Modal.confirm({
      title: `删除任务`,
      content: `确定删除该任务？该操作不可恢复`,
      onOk: () => deleteRun({ task_id }),
    });
  };

  const { run: dropRun } = useRequest(apiSearchTasksDrop, {
    manual: true,
    onSuccess: (data: any) => {
      if (!data) return;
      const { deletedCount } = data;
      message.success(`操作成功 成功删除数量：${deletedCount}`);
      reloadTasksData();
    },
  });

  const onClickDrop = () => {
    const { tblSelectKeys } = state;
    Modal.confirm({
      title: `批量删除任务`,
      content: `确定删除 ${tblSelectKeys.length} 个任务？该操作不可恢复`,
      onOk: () => dropRun({ task_ids: tblSelectKeys }),
    });
  };

  const renderPlatform = (record: any) => {
    const { type, platform } = record;
    if (type === 'keyword') {
      if (platform === 'google') return <GoogleIcon style={{ width: 32, height: 32 }} />;
      if (platform === 'linkedin') return <LinkedInIcon style={{ width: 32, height: 32 }} />;
      if (platform === 'zoominfo') return <ZoominfoIcon style={{ width: 32, height: 32 }} />;
      return platform;
    }
    if (type === 'domain')
      return (
        <Avatar size={32} shape="square">
          域名
        </Avatar>
      );
    if (type === '名称')
      return (
        <Avatar size={32} shape="square">
          名称
        </Avatar>
      );
    return type;
  };

  const renderStatus = (record: any) => {
    const { status } = record;
    if (status === 'running') {
      return (
        <Tag icon={<SyncOutlined spin />} color="processing">
          运行中
        </Tag>
      );
    }
    if (status === 'finished') {
      return (
        <Tag icon={<CheckCircleOutlined />} color="success">
          已完成
        </Tag>
      );
    }
    if (status === 'waiting') {
      return (
        <Tag icon={<ClockCircleOutlined />} color="default">
          等待中
        </Tag>
      );
    }
    if (status === 'continue') {
      return (
        <Tag icon={<ClockCircleOutlined />} color="default">
          继续中
        </Tag>
      );
    }
    if (status === 'deleted') {
      return (
        <Tag icon={<CloseCircleOutlined />} color="error">
          已取消
        </Tag>
      );
    }
    if (status === 'paused') {
      return (
        <Tag icon={<MinusCircleOutlined />} color="warning">
          已暂停
        </Tag>
      );
    }
    return status;
  };

  const renderTaskStatus = (record: any) => {
    const { progress, status } = record;
    let _status: string;
    switch (status) {
      case 'running':
        _status = '运行中';
        break;
      case 'finished':
        _status = '已完成';
        break;
      case 'waiting':
        _status = '等待中';
        break;
      case 'continue':
        _status = '继续中';
        break;
      case 'deleted':
        _status = '已取消';
        break;
      case 'paused':
        _status = '已暂停';
        break;
      default:
        _status = status;
        break;
    }
    return (
      <Progress
        type="circle"
        trailColor="#e6f4ff"
        percent={progress}
        strokeWidth={20}
        width={14}
        format={(number) => `${_status}，已完成${number}%`}
      />
    );
  };

  const renderCostTime = (record: any) => {
    const { status, create_time, start_time, finish_time } = record;
    const startTime = start_time ? start_time : create_time;
    let costTime = 0;
    if (status === 'finished') {
      costTime = finish_time - startTime;
    } else if (status === 'deleted') {
      costTime = 0;
    } else {
      costTime = Date.now() - startTime;
    }
    return exTimes(costTime);
  };

  const onClickTaskDetails = (info: string, step: string) => {
    setTaskInfo(info);
    setStep(step);
  };

  const onClickDeleteAction = (task: any) => {
    onClickDelete(task);
  };

  const renderDisplayResult = (record: any) => {
    const { task_id, newVer, status, domainCount, orgCount, type, platform } = record;
    const selectNum = orgCount ? orgCount : domainCount; // 企业数或域名数量
    const moreAction = (
      <Dropdown
        menu={
          {
            items: [
              {
                key: "info",
                icon: <InfoCircleOutlined />,
                label: "任务信息",
                onClick: () => setState({ infoVisible: true, taskInfo: record })
              },
              {
                disabled: !selectNum || status === 'deleted',
                key: "save",
                label: "保存邮箱",
                icon: <SaveOutlined />,
                onClick: () =>
                  setState({
                    saveContactsVisible: true,
                    saveInitValues: {
                      ...record,
                      selectNum,
                      selectAll: true,
                      filters: [],
                      filter: {},
                      keyword: '',
                    },
                  })

              },
              {
                key: "rerun",
                onClick: () => setState({ saveInitValues: record, createVisible: true }),
                label: "再次运行",
                icon: <PlaySquareOutlined />,
              },
              {
                key: "delete",
                icon: <DeleteOutlined />,
                label: "删除",
                onClick: () => onClickDeleteAction(record),
              }
            ]
          }
        }

      >
        <a>
          更多 <DownOutlined />
        </a>
      </Dropdown>
    );
    if (status === 'deleted') {
      return (
        <>
          <span style={{ marginLeft: 28 }}> </span>
          <Divider type="vertical" style={{ marginLeft: 6, marginRight: 6 }} />
          {moreAction}
        </>
      );
    }
    if (status === 'finished') {
      if (newVer) {
        return (
          <>
            {orgCount || domainCount ? (
              <a type="link" onClick={() => onClickTaskDetails(record, 'company')}>
                结果
              </a>
            ) : (
              <span style={{ marginLeft: 28 }}> </span>
            )}
            <Divider type="vertical" style={{ marginLeft: 6, marginRight: 6 }} />
            {moreAction}
          </>
        );
      }
      if (platform === 'google') {
        return (
          <>
            {domainCount ? (
              <a onClick={() => onClickTaskDetails(record, 'domain')}>结果</a>
            ) : (
              <span style={{ marginLeft: 28 }}> </span>
            )}
            <Divider type="vertical" style={{ marginLeft: 6, marginRight: 6 }} />
            {moreAction}
          </>
        );
      }
      if (type === 'keyword') {
        return (
          <>
            {orgCount ? (
              <a type="link" onClick={() => onClickTaskDetails(record, 'org')}>
                结果
              </a>
            ) : (
              <span style={{ marginLeft: 28 }}> </span>
            )}
            <Divider type="vertical" style={{ marginLeft: 6, marginRight: 6 }} />
            {moreAction}
          </>
        );
      }
      if (type === 'domain' || type === 'name') {
        return (
          <>
            {domainCount ? (
              <a onClick={() => onClickTaskDetails(record, 'domain')}>结果</a>
            ) : (
              <span style={{ marginLeft: 28 }}> </span>
            )}
            <Divider type="vertical" style={{ marginLeft: 6, marginRight: 6 }} />
            {moreAction}
          </>
        );
      }
    }
    const submit = checkTaskIdSubmit(task_id);
    if (!submit && status === 'waiting') {
      return (
        <a style={{ color: 'red' }} onClick={() => onClickDelete(record)}>
          取消
        </a>
      );
    }
    if (status === 'running' || status === 'waiting' || status === 'continue') {
      return (
        <a style={{ color: 'orange' }} onClick={() => onClickStop({ task_id })}>
          暂停
        </a>
      );
    }
    if (status === 'paused') {
      return (
        <>
          <a style={{ color: 'orange' }} onClick={() => onClickStart(record)}>
            继续
          </a>
          <Divider type="vertical" style={{ marginLeft: 6, marginRight: 6 }} />
          <a style={{ color: 'red' }} onClick={() => onClickDelete(record)}>
            取消
          </a>
        </>
      );
    }
    return null;
  };

  const renderUserid = (record: any) => {
    const { userid } = record;
    if (!usersData || !usersData.length) {
      return '我自己';
    }
    const idx = usersData.findIndex((user: any) => user.userid === userid);
    if (idx >= 0) {
      const { nickname } = usersData[idx];
      return nickname;
    }
    return '已删除用户';
  };

  const renderTaskId = (record: any) => {
    const { task_id, saveCount, personalSave, genericSave } = record;
    return (
      <div style={{ width: 240, whiteSpace: 'nowrap', overflow: 'hidden' }}>
        {saveCount > 0 ? (
          <Tooltip
            title={
              <>
                <div>
                  保存次数：<a>{saveCount}</a>
                </div>
                <div>
                  精准邮箱已保存数量：<a>{personalSave}</a>
                </div>
                <div>
                  通用邮箱已保存数量：<a>{genericSave}</a>
                </div>
              </>
            }
          >
            <Badge color="blue" style={{ marginRight: 2 }} />
          </Tooltip>
        ) : null}
        <span>{task_id}</span>
      </div>
    );
  };

  const companyDetailClassName = useEmotionCss(({ }) => {
    return {
      width: state.companyDetailColumnWidth - 12,
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    };
  });

  const renderTaskDetails = (record: any) => {
    const { name, task_id, orgCount, domainCount, peoCount, personalCount, genericCount } = record;
    const companyCount = orgCount || domainCount;
    const employees = peoCount;
    const mailCount = personalCount + genericCount;
    const title = name || '未命名';
    const titleCom = (
      <Tooltip title={title}>
        <Paragraph
          editable={{
            onChange: (value: string) => renameRun({ name: value, task_id }),
          }}
          style={{ marginBottom: 0, paddingBottom: 0, fontSize: 16 }}
          ellipsis={true}
        >
          {title}
        </Paragraph>
      </Tooltip>
    );
    return (
      <>
        <div className={companyDetailClassName}>{titleCom}</div>
        <Row gutter={24} style={{ marginTop: 6 }}>
          <Col span={8}>
            <IconText icon={HomeOutlined} count={companyCount} name="企业" />
          </Col>
          <Col span={8}>
            <IconText icon={TeamOutlined} count={employees} name="成员" />
          </Col>
          <Col span={8}>
            <IconText icon={MailOutlined} count={mailCount} name="邮箱" />
          </Col>
        </Row>
      </>
    );
  };

  const columns: ColumnsType<any> = [
    {
      title: '任务ID',
      dataIndex: 'task_id',
      width: 128,
      render: (_: any, record: any) => renderTaskId(record),
    },
    {
      title: '来源',
      dataIndex: 'platform',
      render: (_: any, record: any) => renderPlatform(record),
      width: 48,
    },
    {
      title: '状态',
      dataIndex: 'status',
      render: (_: any, record: any) => renderStatus(record),
      width: 86,
    },
    {
      title: '进度',
      dataIndex: 'proccess',
      render: (_: any, record: any) => renderTaskStatus(record),
      width: 48,
    },
    {
      title: '任务名称',
      dataIndex: 'name',
      width: 480,
      render: (_: any, record: any) => renderTaskDetails(record),
    },
    {
      title: '耗时',
      dataIndex: 'finish_time',
      render: (_: any, record: any) => renderCostTime(record),
      width: 96,
    },
    {
      title: '创建时间',
      dataIndex: 'create_time',
      width: 160,
      render: (_: any, record: any) => {
        const { create_time } = record;
        return exTimeToDateTime(create_time);
      },
      sorter: (a: any, b: any) => a.create_time - b.create_time,
    },
    {
      title: '创建者',
      dataIndex: 'userid',
      width: 128,
      render: (_: any, record: any) => renderUserid(record),
    },
    {
      title: '结果',
      dataIndex: 'result',
      width: 116,
      fixed: 'right',
      render: (_: any, record: any) => renderDisplayResult(record),
    },
  ];

  const onPageParamsChange = (current: number, pageSize: number) => {
    setState({ current, pageSize });
    const { filterValues, sort } = state;
    listRun({ current, pageSize, filter: filterValues, sort });
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
    const { filterValues } = state;
    filterValues.type = 'domain';
    listRun({ current, pageSize, filter: filterValues, sort });
  };

  useEffect(() => {
    reloadTasksData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onTblSelectKeysChange = (selectedKeys: any) => {
    setState({ tblSelectKeys: selectedKeys });
  };

  const onSelectAll = () => {
    const { tasksData } = state;
    const keys = [];
    // eslint-disable-next-line guard-for-in
    for (const idx in tasksData) {
      const { task_id } = tasksData[idx];
      keys.push(task_id);
    }
    setState({ tblSelectKeys: keys });
  };

  const onActionSelectChange = (checked: boolean) => {
    if (checked) {
      onSelectAll();
    } else {
      setState({ tblSelectKeys: [] });
    }
  };

  const onDomainTextBlur = (value: string) => {
    setState({ countLoading: true, domainCount: 0 });
    const domains = getDomainsFromString(value);
    setState({ domainCount: domains.length, countLoading: false });
  };

  const onSingleSearchAction = async () => {
    const { domain } = state;
    const bad = checkBadDomain(domain);
    if (bad) {
      message.error('域名格式不正确');
      return;
    }
    const realDomain = getDomainFromString(domain);
    if (!realDomain) {
      message.error('未获取到有效的域名');
      return;
    }
    setState({ realDomain });
    const info = await infoCheckRun({ domain: realDomain });
    if (info && info.check) {
      setState({ companyDetailsVisible: true });
    } else {
      message.warning('暂时没有查询到该域名信息，将创建域名任务');
      createRun({ name: domain, type: 'domain', language: 'EN', keyword: realDomain });
      setState({ domain: '' });
    }
  };

  const onMultiSearchAction = async () => {
    const { domainWords } = state;
    const domains = getDomainsFromString(domainWords);
    if (!domains.length) {
      message.error('未检出有效域名！');
      return;
    }
    let name = '';
    if (domains.length === 1) {
      name = domains[0];
    } else {
      name = `${domains[0]}... ${domains.length} 个域名`;
    }
    createRun({
      name,
      type: 'domain',
      language: 'EN',
      keyword: domains.join('\n'),
    });
    setState({ domainWords: '' });
  };

  const renderSearchArea = () => {
    const { domainSearchType } = state;
    if (domainSearchType === 'single') {
      return (
        <Input.Search
          placeholder="输入域名地址，挖掘相关邮箱信息、企业信息、联系人信息"
          style={{ width: '100%' }}
          size="large"
          onSearch={onSingleSearchAction}
          value={state.domain}
          onChange={(e) => setState({ domain: e.target.value })}
          loading={checkInfoLoading || createLoading}
          enterButton="立即查询"
        />
      );
    }

    return (
      <div>
        <Input.TextArea
          placeholder="请输入域名文本内容，不限制格式，自动识别里面的域名"
          rows={6}
          onBlur={(e) => onDomainTextBlur(e.target.value)}
          style={{ width: '100%', marginBottom: 12 }}
          value={state.domainWords}
          onChange={(e) => setState({ domainWords: e.target.value })}
        />
        <div style={{ textAlign: 'right' }}>
          <Space size="large">
            <span>
              有效域名总数：<a>{state.domainCount}</a>
            </span>
            <Button type="primary" onClick={onMultiSearchAction}>
              立即搜索
            </Button>
          </Space>
        </div>
      </div>
    );
  };

  return (
    <>
      <Card bodyStyle={{ padding: 12 }} className="both-down">
        <div
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div style={{ width: 800 }}>
            <Space
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 12,
              }}
            >
              <Radio.Group
                buttonStyle="solid"
                size="large"
                value={state.domainSearchType}
                onChange={(e) => setState({ domainSearchType: e.target.value })}
              >
                <Radio.Button value="single">单个域名搜索</Radio.Button>
                <Radio.Button value="multi">批量搜索域名</Radio.Button>
              </Radio.Group>
            </Space>
            {renderSearchArea()}
          </div>
        </div>
      </Card>
      <Card key="showSearch" style={{ marginTop: 12 }} className="both-up">
        <div className={styles['tbl-operator']} hidden={!state.tblSelectKeys.length}>
          <Space size={24}>
            <Checkbox
              indeterminate={state.tblSelectKeys.length !== state.tasksData.length}
              checked={state.tblSelectKeys.length > 0}
              onChange={(e) => onActionSelectChange(e.target.checked)}
            />
            <span>
              已选 <a>{state.tblSelectKeys.length}</a> 项数据
            </span>
            <Button key="111" size="small" type="primary" onClick={() => onClickDrop()}>
              删除
            </Button>
          </Space>
        </div>
        <RcResizeObserver
          key="resize-observer"
          onResize={() => {
            const { innerHeight, innerWidth } = window;
            if (innerHeight >= 500) {
              const scrollY = innerHeight - 280;
              setState({ scrollY });
            }
            let companyDetailColumnWidth = 480;
            if (innerWidth >= 1200) {
              companyDetailColumnWidth = 480;
            } else if (innerWidth >= 1000) {
              companyDetailColumnWidth = 400;
            } else {
              companyDetailColumnWidth = 320;
            }
            setState({ companyDetailColumnWidth });
          }}
        >
          <Table
            loading={listLoading}
            rowKey="task_id"
            dataSource={state.tasksData}
            columns={columns}
            pagination={{
              position: ['bottomCenter'],
              total: state.total,
              pageSize: state.pageSize,
              current: state.current,
              showTotal: (total) => `域名任务数 ${total} `,
              onChange: onPageParamsChange,
              showQuickJumper: true,
            }}
            rowSelection={{
              selectedRowKeys: state.tblSelectKeys,
              onChange: onTblSelectKeysChange,
              columnWidth: 32,
            }}
            scroll={{ x: '100%', y: state.scrollY }}
            onChange={onTblChange}
            showHeader={!state.tblSelectKeys.length}
            size="middle"
            rowClassName={styles['editable-row']}
          />
        </RcResizeObserver>
      </Card>
      <TaskSaveToContacts
        visible={state.saveContactsVisible}
        onCancel={() => setState({ saveContactsVisible: false })}
        initValues={state.saveInitValues}
        actionReload={() => { }}
      />
      <TaskDetails
        taskInfo={state.taskInfo}
        visible={state.infoVisible}
        onCancel={() => setState({ infoVisible: false })}
      />
      <CompanyDetails
        domain={state.realDomain}
        visible={state.companyDetailsVisible}
        onCancel={() => setState({ companyDetailsVisible: false })}
      />
    </>
  );
};

export default TaskList;
