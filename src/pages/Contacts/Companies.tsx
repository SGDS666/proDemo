import React, { useEffect } from 'react';
import {
  Button,
  Card,
  Col,
  Form,
  Input,
  Popover,
  Row,
  Space,
  Table,
  Tooltip,
  Typography,
} from 'antd';
import RightContainer from '@/components/Global/RightContainer';
import { useSetState } from 'ahooks';
import { useRequest } from '@umijs/max';
import { EyeTwoTone, LinkedinOutlined } from '@ant-design/icons';
import styles from '@/pages/index.less';
import RcResizeObserver from 'rc-resize-observer';
const { Text } = Typography;
import type { ColumnsType } from 'antd/lib/table';
import 'moment/locale/zh-cn';
import { apiCompaniesShow } from '@/services/contacts';

const Tasks: React.FC = () => {
  const [state, setState] = useSetState<Record<string, any>>({
    filterValues: {},
    scrollY: 600,
    total: 0,
    current: 1,
    pageSize: 10,
    sort: {},
    keyword: '',
  });

  const {
    run: listRun,
    loading: listLoading,
    refresh: listRefresh,
  } = useRequest(apiCompaniesShow, {
    manual: true,
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

  const reloadTasksData = (values?: any) => {
    const { filterValues, current, pageSize, sort, keyword } = state;
    if (!values) {
      // eslint-disable-next-line no-param-reassign
      values = filterValues;
    }
    listRun({ filter: values, current, pageSize, sort, keyword });
  };

  const renderWebsite = (record: any) => {
    const { website, black, domain } = record;
    if (!website) {
      return null;
    }
    let url = website;
    if (website.indexOf('http') < 0) {
      url = `http://${website}`;
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
          <Tooltip title={website}>
            <div style={{ width: 200, whiteSpace: 'nowrap', overflow: 'hidden' }}>
              <Text delete>
                <a target="_blank" rel="noopener noreferrer" href={url}>
                  <span style={{ color: '#999' }}>{website}</span>
                </a>
              </Text>
            </div>
          </Tooltip>
        </Space>
      );
    }
    return (
      <Space>
        {popImg}
        {popLogo}
        <Tooltip title={website}>
          <div style={{ width: 200, whiteSpace: 'nowrap', overflow: 'hidden' }}>
            <a target="_blank" rel="noopener noreferrer" href={url}>
              {website}
            </a>
          </div>
        </Tooltip>
      </Space>
    );
  };

  const renderOthers = (value: string, width: number) => {
    return (
      <Tooltip title={value}>
        <div style={{ width, whiteSpace: 'nowrap', overflow: 'hidden' }}>{value}</div>
      </Tooltip>
    );
  };

  const renderCountryFlag = (record: any) => {
    const { countryCode } = record;
    if (!countryCode) return null;
    if (countryCode === 'unkown') return null;
    return (
      <span>
        <img
          src={`https://files.laifaxin.com/flags/countries_flags/${countryCode}.png`}
          width={24}
        />{' '}
        {countryCode}
      </span>
    );
  };

  const renderSocial = (record: any) => {
    if (!record) return null;
    const { linkedin_url, zoominfo_url } = record;
    if (linkedin_url) {
      return (
        <a target="_blank" rel="noopener noreferrer" href={linkedin_url}>
          <h3>
            <LinkedinOutlined />
          </h3>
        </a>
      );
    }
    if (zoominfo_url) {
      return (
        <a target="_blank" rel="noopener noreferrer" href={zoominfo_url}>
          <h3>🅉</h3>
        </a>
      );
    }
    return null;
  };

  const columns: ColumnsType<any> = [
    {
      title: '域名',
      dataIndex: 'domain',
      sorter: (a: any, b: any) => a.website - b.website,
      width: state.total ? 240 : undefined,
    },
    {
      title: '公司名称',
      dataIndex: 'name',
      sorter: (a: any, b: any) => a.website - b.website,
      width: state.total ? 240 : undefined,
    },
    {
      title: '主页',
      dataIndex: 'website',
      sorter: (a: any, b: any) => a.website - b.website,
      render: (_: any, record: any) => renderWebsite(record),
      width: state.total ? 240 : undefined,
    },
    {
      title: '国家',
      dataIndex: 'countryCode',
      sorter: (a: any, b: any) => a.countryCode - b.countryCode,
      render: (_: any, record: any) => renderCountryFlag(record),
      width: 80,
    },
    {
      title: '规模',
      dataIndex: 'company_size',
      sorter: (a: any, b: any) => a.company_size - b.company_size,
      width: 96,
    },
    {
      title: '谷歌收录数',
      dataIndex: 'gg_total',
      sorter: (a: any, b: any) => a.gg_total - b.gg_total,
      width: 128,
    },
    {
      title: '社媒',
      dataIndex: 'linkedin_url',
      render: (_: any, record: any) => renderSocial(record),
      width: 64,
    },
    {
      title: '行业',
      dataIndex: 'industries',
      sorter: (a: any, b: any) => a.industries - b.industries,
      render: (_: any, record: any) => renderOthers(record.industries, 128),
      width: 128,
    },
    {
      title: '类型',
      dataIndex: 'type',
      sorter: (a: any, b: any) => a.type - b.type,
      render: (_: any, record: any) => renderOthers(record.type, 128),
      width: 128,
    },
    {
      title: '主营',
      dataIndex: 'specialties',
      sorter: (a: any, b: any) => a.specialties - b.specialties,
      render: (_: any, record: any) => renderOthers(record.specialties, 240),
      width: state.total ? 180 : undefined,
    },
    {
      title: '网站标题',
      dataIndex: 'gg_title',
      ellipsis: true,
      width: state.total ? 180 : undefined,
    },
    {
      title: '网站描述',
      dataIndex: 'gg_desc',
      ellipsis: true,
      width: state.total ? 240 : undefined,
    },
    // {
    //   title: '操作',
    //   dataIndex: 'result',
    //   width: 116,
    //   fixed: 'right',
    //   render: (_: any, record: any) => renderDisplayMore(record),
    // },
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
    const { filterValues, keyword } = state;
    listRun({ current, pageSize, filter: filterValues, sort, keyword });
  };

  useEffect(() => {
    reloadTasksData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onPageParamsChange = (current: number, pageSize: number) => {
    setState({ current, pageSize });
    const { filterValues, keyword } = state;
    listRun({ current, pageSize, filter: filterValues, keyword });
  };

  const onFilterValuesChange = async (changeValues: any, allValues: any) => {
    setState({ filterValues: allValues });
    // reloadTasksData(allValues);
  };

  return (
    <RightContainer pageTitle={false} pageGroup="contacts" pageActive="companies">
      <Card style={{ display: state.detailsShow ? 'none' : '' }}>
        <Card>
          <Row>
            <Col xl={12}>
              <Form
                layout="inline"
                initialValues={state.filterValues}
                onValuesChange={onFilterValuesChange}
              >
                <div className={styles.standardFilterConditions}>
                  <Form.Item name="keyword" tooltip="任务名称关键词">
                    <Input.Search
                      key="searchKey"
                      placeholder="域名或名称关键词"
                      style={{ width: 360, verticalAlign: 'middle' }}
                      className={styles.stardardFilter}
                      allowClear
                      onSearch={() => reloadTasksData()}
                      onChange={(e) => setState({ keyword: e.target.value })}
                      enterButton
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
            rowKey="domain"
            dataSource={state.tasksData}
            columns={columns}
            pagination={{
              position: ['bottomCenter'],
              total: state.total,
              pageSize: state.pageSize,
              current: state.current,
              showTotal: (total) => `公司数量 ${total} `,
              onChange: onPageParamsChange,
            }}
            scroll={state.total ? { x: '100%', y: state.scrollY } : {}}
            onChange={onTblChange}
          />
        </RcResizeObserver>
      </Card>
    </RightContainer>
  );
};

export default Tasks;
