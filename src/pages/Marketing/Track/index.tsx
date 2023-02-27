import React, { useEffect } from 'react';
import { Tag, Tooltip, Form, Select, Card, Table, TreeSelect, Space, Checkbox, Button } from 'antd';
import { CaretDownOutlined } from '@ant-design/icons';
import { useSetState } from 'ahooks';
import { apiTrackLogs, apiTrackTags } from '@/services/tasks';
import { deviceInfo, exTimeToDateTime } from '@/utils/common';
import RightContainer from '@/components/Global/RightContainer';
import RcResizeObserver from 'rc-resize-observer';
import styles from '@/pages/index.less';
import { apiSubordinateUsers } from '@/services/enterprise';
import { useRequest } from '@umijs/max';
import DateFilter from '@/components/Common/DateFilter';
import ContactsTags from './components/ContactsTags';

const TaskTtack: React.FC = () => {
  const [state, setState] = useSetState<Record<string, any>>({
    selectKey: 'all',
    readCount: 0,
    unreadCount: 0,
    act: 'all',
    outputVisible: false,
    owners: [],
    filterValues: {},
    scrollY: 600,
    sort: {},
    tblSelectKeys: [],
    total: 0,
    current: 1,
    pageSize: 10,
    tableData: [],
    userTreeData: [],
    multiTagsVisible: false, // 批量标签修改
    multiTagsAction: 'push', // 默认贴标签
  });

  const { run: listRun, loading: listLoading } = useRequest(apiTrackLogs, {
    manual: true,
    debounceInterval: 500,
    onSuccess: async (data: any) => {
      const { list, current, total } = data;
      setState({ tableData: list, current, total });
    },
  });

  const { run: tagsRun, loading: tagsLoading } = useRequest(apiTrackTags, {
    manual: true,
    onSuccess: () => {
      setState({ multiTagsVisible: false, tblSelectKeys: [] });
    },
  });

  const onMultiTags = (values: any) => {
    const { tagValues } = values;
    const action = state.multiTagsAction;
    const ids = state.tblSelectKeys;
    tagsRun({ tags: tagValues, action, ids });
  };

  const renderAddress = (record: any) => {
    const { country, regionName, city, county, ip } = record;
    let msg = '';
    if (regionName) {
      msg += regionName;
    }
    if (city) {
      msg += city;
    }
    if (county) {
      msg += county;
    }

    if (country === '中国') {
      return (
        <Tooltip title={`${msg}(${ip})`}>
          <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {msg}({ip})
          </div>
        </Tooltip>
      );
    }
    return (
      <Tooltip title={`${country}${msg}(${ip})`}>
        <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {country}
          {msg}({ip})
        </div>
      </Tooltip>
    );
  };

  const renderAct = (record: any) => {
    const { act } = record;
    if (!act) {
      return null;
    }
    if (act === 'read') {
      return <Tag color="#87d068">阅读</Tag>;
    }
    if (act === 'click') {
      return <Tag color="#2db7f5">点击</Tag>;
    }
    if (act === 'download') {
      return <Tag color="#108ee9">下载</Tag>;
    }
    if (act === 'reply') {
      return <Tag color="#3b5999">回复</Tag>;
    }
    return act;
  };

  const renderType = (record: any) => {
    const { sid } = record;
    if (sid && sid.indexOf('lfxbbr_') === 0) {
      return '写信';
    }
    if (sid) {
      return '营销';
    }
    return '未知';
  };

  const renderDeviceInfo = (record: any) => {
    const { device } = record;
    return deviceInfo(device);
  };

  const renderTooltipTxt = (value: string) => {
    if (!value) {
      return '-';
    }
    return (
      <Tooltip title={value}>
        <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {value}
        </div>
      </Tooltip>
    );
  };

  const columns: any = [
    {
      title: '事件时间',
      dataIndex: 'time',
      width: 145,
      render: (_: any, record: any) => {
        const { time } = record;
        return exTimeToDateTime(time);
      },
    },
    {
      title: '行为',
      dataIndex: 'act',
      width: 50,
      render: (_: any, record: any) => renderAct(record),
    },
    {
      title: '地址信息',
      dataIndex: 'country',
      ellipsis: true,
      render: (_: any, record: any) => renderAddress(record),
      width: 180,
    },
    {
      title: '运营商',
      dataIndex: 'isp',
      width: 75,
      ellipsis: true,
    },
    {
      title: '设备',
      dataIndex: 'device',
      render: (_: any, record: any) => renderDeviceInfo(record),
      width: 160,
    },
    {
      title: '主题/链接/附件',
      dataIndex: 'other',
      width: 120,
      render: (_: any, record: any) => renderTooltipTxt(record.other),
    },
    {
      title: '类型',
      dataIndex: 'type',
      render: (_: any, record: any) => renderType(record),
      width: 50,
    },
    {
      title: '主题',
      dataIndex: 'subject',
      render: (_: any, record: any) => renderTooltipTxt(record.subject),
      width: 180,
    },
    {
      title: '收信人',
      dataIndex: 'to',
      render: (_: any, record: any) => renderTooltipTxt(record.to),
      width: 145,
    },
    {
      title: '发信时间',
      dataIndex: 'sTime',
      width: 145,
      render: (_: any, record: any) => {
        const { sTime } = record;
        return exTimeToDateTime(sTime);
      },
    },
    {
      title: '发信人',
      dataIndex: 'from',
      ellipsis: true,
      width: 145,
    },
  ];

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

  const actionTagRender = (prop: any) => {
    const { filterValues } = state;
    const { value } = prop;
    const { act } = filterValues;
    if (act && act.length && act[0] === value) {
      return <div className={styles.stardardFilterSelected}>追踪类型 ({act.length})</div>;
    }
    return <span />;
  };

  const reloadTableData = (values?: any) => {
    const { filterValues, pageSize, sort } = state;
    if (!values) {
      // eslint-disable-next-line no-param-reassign
      values = filterValues;
    }
    setState({ current: 1 });
    listRun({ filter: values, current: 1, pageSize, sort });
  };

  useEffect(() => {
    reloadTableData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onFilterValuesChange = async (changeValues: any, allValues: any) => {
    setState({ filterValues: allValues });
    reloadTableData(allValues);
  };

  const onPageParamsChange = (current: number, pageSize: number) => {
    setState({ current, pageSize });
    const { filterValues } = state;
    listRun({ current, pageSize, filter: filterValues });
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
    <RightContainer pageTitle={false} pageGroup="marketing" pageActive="tracks">
      <Card>
        <Card className='both-down'>
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
                        归属员工 <CaretDownOutlined />
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
              <Form.Item name="act" noStyle>
                <Select
                  mode="multiple"
                  placeholder={
                    <div style={{ color: '#383838', textAlign: 'center' }}>
                      追踪类型 <CaretDownOutlined />
                    </div>
                  }
                  tagRender={actionTagRender}
                  bordered={false}
                  className={styles.stardardFilter}
                  allowClear
                >
                  <Select.Option key="read" value="read">
                    邮箱阅读
                  </Select.Option>
                  <Select.Option key="click" value="click">
                    链接点击
                  </Select.Option>
                  <Select.Option key="download" value="download">
                    附件下载
                  </Select.Option>
                </Select>
              </Form.Item>
              {
                <Form.Item name="time">
                  <DateFilter name="事件时间" />
                </Form.Item>
              }
              {
                <Form.Item name="sTime">
                  <DateFilter name="发送时间" />
                </Form.Item>
              }
              {/* <Form.Item name="keyword" tooltip="任务名称关键词">
                <Input.Search
                  key="searchKey"
                  placeholder="名称搜索"
                  style={{ width: 160, verticalAlign: 'middle' }}
                  className={styles.stardardFilter}
                  allowClear
                />
              </Form.Item> */}
            </div>
          </Form>
        </Card>
        <div className={styles['tbl-operator']} hidden={!state.tblSelectKeys.length}>
          <Space size={24}>
            <Checkbox
              indeterminate={state.tblSelectKeys.length !== state.tableData.length}
              checked={state.tblSelectKeys.length > 0}
              onChange={(e) => onActionSelectChange(e.target.checked)}
            />
            <span>
              已选 <a>{state.tblSelectKeys.length}</a> 项数据
            </span>
            <Button
              key="222"
              onClick={() => setState({ multiTagsVisible: true, multiTagsAction: 'push' })}
              size="small"
              type="primary"
            >
              贴标签
            </Button>
          </Space>
        </div>
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
            className='both-up'
            loading={listLoading}
            rowKey="_id"
            dataSource={state.tableData}
            columns={columns}
            pagination={{
              position: ['bottomCenter'],
              total: state.total,
              pageSize: state.pageSize,
              current: state.current,
              showTotal: (total) => `结果数 ${total} `,
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
          />
        </RcResizeObserver>
      </Card>
      <ContactsTags
        visible={state.multiTagsVisible}
        onCancel={() => setState({ multiTagsVisible: false })}
        rowCount={state.tblSelectKeys.length}
        multiTags={(values: any) => onMultiTags(values)}
        loading={tagsLoading}
        action={state.multiTagsAction}
      />
    </RightContainer>
  );
};

export default TaskTtack;
