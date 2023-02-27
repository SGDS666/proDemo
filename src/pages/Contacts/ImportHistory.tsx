import React, { useEffect } from 'react';
import {
  Alert,
  Button,
  Card,
  Col,
  Form,
  Popconfirm,
  Popover,
  Row,
  Space,
  Table,
  Tag,
  TreeSelect,
} from 'antd';
import { useSetState } from 'ahooks';
import RightContainer from '@/components/Global/RightContainer';
import { apiImportHistory, apiImportHistoryDelete } from '@/services/contacts';
import { useModel, useRequest, history } from '@umijs/max';
import { CaretDownOutlined, DownloadOutlined } from '@ant-design/icons';
import { exTimes, exTimeToDateTime } from '@/utils/common';
import { apiSubordinateUsers } from '@/services/enterprise';
import styles from '@/pages/index.less';
import { yieldDelayCss } from '@/utils/animation';

const ImportHistory: React.FC = () => {
  const [state, setState] = useSetState<Record<string, any>>({
    total: 0,
    current: 1,
    pageSize: 10,
    filter: {},
    dataSource: [],
    filterValues: {},
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

  const { initialState } = useModel('@@initialState');

  const { run: dataRun, loading } = useRequest(apiImportHistory, {
    manual: true,
    onSuccess: (data: any) => {
      if (!data) return;
      const { current, total, pageSize, list } = data;
      setState({ current, total, pageSize, dataSource: list });
    },
  });

  const { run: deleteRun } = useRequest(apiImportHistoryDelete, {
    manual: true,
    onSuccess: () => {
      const { current, pageSize, filter } = state;
      dataRun({ current, pageSize, filter });
    },
  });

  const renderFileName = (item: any) => {
    if (!initialState?.currentUser) {
      return '';
    }
    const { uid, userid, isOrg } = initialState.currentUser;
    const { file_name, downUrl, uid: operUid, userid: operUserid } = item;
    if (!isOrg || uid === operUid || userid === operUserid) {
      return (
        <span>
          {file_name}{' '}
          <a href={downUrl} download={file_name}>
            <DownloadOutlined />
          </a>
        </span>
      );
    }
    return file_name;
  };

  const onFilterValuesChange = async (changeValues: any, allValues: any) => {
    setState({ filterValues: allValues });
    const { current, pageSize } = state;
    dataRun({ current, pageSize, filter: allValues });
  };

  const renderErrors = (record: any) => {
    const { errors } = record;
    if (!errors || !errors.length) {
      return '';
    }
    const tags = errors.map(({ row, code }: any) => {
      let color = 'warning';
      if (code === -1) {
        // 0 -1
        color = 'error';
      }
      return (
        <Tag color={color} key={row}>
          {row}
        </Tag>
      );
    });
    const content = (
      <div style={{ maxWidth: 600 }}>
        <Alert
          message={
            <div>
              <Tag color="warning" style={{ padding: 2, marginRight: 0 }}>
                黄色
              </Tag>
              代表邮箱格式错误，
              <Tag color="error" style={{ padding: 2, marginRight: 0 }}>
                红色
              </Tag>
              代表邮箱重复，最多显示100条
            </div>
          }
          type="info"
          showIcon
        />
        <div style={{ marginTop: 12 }}>{tags}</div>
      </div>
    );
    return (
      <Popover content={content} title={<div style={{ fontSize: 16 }}>错误行号</div>}>
        <a>失败行号</a>
      </Popover>
    );
  };

  const renderDelete = (record: any) => {
    const { status, create_time } = record;
    if (status !== 1) {
      return (
        <Popconfirm
          key="DeleteButton"
          title="确认删除?"
          onConfirm={() => deleteRun({ iid: record.iid })}
        >
          <a style={{ color: 'red' }}>删除</a>
        </Popconfirm>
      );
    }
    const now = Date.now();
    if (now - create_time >= 24 * 3600 * 1000) {
      return (
        <Popconfirm
          key="DeleteButton"
          title="确认删除?"
          onConfirm={() => deleteRun({ iid: record.iid })}
        >
          <a style={{ color: 'red' }}>删除</a>
        </Popconfirm>
      );
    }
    return null;
  };

  const columns = [
    {
      title: '导入ID',
      dataIndex: 'iid',
      key: 'iid',
    },
    {
      title: '导入用户',
      dataIndex: 'userName',
      key: 'userName',
    },
    {
      title: '文件名',
      dataIndex: 'file_name',
      key: 'file_name',
      render: (_: any, record: any) => renderFileName(record),
    },
    {
      title: '类型',
      dataIndex: 'importType',
      key: 'importType',
      render: (_: any, record: any) => {
        const { importType } = record;
        if (importType === 0) {
          return <Tag>等待导入</Tag>;
        }
        if (importType === 1) {
          return <Tag color="green">新增</Tag>;
        }
        if (importType === 2) {
          return <Tag color="cyan">更新</Tag>;
        }
        if (importType === 3) {
          return <Tag>新增{'&'}更新</Tag>;
        }
        return '';
      },
    },
    {
      title: '标签',
      dataIndex: 'tagNames',
      key: 'tags',
      render: (tags: string[]) => (
        <>
          {tags.map((tag: string) => (
            <Tag color="blue" key={tag}>
              {tag}
            </Tag>
          ))}
        </>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (_: any, record: any) => {
        const { status } = record;
        if (status === 0) {
          return <Tag>等待导入</Tag>;
        }
        if (status === 1) {
          return <Tag color="#2db7f5">正在导入</Tag>;
        }
        if (status === 2) {
          return <Tag color="#87d068">完成</Tag>;
        }
        return <Tag>其他({status})</Tag>;
      },
    },
    {
      title: '纪录数',
      dataIndex: 'total',
      key: 'total',
    },
    {
      title: '成功',
      dataIndex: 'success',
      key: 'success',
    },
    {
      title: '失败',
      dataIndex: 'fail',
      key: 'fail',
    },
    {
      title: '失败日志',
      dataIndex: 'errors',
      key: 'errors',
      render: (_: any, record: any) => renderErrors(record),
    },
    {
      title: '导入时间',
      dataIndex: 'create_time',
      key: 'create_time',
      render: (_: any, record: any) => {
        const { create_time } = record;
        return exTimeToDateTime(create_time);
      },
    },
    {
      title: '耗时',
      dataIndex: 'times',
      key: 'times',
      render: (_: any, record: any) => {
        const { times } = record;
        return exTimes(times);
      },
    },
    {
      title: '更多',
      dataIndex: 'option',
      valueType: 'option',
      render: (_: any, record: any) => renderDelete(record),
    },
  ];

  const onPageParamsChange = (current: number, pageSize: number) => {
    setState({ current, pageSize });
    const { filter } = state;
    dataRun({ current, pageSize, filter });
  };

  useEffect(() => {
    const { current, pageSize, filter } = state;
    dataRun({ current, pageSize, filter });
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

  const getData = () => {
    const { current, pageSize, filterValues } = state;
    dataRun({ current, pageSize, filter: filterValues });
  };
  const delay = yieldDelayCss({ max: 2, delay: 0.15 })
  return (
    <RightContainer pageTitle={false} pageGroup="contacts" pageActive="import-history">
      <Card title={false} className='both-down'>
        <Card className='both-down' style={{ animationDelay: delay.next().value! }}>
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
                <Button onClick={() => getData()} loading={loading}>
                  刷新
                </Button>
                <Button type="primary" onClick={() => history.push('/contacts/contacts-import')}>
                  导入
                </Button>
              </Space>
            </Col>
          </Row>
        </Card>

        <Table
          className='both-up'
          style={{ animationDelay: delay.next().value! }}
          rowKey="iid"
          loading={loading}
          dataSource={state.dataSource}
          columns={columns}
          pagination={{
            position: ['bottomCenter'],
            total: state.total,
            pageSize: state.pageSize,
            current: state.current,
            showTotal: (total) => `总纪录数 ${total} `,
            onChange: onPageParamsChange,
          }}
        />
      </Card>
    </RightContainer>
  );
};

export default ImportHistory;
