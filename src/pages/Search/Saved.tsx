import React, { useEffect } from 'react';
import {
  Card,
  Tag,
  Table,
  Progress,
  message,
  Button,
  Modal,
  Row,
  Space,
  Col,
  Divider,
  Typography,
  Form,
  TreeSelect,
  Tooltip,
} from 'antd';
import RightContainer from '@/components/Global/RightContainer';
import {
  apiSearchSavedList,
  apiSearchSavedStop,
  apiSearchSavedStart,
  apiSearchSavedEnd,
  apiSearchSavedDownload,
  apiPreviewTotayCount,
} from '@/services/search';
import { useSetState } from 'ahooks';
import { useRequest, history } from '@umijs/max';
import { exTimeToDateTime } from '@/utils/common';
import {
  CaretDownOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  MinusCircleOutlined,
  SyncOutlined,
  ZoomInOutlined,
} from '@ant-design/icons';
import { apiTagsList } from '@/services/contacts';
import { apiSubordinateUsers } from '@/services/enterprise';
import type { ColumnsType } from 'antd/lib/table';
import styles from '@/pages/index.less';

const TaskSaved: React.FC = () => {
  const [state, setState] = useSetState<Record<string, any>>({
    total: 0,
    current: 1,
    pageSize: 10,
    filter: {},
    dataSource: [],
    tagsList: [],
    // app: 'wechat',
    // codeUrl: 'https://laifaxin.com',
    // id: '',
    // paySearchVisible: false,
    // qrcodeVisible: false,
    owners: [],
    userTreeData: [],
    filterValues: [],
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

  const { data: countData } = useRequest(apiPreviewTotayCount);

  const { run: tagsListRun } = useRequest(apiTagsList, {
    manual: true,
    onSuccess: (data: any) => {
      if (!data) return;
      setState({ tagsList: data });
    },
  });

  const { run: dataRun, loading } = useRequest(apiSearchSavedList, {
    manual: true,
    pollingInterval: 15000,
    onSuccess: (data: any) => {
      if (!data) return;
      const { current, total, pageSize, list } = data;
      setState({ current, total, pageSize, dataSource: list });
    },
  });

  const getData = () => {
    const { current, pageSize, filter } = state;
    dataRun({ current, pageSize, filter });
  };

  const { run: endRun, loading: endLoading } = useRequest(apiSearchSavedEnd, {
    manual: true,
    onSuccess: () => {
      message.success('操作成功');
      getData();
    },
  });

  const { run: downloadRun } = useRequest(apiSearchSavedDownload, {
    manual: true,
    onSuccess: (data: any) => {
      if (!data) return;
      const { url } = data;
      if (url) {
        getData();
        window.open(url);
      } else {
        message.success('文件下载失败');
      }
    },
  });

  const onClickDownload = (record: any) => {
    const { _id } = record;
    Modal.confirm({
      title: `下载结果`,
      content: `确定下载结果`,
      onOk: () => downloadRun({ saveId: _id }),
    });
  };

  const renderStatus = (record: any) => {
    const { status } = record;
    if (status === 'running') {
      return (
        <Tag icon={<SyncOutlined spin />} color="processing">
          保存中
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
    if (status === 'deleted') {
      return (
        <Tag icon={<CloseCircleOutlined />} color="error">
          已删除
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

  const renderTypes = (record: any) => {
    const { types } = record;
    if (types.indexOf('personal') >= 0 && types.indexOf('generic') >= 0) {
      return (
        <>
          <Tag color="processing">精准</Tag>
          <Tag color="success">普通</Tag>
        </>
      );
    }
    if (types.indexOf('personal') >= 0) {
      return <Tag color="processing">精准</Tag>;
    }
    if (types.indexOf('generic') >= 0) {
      return <Tag color="success">普通</Tag>;
    }
    return JSON.stringify(types);
  };

  const renderProcess = (record: any) => {
    const { progress } = record;
    return <Progress percent={progress} size="small" />;
  };

  const { run: startRun, loading: startLoading } = useRequest(apiSearchSavedStart, {
    manual: true,
    onSuccess: () => {
      message.success('操作成功');
      getData();
    },
  });

  const { run: stopRun, loading: stopLoading } = useRequest(apiSearchSavedStop, {
    manual: true,
    onSuccess: () => {
      message.success('操作成功');
      getData();
    },
  });

  const onClickEndAction = (saveId: string) => {
    Modal.confirm({
      title: `结束保存任务`,
      content: `确定结束该保存任务？该操作不可恢复`,
      onOk: () => endRun({ saveId }),
    });
  };

  const renderAction = (record: any) => {
    const { status, _id, downUrl } = record;
    if (status === 'running') {
      return (
        <Button type="link" loading={stopLoading} onClick={() => stopRun({ saveId: _id })} danger>
          暂停
        </Button>
      );
    }
    if (status === 'paused') {
      return (
        <>
          <Button
            style={{ padding: 0 }}
            type="link"
            loading={startLoading}
            onClick={() => startRun({ saveId: _id })}
          >
            继续
          </Button>
          <Divider type="vertical" />
          <Button
            style={{ padding: 0 }}
            type="link"
            loading={endLoading}
            onClick={() => onClickEndAction(_id)}
            danger
          >
            结束
          </Button>
        </>
      );
    }
    if (downUrl) {
      return (
        <a style={{ color: 'green', marginLeft: 12 }} href={downUrl}>
          下载
        </a>
      );
    }
    if (status === 'finished' && !downUrl) {
      return (
        <a onClick={() => onClickDownload(record)} style={{ marginLeft: 12 }}>
          下载
        </a>
      );
    }
    return <span> </span>;
  };

  const renderTags = (record: any) => {
    const { tags } = record;
    const { tagsList } = state;
    if (!tags) return null;
    const tList = tags.map((id: string) => {
      const idx = tagsList.findIndex((item: any) => item.id === id);
      if (idx >= 0) {
        const { name, color } = tagsList[idx];
        return (
          <Tag key={id} color={color}>
            {name}
          </Tag>
        );
      }
      return null;
    });
    return (
      <Tooltip title={tList}>
        <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {tList}
        </div>
      </Tooltip>
    );
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
      title: '任务ID/域名',
      dataIndex: 'task_id',
      width: 128,
      ellipsis: {
        showTitle: false,
      },
      render: (task_id) => (
        <Tooltip placement="topLeft" title={task_id}>
          {task_id}
        </Tooltip>
      ),
    },
    {
      title: '保存类型',
      dataIndex: 'types',
      render: (_: any, record: any) => renderTypes(record),
      width: 128,
    },
    {
      title: '标签',
      dataIndex: 'tags',
      render: (_: any, record: any) => renderTags(record),
      width: 128,
    },
    {
      title: '状态',
      dataIndex: 'status',
      render: (_: any, record: any) => renderStatus(record),
      width: 128,
    },
    {
      title: '进度',
      dataIndex: 'progress',
      render: (_: any, record: any) => renderProcess(record),
      width: 128,
    },
    {
      title: '选中数量',
      dataIndex: 'selectNum',
      width: 96,
    },
    {
      title: '数量限制',
      dataIndex: 'maxCount',
      width: 96,
    },
    {
      title: '精准邮箱',
      dataIndex: 'personalCount',
      width: 96,
    },
    {
      title: '保存数量',
      dataIndex: 'personalSave',
      width: 96,
    },
    {
      title: '消费点数',
      dataIndex: 'personalCost',
      width: 96,
    },
    {
      title: '普通邮箱',
      dataIndex: 'genericCount',
      width: 96,
    },
    {
      title: '保存数量',
      dataIndex: 'genericSave',
      width: 96,
    },
    {
      title: '消费点数',
      dataIndex: 'genericCost',
      width: 96,
    },
    {
      title: '提示',
      dataIndex: 'message',
      width: 128,
    },
    {
      title: '创建者',
      dataIndex: 'userid',
      width: 128,
      render: (_: any, record: any) => renderUserid(record),
    },
    {
      title: '创建时间',
      dataIndex: 'create_time',
      width: 160,
      render: (_: any, record: any) => {
        const { create_time } = record;
        return exTimeToDateTime(create_time);
      },
    },
    {
      title: '操作',
      dataIndex: 'status',
      fixed: 'right',
      width: 112,
      render: (_: any, record: any) => renderAction(record),
    },
  ];

  const onPageParamsChange = (current: number, pageSize: number) => {
    setState({ current, pageSize });
    const { filterValues } = state;
    dataRun({ current, pageSize, filter: filterValues });
  };

  useEffect(() => {
    tagsListRun();
    getData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // const openQrcode = (id: string, app: string, codeUrl: string) => {
  //   setState({ id, app, codeUrl, qrcodeVisible: true });
  // };

  const onFilterValuesChange = async (changeValues: any, allValues: any) => {
    setState({ filterValues: allValues });
    const { current, pageSize } = state;
    dataRun({ current, pageSize, filter: allValues });
  };

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

  return (
    <RightContainer pageTitle={false} pageGroup="search" pageActive="saved">
      <Card>
        <Card>
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
                </div>
              </Form>
            </Col>
            <Col span={12} style={{ textAlign: 'right', paddingRight: 24 }}>
              <Space size="large">
                <Typography.Text type="warning" style={{ fontSize: 16, marginLeft: 12 }}>
                  已保存的邮箱可在联系人中查看
                </Typography.Text>
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
                <Button onClick={() => getData()} loading={loading}>
                  刷新
                </Button>
              </Space>
            </Col>
          </Row>
        </Card>
        <Table
          rowKey="_id"
          loading={loading}
          dataSource={state.dataSource}
          columns={columns}
          pagination={{
            position: ['bottomCenter'],
            total: state.total,
            pageSize: state.pageSize,
            current: state.current,
            showTotal: (total: number) => `总纪录数 ${total} `,
            onChange: onPageParamsChange,
          }}
          scroll={{ y: 800, x: '100%' }}
          size="middle"
        />
      </Card>
    </RightContainer>
  );
};

export default TaskSaved;
