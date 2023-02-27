import React, { useEffect } from 'react';
import {
  Button,
  Input,
  Select,
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
  TreeSelect,
  Tooltip,
  Badge,
  Form,
  Row,
  Col,
  Checkbox,
  Avatar,
} from 'antd';
import { useSetState } from 'ahooks';
import { CountriesData } from '@/config/countries';
import {
  CaretDownOutlined,
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
  PlusOutlined,
  SaveOutlined,
  SyncOutlined,
  TeamOutlined,
  ZoomInOutlined,
} from '@ant-design/icons';
import {
  apiPreviewTotayCount,
  apiSearchTasksShow,
  apiSearchTasksStatus,
  apiSearchTasksDelete,
  apiSearchTasksDrop,
  apiSearchTasksStop,
  apiSearchTasksStart,
  apiSearchTasksRename,
} from '@/services/search';
import { apiSubordinateUsers } from '@/services/enterprise';
import { useRequest, history } from '@umijs/max';
import { checkTaskIdSubmit, exTimes, exTimeToDateTime } from '@/utils/common';
import TaskCreate from './TaskCreate';
import type { ColumnsType } from 'antd/lib/table';
import TaskSaveToContacts from './TaskSaveToContacts';
import TaskDetails from '@/components/Search/TaskDetails';
const { Paragraph } = Typography;
import styles from '@/pages/index.less';
import RcResizeObserver from 'rc-resize-observer';
import { GoogleIcon, LinkedInIcon, ZoominfoIcon } from '@/components/Icon';
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
    filterValues: {},
    scrollY: 600,
    sort: {},
    tblSelectKeys: [],
    showFilter: false,
    companyDetailColumnWidth: 480,
  });

  const { data: countData } = useRequest(apiPreviewTotayCount);

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

  const getTasksData = () => {
    const { keyword, country, language, owners } = state;
    const filter = { keyword: keyword ? keyword : undefined, country, language };
    listRun({ filter, owners });
  };

  const reloadTasksData = (values?: any) => {
    const { filterValues, pageSize, sort } = state;
    if (!values) {
      // eslint-disable-next-line no-param-reassign
      values = filterValues;
    }
    listRun({ filter: values, current: 1, pageSize, sort });
  };

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

  const renderCountry = (record: any) => {
    const { country } = record;
    if (!country) {
      return '-';
    }
    if (typeof country === 'string') {
      const index = CountriesData.findIndex((o) => o.en === country);
      if (index >= 0) {
        const { cn } = CountriesData[index];
        return `${cn}`;
      }
      return country;
    }
    if (!country.length) {
      return '-';
    }
    const firstCountry = country[0];
    return `${firstCountry} ...(${country.length})`;
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
        <Avatar style={{ backgroundColor: '#1890ff' }} size={32} shape="square">
          域名
        </Avatar>
      );
    if (type === 'name')
      return (
        <Avatar style={{ backgroundColor: '#08ce67' }} size={32} shape="square">
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
    const { progress } = record;
    return (
      <Progress
        type="circle"
        trailColor="#e6f4ff"
        percent={progress}
        strokeWidth={20}
        width={14}
        format={(number) => `已完成${number}%`}
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
                icon: <SaveOutlined />,
                label: "保存邮箱",
                onClick: () => setState({
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
                icon: <PlaySquareOutlined />,
                onClick: () => setState({ saveInitValues: record, createVisible: true }),
                label: "再次运行",
              },
              {
                key: "delete",
                icon: <DeleteOutlined />,
                label: "删除",
                onClick: () => onClickDeleteAction(record)
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
      width: state.companyDetailColumnWidth,
      render: (_: any, record: any) => renderTaskDetails(record),
    },
    {
      title: '国家',
      dataIndex: 'country',
      render: (_: any, record: any) => renderCountry(record),
      width: 108,
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

  const onClickCreateTask = () => {
    setState({
      createVisible: true,
      saveInitValues: { platform: 'linkedin', language: 'EN', type: 'keyword' },
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
    const { filterValues } = state;
    listRun({ current, pageSize, filter: filterValues, sort });
  };

  useEffect(() => {
    reloadTasksData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const ownerTagRender = (prop: any) => {
    const { filterValues } = state;
    const { owners } = filterValues;
    const { value } = prop;
    if (owners.length && owners[0] === value) {
      return <div className={styles.stardardFilterSelected}>创建者 ({owners.length})</div>;
    } else {
      return <span />;
    }
  };

  const statusTagRender = (prop: any) => {
    const { filterValues } = state;
    const { value } = prop;
    const { status } = filterValues;
    if (status && status.length && status[0] === value) {
      return <div className={styles.stardardFilterSelected}>任务状态 ({status.length})</div>;
    }
    return <span />;
  };

  const countryTagRender = (prop: any) => {
    const { filterValues } = state;
    const { value } = prop;
    const { country } = filterValues;
    if (country && country.length && country[0] === value) {
      return <div className={styles.stardardFilterSelected}>搜索国家 ({country.length})</div>;
    }
    return <span />;
  };

  const onFilterValuesChange = async (changeValues: any, allValues: any) => {
    setState({ filterValues: allValues });
    reloadTasksData(allValues);
  };

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

  return (
    <>
      <Card>
        <Row>
          <Col xl={12}>
            {state.showFilter ? (
              <Form
                layout="inline"
                initialValues={state.filterValues}
                onValuesChange={onFilterValuesChange}
              >
                <div className={styles.standardFilterConditions}>
                  {usersData?.length ? (
                    <Form.Item name="owners" noStyle>
                      <TreeSelect
                        treeCheckable={true}
                        treeData={state.userTreeData}
                        dropdownStyle={{ maxHeight: 400, minWidth: 200 }}
                        placeholder={
                          <div style={{ color: '#383838', textAlign: 'center' }}>
                            创建者 <CaretDownOutlined />
                          </div>
                        }
                        tagRender={ownerTagRender}
                        showArrow={false}
                        allowClear
                        className={styles.stardardFilter}
                        bordered={false}
                      />
                    </Form.Item>
                  ) : null}
                  <Form.Item name="status" noStyle>
                    <Select
                      mode="multiple"
                      placeholder={
                        <div style={{ color: '#383838', textAlign: 'center' }}>
                          任务状态 <CaretDownOutlined />
                        </div>
                      }
                      tagRender={statusTagRender}
                      bordered={false}
                      className={styles.stardardFilter}
                      allowClear
                    >
                      <Select.Option key="running" value="running">
                        {renderStatus({ status: 'running' })}
                      </Select.Option>
                      <Select.Option key="finished" value="finished">
                        {renderStatus({ status: 'finished' })}
                      </Select.Option>
                      <Select.Option key="waiting" value="waiting">
                        {renderStatus({ status: 'waiting' })}
                      </Select.Option>
                      <Select.Option key="continue" value="continue">
                        {renderStatus({ status: 'continue' })}
                      </Select.Option>
                      <Select.Option key="deleted" value="deleted">
                        {renderStatus({ status: 'deleted' })}
                      </Select.Option>
                      <Select.Option key="paused" value="paused">
                        {renderStatus({ status: 'paused' })}
                      </Select.Option>
                    </Select>
                  </Form.Item>
                  <Form.Item name="country" noStyle>
                    <Select
                      mode="multiple"
                      showSearch
                      optionLabelProp="label"
                      optionFilterProp="label"
                      placeholder={
                        <div style={{ color: '#383838', textAlign: 'center' }}>
                          搜索国家 <CaretDownOutlined />
                        </div>
                      }
                      allowClear
                      className={styles.stardardFilter}
                      bordered={false}
                      showArrow={false}
                      tagRender={countryTagRender}
                    >
                      {CountriesData?.map((item: any) => (
                        <Select.Option
                          value={item.en}
                          key={item.en}
                          label={`${item.cn} (${item.en})`}
                        >
                          {item.cn} ({item.en})
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                  <Form.Item name="keyword" tooltip="任务名称或搜索关键词">
                    <Input.Search
                      key="searchKey"
                      placeholder="名称或关键词"
                      style={{ width: 160, verticalAlign: 'middle' }}
                      className={styles.stardardFilter}
                      allowClear
                    />
                  </Form.Item>
                </div>
              </Form>
            ) : null}
          </Col>
          <Col xl={12} style={{ textAlign: 'right' }}>
            <Space size="large">
              <Tooltip
                title={
                  <div>
                    <div>
                      有效获客剩余点数 <a>{countData?.searchCount}</a>
                    </div>
                  </div>
                }
              >
                <a
                  onClick={() => history.push('/expenses/purchase?type=searchMonth')}
                  style={{ fontSize: 16 }}
                >
                  <ZoomInOutlined /> {countData?.searchCount}
                </a>
              </Tooltip>
              <Tooltip title="立即刷新">
                <a onClick={() => getTasksData()} style={{ fontSize: 16 }}>
                  <SyncOutlined spin={listLoading} />
                </a>
              </Tooltip>
              <Button type="primary" onClick={() => onClickCreateTask()}>
                <PlusOutlined />
                创建任务
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>
      <Card key="showSearch" style={{ marginTop: 12 }}>
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
              showTotal: (total) => `总任务数 ${total} `,
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
      <TaskCreate
        visible={state.createVisible}
        onCancel={() => setState({ createVisible: false })}
        initValues={state.saveInitValues}
        actionReload={() => reloadTasksData()}
      />
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
    </>
  );
};

export default TaskList;
