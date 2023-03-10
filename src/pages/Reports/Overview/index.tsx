import type { FC } from 'react';
import { useEffect } from 'react';
import {
  Card,
  Col,
  Row,
  DatePicker,
  Button,
  Tooltip,
  Table,
  Statistic,
  Form,
  TreeSelect,
  Space,
} from 'antd';
import {
  TeamOutlined,
  MailOutlined,
  ContactsOutlined,
  DollarOutlined,
  QuestionCircleOutlined,
  SearchOutlined,
  GlobalOutlined,
  HomeOutlined,
  CaretDownOutlined,
} from '@ant-design/icons';
import PageContainer from '@/components/Global/RightContainer';
import styles from './style.less';
import { useSetState } from 'ahooks';
import { getTimeDistance } from './utils/utils';
import type { RangePickerProps } from 'antd/es/date-picker/generatePicker';
import { apiReportOverviewData, apiTeamTotalData, apiTeamMemberData } from '@/services/report';
import moment from 'moment';
import { history, Link, useRequest } from '@umijs/max';
import numeral from 'numeral';
import { apiAccountBalnace } from '@/services/user';
import PayQrocde from '@/components/Payment/PayQrcode';
import PayPackage from '@/components/Payment/PayPackage';
import PayVip from '@/components/Payment/PayVip';
import PaySearch from '@/components/Payment/PaySearch';
import { apiSubordinateUsers } from '@/services/enterprise';
import style from '@/pages/index.less';
import { yieldDelayCss } from '@/utils/animation';

const { RangePicker } = DatePicker;

type RangePickerValue = RangePickerProps<moment.Moment>['value'];

export const ReportOverview: FC<any> = () => {
  const [state, setState] = useSetState<Record<string, any>>({
    loading: false,
    rangePickerValue: getTimeDistance('today'),
    chartsData: [],
    activeKey: 'emailSent',
    customerTotal: 0,
    customerVerify: 0,
    customerVerifyToday: 0,
    runningTask: 0,
    waitSent: 0,
    emailSentToday: 0,
    emailOpenedToday: 0,
    emailClickedToday: 0,
    emailReplyToday: 0,
    // 2021/10/07
    balance: 0,
    sendCount: 0,
    searchCount: 0,
    payBalanceVisible: false,
    payPackageVisible: false,
    payVipVisible: false,
    qrcodeVisible: false,
    paySearchVisible: false,
    verifyTodayFree: 0, // ?????????????????????
    verifyTodayCount: 0, // ??????????????????
    verifyTodayOdd: 0, // ????????????
    app: 'wechat',
    codeUrl: '',
    id: '',
    cdkey: '',
    vip: 0,
    vipTime: 0,
    now: moment().valueOf(),
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

  const renderUserid = (record: any) => {
    const { _id: userid } = record;
    if (!usersData || !usersData.length) {
      return '?????????';
    }
    const idx = usersData.findIndex((user: any) => user.userid === userid);
    if (idx >= 0) {
      const { nickname } = usersData[idx];
      return nickname;
    }
    return '????????????';
  };

  const columns: any = [
    {
      title: '??????',
      dataIndex: '_id',
      render: (_: any, record: any) => renderUserid(record),
    },
    {
      title: '???????????????',
      dataIndex: 'CustomerCreateCount',
    },
    {
      title: '???????????????',
      dataIndex: 'CustomerDeleteCount',
    },
    {
      title: '???????????????',
      dataIndex: 'CustomerExportCount',
    },
    {
      title: '????????????',
      dataIndex: 'SearchCountCost',
    },
    {
      title: '????????????',
      dataIndex: 'SearchEmailCount',
    },
    {
      title: '????????????',
      dataIndex: 'SearchTasksCount',
    },
    {
      title: '????????????',
      dataIndex: 'SendCountCost',
    },
    {
      title: '????????????',
      dataIndex: 'MassEmailCount',
    },
    {
      title: '????????????',
      dataIndex: 'MassReadCount',
    },
  ];

  const getData = async () => {
    const { data } = await apiAccountBalnace();
    if (data) {
      const { balance, sendCount, vip, vipTime, searchCount } = data;
      setState({ balance, sendCount, vip, vipTime, searchCount });
    }
  };

  const {
    data: teamData,
    loading: teamDataLoading,
    run: teamDataRun,
  } = useRequest(apiTeamTotalData, {
    manual: true,
    pollingInterval: 600000,
  });

  const {
    data: memberData,
    run: memberDataRun,
    loading: memberDataLoading,
  } = useRequest(apiTeamMemberData);

  const openQrcode = (id: string, app: string, codeUrl: string) => {
    setState({ id, app, codeUrl, qrcodeVisible: true });
  };

  const getTeamData = async (rangePickerValue: RangePickerValue) => {
    if (rangePickerValue) {
      const beginDate = moment(rangePickerValue[0]).format('YYYY-MM-DD');
      const endDate = moment(rangePickerValue[1]).format('YYYY-MM-DD');
      teamDataRun({ beginDate, endDate });
    }
  };

  const getMemberData = async (rangePickerValue: RangePickerValue) => {
    if (rangePickerValue) {
      const beginDate = moment(rangePickerValue[0]).format('YYYY-MM-DD');
      const endDate = moment(rangePickerValue[1]).format('YYYY-MM-DD');
      memberDataRun({ beginDate, endDate });
    }
  };

  const selectDate = (type: string) => {
    const rangePickerValue = getTimeDistance(type);
    setState({ rangePickerValue });
    getTeamData(rangePickerValue);
    getMemberData(rangePickerValue);
  };

  const handleRangePickerChange = (rangePickerValue: any) => {
    setState({ rangePickerValue });
    getTeamData(rangePickerValue);
    getMemberData(rangePickerValue);
  };

  const isActive = (type: string) => {
    const { rangePickerValue } = state;
    if (!rangePickerValue) {
      return '';
    }
    const value = getTimeDistance(type);
    if (!value) {
      return '';
    }
    if (!rangePickerValue[0] || !rangePickerValue[1]) {
      return '';
    }
    if (
      rangePickerValue[0].isSame(value[0] as moment.Moment, 'day') &&
      rangePickerValue[1].isSame(value[1] as moment.Moment, 'day')
    ) {
      return styles.currentDate;
    }
    return '';
  };

  const getOverviewData = async () => {
    const data = await apiReportOverviewData();
    if (data) {
      setState({ ...data });
    }
  };

  useEffect(() => {
    getOverviewData();
    const { rangePickerValue } = state;
    getTeamData(rangePickerValue);
    getMemberData(rangePickerValue);
    getData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const ownerTagRender = (prop: any) => {
    const { filterValues } = state;
    const { owners } = filterValues;
    const { value } = prop;
    if (owners && owners.length && owners[0] === value) {
      return <div className={styles.stardardFilterSelected}>????????? ({owners.length})</div>;
    } else {
      return <span />;
    }
  };

  const onFilterValuesChange = async (changeValues: any, allValues: any) => {
    setState({ filterValues: allValues });
    const { owners } = allValues;
    const { rangePickerValue } = state;
    const beginDate = moment(rangePickerValue[0]).format('YYYY-MM-DD');
    const endDate = moment(rangePickerValue[1]).format('YYYY-MM-DD');
    teamDataRun({ owners, beginDate, endDate });
  };
  const cardDelay = yieldDelayCss({ max: 5, delay: 0.2 })
  const teamDelay = yieldDelayCss({ max: 9, delay: 0.4 })
  return (
    <div>
      <PageContainer pageTitle={false} pageGroup="reports" pageActive="overview">
        <Row gutter={24}>
          <Col xl={18} lg={24} md={24} sm={24} xs={24}>
            <Card style={{ marginBottom: 12, animationDelay: cardDelay.next().value! }} bodyStyle={{ textAlign: 'right' }} className='both-down' >
              <Space>
                <Form
                  layout="inline"
                  initialValues={state.filterValues}
                  onValuesChange={onFilterValuesChange}
                >
                  {usersData?.length ? (
                    <Form.Item name="owners" noStyle>
                      <TreeSelect
                        treeCheckable={true}
                        treeData={state.userTreeData}
                        dropdownStyle={{ maxHeight: 400, minWidth: 200 }}
                        placeholder={
                          <div style={{ color: '#383838', textAlign: 'center' }}>
                            ??? ??? <CaretDownOutlined />
                          </div>
                        }
                        tagRender={ownerTagRender}
                        showArrow={false}
                        allowClear
                        className={style.stardardFilter}
                        bordered={false}
                      />
                    </Form.Item>
                  ) : null}
                </Form>
                <div className={styles.salesExtra}>
                  <a className={isActive('today')} onClick={() => selectDate('today')}>
                    ??????
                  </a>
                  <a className={isActive('week')} onClick={() => selectDate('week')}>
                    ??????
                  </a>
                  <a className={isActive('month')} onClick={() => selectDate('month')}>
                    ??????
                  </a>
                  <a className={isActive('year')} onClick={() => selectDate('year')}>
                    ??????
                  </a>
                </div>
                <RangePicker
                  value={state.rangePickerValue}
                  onChange={handleRangePickerChange}
                  style={{ width: 256 }}
                />
              </Space>
            </Card>
            <Card className='both-down'
              style={{ marginBottom: 12, animationDelay: cardDelay.next().value! }}
              title="????????????"
              bordered={false}
              loading={teamDataLoading}
            >
              {teamData?.map((item: any) => {
                const { type, name, url, value } = item;
                return (
                  <Card.Grid className='both-down' style={{ width: '33.3%', textAlign: 'center', animationDelay: teamDelay.next().value! }} key={type}>
                    <Link to={url} style={{ width: '100%', textAlign: 'center' }}>
                      {' '}
                      <Statistic
                        title={name}
                        value={value}
                        valueStyle={value ? { color: '#3f8600' } : undefined}
                      />
                    </Link>
                  </Card.Grid>
                );
              })}
            </Card>
            <Card bordered={false} className={`${styles.activeCard} both-up`} style={{ animationDelay: cardDelay.next().value! }} title="????????????">
              <Table
                loading={memberDataLoading}
                rowKey="_id"
                dataSource={memberData}
                columns={columns}
                pagination={false}
                size="middle"
              />
            </Card>
          </Col>
          <Col xl={6} lg={24} md={24} sm={24} xs={24}>
            <Card className='both-up'
              style={{ marginBottom: 12, animationDelay: cardDelay.next().value! }}
              title="????????????"
              bordered={false}
              bodyStyle={{ padding: 0 }}
            >
              <div className={styles.linkGroup}>
                <Link to="/contacts/contacts">
                  <ContactsOutlined /> ?????????
                </Link>
                <Link to="/contacts/contacts-import">
                  <TeamOutlined /> ???????????????
                </Link>
              </div>
              <div className={styles.linkGroup}>
                <Link to="/search">
                  <SearchOutlined /> ??????
                </Link>
                <Link to="/marketing">
                  <GlobalOutlined /> ??????
                </Link>
                <Link to="/mails">
                  <MailOutlined /> ?????????
                </Link>
              </div>
              <div className={styles.linkGroup}>
                <Link to="/expenses/balance">
                  <DollarOutlined /> ????????????
                </Link>
                <Link to="/enterprise">
                  <HomeOutlined /> ????????????
                </Link>
              </div>
            </Card>
            <Card className='both-up'
              style={{ marginBottom: 12, animationDelay: cardDelay.next().value! }}
              title="????????????"
              bordered={false}
              bodyStyle={{ padding: 0 }}
            >
              <Row>
                <Col sm={12} xs={24}>
                  <div style={{ padding: 12, paddingLeft: 24 }}>
                    <div style={{ fontSize: 20 }}>
                      <span style={{ marginRight: 10, fontWeight: 500 }}>????????????</span>
                      <Tooltip title="?????????????????????">
                        <QuestionCircleOutlined />
                      </Tooltip>
                    </div>
                    <div style={{ fontSize: 22, color: '#108ee9' }}>
                      {numeral(state.sendCount).format('0,0')}
                    </div>
                    <div style={{ marginTop: 10 }}>
                      <Button type="primary" onClick={() => history.push("/expenses/purchase?type=sendCount")}>
                        ??????
                      </Button>
                    </div>
                  </div>
                </Col>
                <Col sm={12} xs={24}>
                  <div style={{ padding: 12, paddingLeft: 24 }}>
                    <div style={{ fontSize: 20 }}>
                      <span style={{ marginRight: 10, fontWeight: 500 }}>????????????</span>
                      <Tooltip title="??????????????????(??????????????????)">
                        <QuestionCircleOutlined />
                      </Tooltip>
                    </div>
                    <div style={{ fontSize: 22, color: '#108ee9' }}>
                      {numeral(state.searchCount).format('0,0')}
                    </div>
                    <div style={{ marginTop: 10 }}>
                      <Button type="primary" onClick={() => history.push("/expenses/purchase?type=searchYear")}>
                        ??????
                      </Button>
                    </div>
                  </div>
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>
      </PageContainer>
      <PayPackage
        visible={state.payPackageVisible}
        onCancel={() => setState({ payPackageVisible: false })}
        openQrcode={(id, app, url) => openQrcode(id, app, url)}
        actionReload={() => getData()}
      />
      <PayVip
        visible={state.payVipVisible}
        onCancel={() => setState({ payVipVisible: false })}
        openQrcode={(id, app, url) => openQrcode(id, app, url)}
        actionReload={() => getData()}
      />
      <PayQrocde
        visible={state.qrcodeVisible}
        codeUrl={state.codeUrl}
        app={state.app}
        id={state.id}
        onCancel={() => setState({ qrcodeVisible: false })}
        actionReload={() => getData()}
      />
      <PaySearch
        visible={state.paySearchVisible}
        onCancel={() => setState({ paySearchVisible: false })}
        openQrcode={(id, app, url) => openQrcode(id, app, url)}
        actionReload={() => getData()}
      />
    </div>
  );
};

export default ReportOverview;
