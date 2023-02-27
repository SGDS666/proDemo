import React, { useEffect } from 'react';
import { Button, Card, Col, Form, Row, Space, Table, Tag, TreeSelect } from 'antd';
import { useSetState } from 'ahooks';
import RightContainer from '@/components/Global/RightContainer';
import { apiExportHistory } from '@/services/contacts';
import { useModel, useRequest, history } from '@umijs/max';
import { exTimeToDateTime, exTimes } from '@/utils/common';
import { CaretDownOutlined, DownloadOutlined } from '@ant-design/icons';
import { apiSubordinateUsers } from '@/services/enterprise';
import styles from '@/pages/index.less';
import { yieldDelayCss } from '@/utils/animation';

const ExportHistory: React.FC = () => {
  const [state, setState] = useSetState<Record<string, any>>({
    total: 0,
    current: 1,
    pageSize: 10,
    filter: {},
    dataSource: [],
    owners: [],
    userTreeData: [],
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

  const { run: dataRun, loading } = useRequest(apiExportHistory, {
    manual: true,
    onSuccess: (data: any) => {
      if (!data) return;
      const { current, total, pageSize, list } = data;
      setState({ current, total, pageSize, dataSource: list });
    },
  });

  const renderDownload = (item: any) => {
    if (!initialState?.currentUser) {
      return '';
    }
    const { uid, userid, isOrg } = initialState.currentUser;
    const { status, downUrl, uid: operUid, userid: operUserid } = item;
    if (!isOrg || uid === operUid || userid === operUserid) {
      if (`${status}` === '1') {
        return (
          <span>
            <a href={downUrl}>
              <DownloadOutlined /> 下载
            </a>
          </span>
        );
      } else {
        return null;
      }
    }
    return null;
  };

  const columns = [
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (_: any, record: any) => {
        const { status } = record;
        if (`${status}` === '0') {
          return <Tag color="#2db7f5">正在导出</Tag>;
        }
        if (`${status}` === '1') {
          return <Tag color="#87d068">完成</Tag>;
        }
        return <Tag>其他({status})</Tag>;
      },
    },
    {
      title: '导出用户',
      dataIndex: 'userName',
      key: 'userName',
    },
    {
      title: '字段长度',
      dataIndex: 'fieldLength',
      key: 'fieldLength',
    },
    {
      title: '纪录数',
      dataIndex: 'dataLength',
      key: 'dataLength',
    },
    {
      title: '导出时间',
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
      title: '文件名',
      dataIndex: 'downUrl',
      key: 'downUrl',
      render: (_: any, record: any) => renderDownload(record),
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

  const onFilterValuesChange = async (changeValues: any, allValues: any) => {
    setState({ filterValues: allValues });
    const { current, pageSize } = state;
    dataRun({ current, pageSize, filter: allValues });
  };

  const getData = () => {
    const { current, pageSize, filterValues } = state;
    dataRun({ current, pageSize, filter: filterValues });
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
  const delay = yieldDelayCss({ max: 2, delay: 0.15 })
  return (
    <RightContainer pageTitle={false} pageGroup="contacts" pageActive="export-history">
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
                <Button type="primary" onClick={() => history.push('/contacts/contacts')}>
                  导出
                </Button>
              </Space>
            </Col>
          </Row>
        </Card>

        <Table
          className='both-up'
          style={{ animationDelay: delay.next().value! }}
          rowKey="id"
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

export default ExportHistory;
