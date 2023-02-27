import {
  Row,
  Card,
  Button,
  Table,
  Tooltip,
  message,
  DatePicker,
  Pagination,
  Space,
  Tag,
  theme
} from 'antd';
import React, { Fragment, ReactNode, useEffect, } from 'react';
import { useSetState } from 'ahooks';
import { QuestionCircleOutlined } from '@ant-design/icons';
import numeral from 'numeral';
import moment from 'moment';
import copy from 'copy-to-clipboard';
import {
  apiPartnerInviteInfo,
  apiPartnerInviteRecord,
  apiPartnerInviteCommission,
  apiPartnerCashOut,
} from '@/services/partner';
import CashModal from './CashModal';
import { useRequest } from '@umijs/max';
import styles from './index.less'
import { ReactDiv } from '@/components/EditTabs';
import { yieldDelayCss } from '@/utils/animation';
const { useToken } = theme


const operationTabList = [
  {
    key: 'tab1',
    tab: '邀请纪录',
  },
  {
    key: 'tab2',
    tab: '佣金明细',
  },
  {
    key: 'tab3',
    tab: '奖励明细',
  },
  {
    key: 'tab4',
    tab: '提现明细',
  },
];
interface MyCardProps extends ReactDiv {
  title: ReactNode,
  titleTip: string,
  value: ReactNode,
  option?: ReactNode,
  className?: string,
}

const MyCard: React.FC<MyCardProps> = ({ title, titleTip, value, option, className, style, ...otherPorps }) => {
  const { token } = useToken()
  return (

    <div
      className={`${styles.mycard} ${className}`} style={{ background: token.colorBgContainer, ...style }}
      {...otherPorps}
    >
      <div className={styles.title}>
        <div>{title}</div>
        {titleTip && <Tooltip title={titleTip}>
          <QuestionCircleOutlined />
        </Tooltip>}
      </div>
      <div className={styles.value} style={{ color: token.colorPrimary }}>
        {value}
      </div>
      <div className={styles.option}>
        {option}
      </div>

    </div>

  )
}
const MyCards: React.FC<{ Cards: MyCardProps[] }> = ({ Cards }) => {
  const yieldValue = yieldDelayCss({ max: 6, delay: 0.1, reverse: true })

  return (
    <>
      {
        Cards.map((card) => {
          const { style, titleTip, ...props } = card
          return (
            <MyCard
              className='both-down'
              key={titleTip}
              titleTip={titleTip}
              style={{ ...style, animationDelay: yieldValue.next().value! }}
              {...props}


            />)
        })
      }
    </>
  )

}

const MyInvite: React.FC = () => {
  const [state, setState] = useSetState<any>({
    loading: false,
    inviteCode: 'X', // 邀请码
    inviteLink: 'https://web.laifaxin.com', // 邀请链接
    commission: 0, // 可提佣金
    commAmount: 0, // 邀请请总佣金
    inviteCount: 0, // 邀请人数
    inviteCost: 0, // 邀请消费金额
    operationKey: 'tab1',
    inviteDataSource: [], // 邀请纪录
    commissionDataSource: [], // 奖励明细
    awardDataSource: [], // 佣金明细
    cashoutDataSource: [], // 提现明细
    total: 0,
    current: 1,
    pageSize: 20,
    setTime: moment(moment().format('YYYY-MM'), 'YYYY-MM'),
    cashVisible: false,
  });

  const renderTime = (t: number) => {
    if (!t) {
      return null;
    }
    return moment(t).format('YYYY-MM-DD HH:mm:ss');
  };

  const renderYuan = (fee: number) => {
    return <span>¥ {numeral(fee / 1000).format('0,0.00')}</span>;
  };

  const renderType = (type: string) => {
    if (type === 'bank') {
      return '银行卡';
    }
    return type;
  };

  const renderStatus = (status: string) => {
    if (status === 'waiting') {
      return <Tag color="processing">等待审核</Tag>;
    }
    if (status === 'error') {
      return <Tag color="error">提现失败</Tag>;
    }
    if (status === 'success') {
      return <Tag color="success">提现成功</Tag>;
    }
    if (status === 'return') {
      return <Tag color="warning">退回</Tag>;
    }
    return status;
  };

  const renderCash = (money: number) => {
    return <span>¥ {numeral(money).format('0,0.00')}</span>;
  };

  const inviteColumns = [
    { title: '用户ID', dataIndex: 'uid', key: 'uid' },
    {
      title: '邀请时间',
      dataIndex: 'create_time',
      key: 'create_time',
      render: (text: number) => renderTime(text),
    },
    {
      title: '总消费',
      dataIndex: 'costAmount',
      key: 'costAmount',
      render: (text: number) => renderYuan(text),
    },
    {
      title: '总佣金',
      dataIndex: 'commAmount',
      key: 'commAmount',
      render: (text: number) => renderYuan(text),
    },
  ];

  const commissionColumns = [
    { title: '用户ID', dataIndex: 'uid', key: 'uid' },
    {
      title: '消费时间',
      dataIndex: 'create_time',
      key: 'create_time',
      render: (text: number) => renderTime(text),
    },
    {
      title: '消费金额',
      dataIndex: 'total_fee',
      key: 'total_fee',
      render: (text: number) => renderYuan(text),
    },
    {
      title: '佣金金额',
      dataIndex: 'commission',
      key: 'commission',
      render: (text: number) => renderYuan(text),
    },
  ];

  const priceColumns = [
    {
      title: '奖励金额',
      dataIndex: 'total_fee',
      key: 'total_fee',
      render: (text: number) => renderYuan(text),
    },
    {
      title: '奖励时间',
      dataIndex: 'create_time',
      key: 'create_time',
      render: (text: number) => renderTime(text),
    },
    { title: '奖励原因', dataIndex: 'commission', key: 'commission' },
  ];

  const withdrawColumns = [
    {
      title: '提现方式',
      dataIndex: 'type',
      key: 'type',
      render: (text: string) => renderType(text),
    },
    {
      title: '提现时间',
      dataIndex: 'create_time',
      key: 'create_time',
      render: (text: number) => renderTime(text),
    },
    { title: '银行', dataIndex: 'bankName', key: 'bankName' },
    { title: '提现账号', dataIndex: 'cardId', key: 'cardId' },
    { title: '提现', dataIndex: 'money', key: 'money', render: (text: number) => renderCash(text) },
    { title: '税费', dataIndex: 'tax', key: 'tax', render: (text: number) => renderCash(text) },
    { title: '到账', dataIndex: 'real', key: 'real', render: (text: number) => renderCash(text) },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (text: string) => renderStatus(text),
    },
  ];

  const contentList: any = {
    tab1: (
      <Table
        pagination={false}
        loading={state.loading}
        dataSource={state.inviteDataSource}
        columns={inviteColumns}
        rowKey="_id"
      />
    ),
    tab2: (
      <Table
        pagination={false}
        loading={state.loading}
        dataSource={state.commissionDataSource}
        columns={commissionColumns}
        rowKey="_id"
      />
    ),
    tab3: (
      <Table
        pagination={false}
        loading={state.loading}
        dataSource={[]}
        rowKey="_id"
        columns={priceColumns}
      />
    ),
    tab4: (
      <Table
        pagination={false}
        loading={state.loading}
        dataSource={state.cashoutDataSource}
        columns={withdrawColumns}
      />
    ),
  };

  const getTableData = async (
    selectKey: string,
    current: number,
    pageSize: number,
    setTime: any,
  ) => {
    const bTime = moment(setTime).valueOf();
    const eTime = moment(setTime).add(1, 'months').valueOf();
    const filter = { create_time: { $gte: bTime, $lt: eTime } };
    const sorter = { _id: 'descend' };
    if (selectKey === 'tab1') {
      const res = await apiPartnerInviteRecord({ filter, sorter, pageSize, current });
      if (res) {
        const { data, total } = res;
        setState({ inviteDataSource: data, total, current });
      }
    }
    if (selectKey === 'tab2') {
      const res = await apiPartnerInviteCommission({ filter, sorter, pageSize, current });
      if (res) {
        const { data, total } = res;
        setState({ commissionDataSource: data, total, current });
      }
    }
    if (selectKey === 'tab4') {
      const res = await apiPartnerCashOut({ filter, sorter, pageSize, current });
      if (res) {
        const { data, total } = res;
        setState({ cashoutDataSource: data, total, current });
      }
    }
  };

  const onOperationTabChange = async (key: string) => {
    setState({ operationKey: key, total: 0, current: 1 });
    const { pageSize, setTime } = state;
    getTableData(key, 1, pageSize, setTime);
  };

  const onCopy = () => {
    const { inviteCode, inviteLink } = state;
    const msg = `填写我的邀请码：${inviteCode}，免费领取 不限量 邮箱验证/邮件群发/邮件追踪（特权），非常好用！${inviteLink}`;
    copy(msg);
    message.success('复制成功');
  };

  const { run: infoRun } = useRequest(apiPartnerInviteInfo, {
    manual: true,
    onSuccess: (data: any) => {
      if (!data) return;
      const { protocol, host } = window.location;
      const baseUrl = `${protocol}//${host}`;
      const { uid } = data;
      const inviteCode = uid.toUpperCase();
      const inviteLink = baseUrl + '/i/' + inviteCode;
      setState({ ...data, inviteLink });
    },
  });

  const getParnerData = async () => { };

  const onPageChange = (page: number, pageSize: number) => {
    setState({ current: page, pageSize });
    const { operationKey, setTime } = state;
    getTableData(operationKey, page, pageSize, setTime);
  };

  const onDateChange = (date: any) => {
    setState({ setTime: date });
    const { operationKey, current, pageSize } = state;
    getTableData(operationKey, current, pageSize, date);
  };

  const getParnerLogs = () => {
    const { operationKey, current, pageSize, setTime } = state;
    getTableData(operationKey, current, pageSize, setTime);
  };

  useEffect(() => {
    infoRun();
    getParnerLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <Row style={{ width: "100%" }} >
        <MyCards

          Cards={[
            {
              title: "可提现金",
              titleTip: "满100可以提现，且每月只能提现1次",
              value: `¥ ${numeral(state.commission / 1000).format('0,0.00')}`,
              option:
                state.commission && state.commission >= 100 * 1000 ? (
                  <Button type="primary" onClick={() => setState({ cashVisible: true })}>
                    提现
                  </Button>
                ) : (
                  <Button type="primary" disabled>
                    提现
                  </Button>
                )
            },
            {

              title: "邀请码",
              titleTip: '我的邀请码',
              value: state.inviteCode,
              option:
                <Button type="primary" onClick={onCopy}>
                  复制
                </Button>

            },
            {

              title: "注册链接",
              titleTip: '我的邀请注册链接',
              value: state.inviteLink,
              option:
                <Button type="primary" onClick={onCopy}>
                  复制
                </Button>

            },
            {

              title: "邀请人数",
              titleTip: '邀请的用户总和',
              value: numeral(state.inviteCount).format('0,0'),
            },
            {

              title: "邀请消费",
              titleTip: '邀请的用户累计消费总金额',
              value: `¥ ${numeral(state.inviteCost / 1000).format('0,0.00')}`,
            },
            {

              title: "获得佣金",
              titleTip: '累计获取的佣金总金额',
              value: `¥ ${numeral(state.commAmount / 1000).format('0,0.00')}`,
            }
          ]}
        />

      </Row>

      <Card
        className=" both-up"
        style={{ marginTop: 16, animationDelay: "0.3s" }}
        tabList={operationTabList}
        onTabChange={onOperationTabChange}
        activeTabKey={state.operationKey}
      >
        <Space style={{ marginBottom: 12 }} size="middle" >
          <DatePicker
            value={state.setTime}
            format="YYYY年MM月"
            picker="month"
            onChange={onDateChange}
          />
          <Pagination
            total={state.total}
            showTotal={(total) => `共有 ${total} 记录`}
            defaultPageSize={20}
            onChange={onPageChange}
            current={state.current}
          />
        </Space>
        {contentList[state.operationKey]}
      </Card>
      <CashModal
        visible={state.cashVisible}
        onCancel={() => setState({ cashVisible: false })}
        actionReload={getParnerData}
      />
    </>
  );
};

export default MyInvite;
