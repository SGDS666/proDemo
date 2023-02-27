import React, { useEffect } from 'react';
import {
  Button,
  Card,
  Col,
  Divider,
  Form,
  Input,
  message,
  Modal,
  Progress,
  Row,
  Select,
  Space,
  Table,
  Tag,
  Tooltip,
  TreeSelect,
} from 'antd';
import RightContainer from '@/components/Global/RightContainer';
import {
  apiMassTaskList,
  apiMassTaskDelete,
  apiMassTaskStart,
  apiMassTaskStop,
  apiMassTaskDrop,
  apiMassTaskRevoke,
} from '@/services/tasks';
import { useSetState } from 'ahooks';
import { useRequest } from '@umijs/max';
import {
  CaretDownOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  DeleteOutlined,
  EditOutlined,
  MinusCircleOutlined,
  PlusOutlined,
  SyncOutlined,
} from '@ant-design/icons';
import TaskDetails from './TaskDetails';
import MassTaskOpt from '@/components/Tasks/MassTaskOpt';
import styles from '@/pages/index.less';
import { apiSubordinateUsers } from '@/services/enterprise';
import RcResizeObserver from 'rc-resize-observer';
import { exTimeToDateTime } from '@/utils/common';
import type { ColumnsType } from 'antd/lib/table';
import 'moment/locale/zh-cn';
import DateFilter from '@/components/Common/DateFilter';

const Tasks: React.FC = () => {
  const [state, setState] = useSetState<Record<string, any>>({
    selectKey: 'running', // 任务状态
    waitingCount: 0, // 等等审核数量
    runningCount: 0, // 运行中数量
    pauseCount: 0, // 暂停数量
    finishedCount: 0, // 已完成数量
    draftCount: 0, // 草稿箱数量
    denyCount: 0, // 被拒数量
    scheduleCount: 0, // 定时中数量
    recycleCount: 0, // 回收站数量
    revokeCount: 0, // 已撤销数量
    status: 'running', // 任务状态
    detailsShow: false, // 任务详情
    gtid: '', // 任务ID
    massVisible: false, // 任务操作显示
    action: 'create', // 任务操作 create创建 edit编辑 change修改
    filterValues: {},
    scrollY: 600,
    tasksData: [],
    taskTotal: 0,
    total: 0,
    current: 1,
    pageSize: 10,
    sort: {},
    showMore: false,
  });

  // const { data: countData, refresh: countRefresh } = useRequest(apiMassTaskCount);

  const {
    run: listRun,
    loading: listLoading,
    refresh: listRefresh,
  } = useRequest(apiMassTaskList, {
    manual: true,
    pollingInterval: 60000,
    debounceInterval: 500,
    onSuccess: async (data: any) => {
      let { taskTotal } = state;
      const { list, current, total } = data;
      if (total && total > taskTotal) {
        taskTotal = total;
      }
      setState({ tasksData: list, current, total, taskTotal });
    },
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

  // const getTaskCount = async () => {
  //   const data = await apiMassTaskCount();
  //   if (data) {
  //     setState({ ...data });
  //   }
  // };

  // const reloadTaskData = async () => {
  //   getTaskCount();
  //   actionRef.current.reload();
  // };

  const reloadTasksData = (values?: any) => {
    const { filterValues, pageSize, sort } = state;
    if (!values) {
      // eslint-disable-next-line no-param-reassign
      values = filterValues;
    }
    setState({ current: 1 });
    listRun({ filter: values, current: 1, pageSize, sort });
    // countRefresh();
  };

  const { run: deleteRun } = useRequest(apiMassTaskDelete, {
    manual: true,
    onSuccess: () => {
      message.success('删除任务成功！');
      reloadTasksData();
    },
  });

  const confirmRemove = async (record: any) => {
    const { gtid } = record;
    Modal.confirm({
      title: '删除任务',
      content: '确定删除该任务吗？',
      onOk: () => deleteRun({ gtid }),
    });
  };

  const { run: dropRun } = useRequest(apiMassTaskDrop, {
    manual: true,
    onSuccess: () => {
      message.success('清除任务成功！');
      reloadTasksData();
    },
  });

  const confirmDrop = async (record: any) => {
    const { gtid } = record;
    Modal.confirm({
      title: '清除任务',
      content: '确定清除该任务吗？该操作不可恢复',
      onOk: () => dropRun({ gtid }),
    });
  };

  const { run: startRun } = useRequest(apiMassTaskStart, {
    manual: true,
    onSuccess: () => {
      message.success('开始任务成功！');
      reloadTasksData();
    },
  });

  const confirmStart = async (record: any) => {
    const { gtid } = record;
    Modal.confirm({
      title: '开始任务',
      content: '确定运行该任务吗？',
      onOk: () => startRun({ gtid }),
    });
  };

  const { run: StopRun } = useRequest(apiMassTaskStop, {
    manual: true,
    onSuccess: () => {
      message.success('暂停任务成功！');
      reloadTasksData();
    },
  });

  const confirmStop = async (record: any) => {
    const { gtid } = record;
    Modal.confirm({
      title: '暂停任务',
      content: '确定暂停该任务吗？',
      onOk: () => StopRun({ gtid }),
    });
  };

  const { run: revokeRun } = useRequest(apiMassTaskRevoke, {
    manual: true,
    onSuccess: () => {
      message.success('撤销任务成功！');
      reloadTasksData();
    },
  });

  const confirmRevoke = async (record: any) => {
    const { gtid } = record;
    Modal.confirm({
      title: '撤销任务',
      content: '确定撤销该任务吗？',
      onOk: () => revokeRun({ gtid }),
    });
  };

  const getReportsOption = (record: any) => {
    const { gtid } = record;
    return <a onClick={() => setState({ detailsShow: true, gtid })}>详情</a>;
  };

  const getDeleteOption = (record: any) => {
    return (
      <Tooltip title="删除任务并放入回收站中，删除后不可重新运行">
        <a href="#" onClick={() => confirmRemove(record)} style={{ color: 'red' }}>
          删除
        </a>
      </Tooltip>
    );
  };

  const getDropOption = (record: any) => {
    return (
      <Tooltip title="将任务彻底删除，该操作不可恢复">
        <a href="#" onClick={() => confirmDrop(record)} style={{ color: 'red' }}>
          清除
        </a>
      </Tooltip>
    );
  };

  const getStartOption = (record: any) => {
    return (
      <a href="#" onClick={() => confirmStart(record)}>
        开始
      </a>
    );
  };

  const getStopOption = (record: any) => {
    return (
      <a href="#" onClick={() => confirmStop(record)} style={{ color: 'orange' }}>
        暂停
      </a>
    );
  };

  const getRevokeOption = (record: any) => {
    return (
      <Tooltip title="将任务退回并将额度返回">
        <a onClick={() => confirmRevoke(record)} style={{ color: 'orange' }}>
          撤销
        </a>
      </Tooltip>
    );
  };

  const getRenderOption = (record: any) => {
    const { seat, status } = record;
    if (seat === 'draft') {
      return (
        <>
          <a onClick={() => setState({ gtid: record.gtid, massVisible: true, action: 'edit' })}>
            编辑
          </a>
          <Divider type="vertical" />
          {getDeleteOption(record)}
        </>
      );
    }
    if (seat === 'recycle') {
      return (
        <>
          {getReportsOption(record)}
          <Divider type="vertical" />
          {getDropOption(record)}
        </>
      );
    }
    if (status === 'running') {
      return (
        <>
          {getReportsOption(record)}
          <Divider type="vertical" />
          {getStopOption(record)}
        </>
      );
    }
    if (status === 'pause') {
      return (
        <>
          {getReportsOption(record)}
          <Divider type="vertical" />
          {getStartOption(record)}
          <Divider type="vertical" />
          {getRevokeOption(record)}
        </>
      );
    }
    if (status === 'deny') {
      return (
        <>
          <a onClick={() => setState({ gtid: record.gtid, massVisible: true, action: 'change' })}>
            修改
          </a>
          <Divider type="vertical" />
          {getRevokeOption(record)}
        </>
      );
    }
    if (status === 'finished' || status === 'revoke') {
      return (
        <>
          {getReportsOption(record)}
          <Divider type="vertical" />
          {getDeleteOption(record)}
        </>
      );
    }
    if (status === 'schedule') {
      return (
        <>
          {getReportsOption(record)}
          <Divider type="vertical" />
          {getStopOption(record)}
        </>
      );
    }
    return <></>;
  };

  const renderChannel = (item: any) => {
    const { channel } = item;
    if (channel === 2) {
      return <Tag color="success">优质通道</Tag>;
    }
    if (channel === 1) {
      return <Tag>自有邮箱</Tag>;
    }
    return <Tag>其他({channel})</Tag>;
  };

  const renderStatus = (record: any) => {
    const { status } = record;
    if (status === 'draft') {
      return (
        <Tag icon={<EditOutlined />} color="default">
          草稿箱
        </Tag>
      );
    }
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
          等待审核
        </Tag>
      );
    }
    if (status === 'schedule') {
      return (
        <Tag icon={<ClockCircleOutlined />} color="default">
          定时中
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
    if (status === 'paused' || status === 'pause') {
      return (
        <Tag icon={<MinusCircleOutlined />} color="warning">
          已暂停
        </Tag>
      );
    }
    if (status === 'deny') {
      return (
        <Tag icon={<MinusCircleOutlined />} color="error">
          审核被拒
        </Tag>
      );
    }
    if (status === 'revoke') {
      return (
        <Tag icon={<MinusCircleOutlined />} color="warning">
          已撤销
        </Tag>
      );
    }
    return status;
  };

  const renderSeat = (item: any) => {
    const { seat } = item;
    if (seat === 'recycle') {
      return (
        <Tag color="red" icon={<DeleteOutlined />}>
          回收站
        </Tag>
      );
    }
    if (seat === 'list') {
      return <Tag color="blue">正常任务</Tag>;
    }
    if (seat === 'draft') {
      return <Tag>草稿箱</Tag>;
    }
    return seat;
  };

  const renderProcess = (progress: number) => {
    return <Progress percent={progress} size="small" />;
  };

  const renderPer = (per: number) => {
    return `${per}%`;
  };

  const renderTotal = (record: any) => {
    const { total_count } = record;
    return <a>{total_count}</a>;
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
    return '未知用户';
  };

  const columns: ColumnsType<any> = [
    {
      title: '任务id',
      dataIndex: 'gtid',
      width: 96,
    },
    {
      title: '创建者',
      dataIndex: 'userid',
      width: 128,
      render: (_: any, record: any) => renderUserid(record),
    },
    {
      title: '主题名称',
      dataIndex: 'name',
      width: 256,
    },
    {
      title: '发送渠道',
      dataIndex: 'channel',
      width: 100,
      render: (_: any, record: any) => renderChannel(record),
    },
    {
      title: '位置',
      dataIndex: 'seat',
      width: 100,
      render: (_: any, record: any) => renderSeat(record),
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      render: (_: any, record: any) => renderStatus(record),
    },
    {
      title: '发送进度',
      dataIndex: 'progress',
      render: (value: any) => renderProcess(value),
      width: 128,
    },
    {
      title: '总数',
      dataIndex: 'total_count',
      render: (_: any, record: any) => renderTotal(record),
      sorter: (a: any, b: any) => a.total_count - b.total_count,
      width: 96,
    },
    {
      title: '发送率',
      dataIndex: 'sendPer',
      width: 96,
      render: (value: any) => renderPer(value),
      // tip: '发送的邮件总数占有比例',
    },
    {
      title: '送达率',
      dataIndex: 'deliverPer',
      width: 96,
      render: (value: any) => renderPer(value),
      // tip: '送达的邮件总数占有比例',
    },
    {
      title: '阅读率',
      dataIndex: 'openedPer',
      width: 96,
      render: (value: any) => renderPer(value),
      // tip: '已经被阅读的邮件总数占有比例',
    },
    {
      title: '创建时间',
      dataIndex: 'create_time',
      width: 160,
      sorter: (a: any, b: any) => a.create_time - b.create_time,
      render: (_: any, record: any) => {
        const { create_time } = record;
        return exTimeToDateTime(create_time);
      },
    },
    {
      title: '开始时间',
      dataIndex: 'timeStart',
      width: 160,
      sorter: (a: any, b: any) => a.timeStart - b.timeStart,
      render: (_: any, record: any) => {
        const { timeStart } = record;
        return exTimeToDateTime(timeStart);
      },
    },
    {
      title: '操作',
      dataIndex: 'option',
      fixed: 'right',
      width: 134,
      render: (_: any, record: any) => getRenderOption(record),
    },
  ];

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
    if (owners && owners.length && owners[0] === value) {
      return <div className={styles.stardardFilterSelected}>创建者 ({owners.length})</div>;
    } else {
      return <span />;
    }
  };

  const seatTagRender = (prop: any) => {
    const { filterValues } = state;
    const { value } = prop;
    const { seat } = filterValues;
    if (seat && seat.length && seat[0] === value) {
      return <div className={styles.stardardFilterSelected}>任务位置 ({seat.length})</div>;
    }
    return <span />;
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

  const onPageParamsChange = (current: number, pageSize: number) => {
    setState({ current, pageSize });
    const { filterValues } = state;
    listRun({ current, pageSize, filter: filterValues });
  };

  const onFilterValuesChange = async (changeValues: any, allValues: any) => {
    setState({ filterValues: allValues });
    reloadTasksData(allValues);
  };

  return (
    <RightContainer pageTitle={false} pageGroup="marketing" pageActive="tasks">
      {state.detailsShow ? (
        <TaskDetails onCancel={() => setState({ detailsShow: false })} gtid={state.gtid} />
      ) : (
        <Card>
          <Card className='both-down'>
            <Row>
              <Col xl={12}>
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
                    <Form.Item name="seat" noStyle>
                      <Select
                        mode="multiple"
                        placeholder={
                          <div style={{ color: '#383838', textAlign: 'center' }}>
                            任务位置 <CaretDownOutlined />
                          </div>
                        }
                        bordered={false}
                        className={styles.stardardFilter}
                        showArrow={false}
                        tagRender={seatTagRender}
                        allowClear
                      >
                        <Select.Option key="list" value="list" title="正常任务">
                          正常任务
                        </Select.Option>
                        <Select.Option key="draft" value="draft">
                          草稿箱
                        </Select.Option>
                        <Select.Option key="recycle" value="recycle">
                          回收站
                        </Select.Option>
                      </Select>
                    </Form.Item>
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
                        <Select.Option key="deny" value="deny">
                          {renderStatus({ status: 'deny' })}
                        </Select.Option>
                        <Select.Option key="schedule" value="schedule">
                          {renderStatus({ status: 'schedule' })}
                        </Select.Option>
                        <Select.Option key="paused" value="paused">
                          {renderStatus({ status: 'paused' })}
                        </Select.Option>
                        <Select.Option key="revoke" value="revoke">
                          {renderStatus({ status: 'revoke' })}
                        </Select.Option>
                      </Select>
                    </Form.Item>
                    <Form.Item name="createTime">
                      <DateFilter name="创建时间" />
                    </Form.Item>
                    <Form.Item name="keyword" tooltip="任务名称关键词">
                      <Input.Search
                        key="searchKey"
                        placeholder="名称搜索"
                        style={{ width: 160, verticalAlign: 'middle' }}
                        className={styles.stardardFilter}
                        allowClear
                      />
                    </Form.Item>
                  </div>
                </Form>
              </Col>
              <Col xl={12} style={{ textAlign: 'right' }}>
                <Space size="large">
                  <Button loading={listLoading} onClick={listRefresh}>
                    刷新
                  </Button>
                  <Button
                    type="primary"
                    onClick={() => setState({ gtid: '', massVisible: true, action: 'create' })}
                  >
                    <PlusOutlined />
                    创建任务
                  </Button>
                </Space>
              </Col>
            </Row>
          </Card>
          <RcResizeObserver
            key="resize-observer"
            onResize={() => {
              const { innerHeight } = window;
              if (innerHeight >= 500) {
                const scrollY = innerHeight - 320;
                setState({ scrollY });
              }
            }}
          >
            <Table
              loading={listLoading}
              rowKey="gtid"
              dataSource={state.tasksData}
              className="both-up"
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
              scroll={{ x: '100%', y: state.scrollY }}
              onChange={onTblChange}
              size="middle"
            />
          </RcResizeObserver>
        </Card>
      )}
      <MassTaskOpt
        visible={state.massVisible}
        onCancel={() => setState({ massVisible: false })}
        actionReload={() => listRefresh()}
        taskId={state.gtid}
        action={state.action}
      />
    </RightContainer>
  );
};

export default Tasks;
