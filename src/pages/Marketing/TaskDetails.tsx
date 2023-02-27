import { ArrowLeftOutlined, BookOutlined, EditOutlined } from '@ant-design/icons';
import { Button, Descriptions, Space, Badge, Card, Tabs, Tag, Tooltip } from 'antd';
import { RouteContext } from '@ant-design/pro-layout';
import React, { useEffect } from 'react';
import styles from './style.less';
import { useSetState } from 'ahooks';
import TaskRecipients from './components/TaskRecipients';
import Performance from './components/Performance';
import TaskRename from './components/TaskRename';
import { apiTaskDetails } from '@/services/tasks';
import TaskInfo from '@/components/Tasks/TaskInfo';
import moment from 'moment';
import numeral from 'numeral';
import { useRequest } from '@umijs/max';

const statusList = {
  waiting: '等待审核',
  deny: '等待被拒',
  running: '运行中',
  finished: '已完成',
  draft: '草稿',
  pause: '已暂停',
  schedule: '定时中',
  revoke: '已撤销',
};

interface DetailsProps {
  onCancel: () => void;
  gtid: string;
}

const TaskDetails: React.FC<DetailsProps> = (props) => {
  const { onCancel, gtid } = props;
  const [state, setState] = useSetState<Record<string, any>>({
    tabActiveKey: 'performance',
    loading: false,
    task: {},
    sended: {
      title: '发送率',
      per: 0,
      sub1Title: '提交人数',
      sub1Value: 0,
      sub2Title: '发送人数',
      sub2Value: 0,
    },
    delivered: {
      title: '送达率',
      per: 0,
      sub1Title: '发送人数',
      sub1Value: 0,
      sub2Title: '送达人数',
      sub2Value: 0,
    },
    opened: {
      title: '阅读率',
      per: 0,
      sub1Title: '阅读人数',
      sub1Value: 0,
      sub2Title: '阅读人次',
      sub2Value: 0,
    },
    clicked: {
      title: '点击率',
      per: 0,
      sub1Title: '点击人数',
      sub1Value: 0,
      sub2Title: '点击人次',
      sub2Value: 0,
    },
    downed: {
      title: '下载率',
      per: 0,
      sub1Title: '下载人数',
      sub1Value: 0,
      sub2Title: '下载人次',
      sub2Value: 0,
    },
    senderNum: 0,
    subjectNum: 0,
    contentNum: 0,
    inforVisiable: false,
    taskName: '',
    editTaskName: false,
  });

  const { delivered, opened, clicked, sended, downed } = state;

  const onTabChange = (key: string) => {
    setState({ tabActiveKey: key });
  };

  const renderChildren = () => {
    const { tabActiveKey } = state;
    switch (tabActiveKey) {
      case 'recipients':
        return <TaskRecipients task={state.task} />;
      case 'performance':
        return (
          <Performance
            delivered={delivered}
            opened={opened}
            clicked={clicked}
            sended={sended}
            downed={downed}
          />
        );
      default:
        break;
    }
    return null;
  };

  const costDetails = (
    channel: number,
    sendCount: number,
    balance: number,
    notsent_count: number,
  ) => {
    if (!channel) {
      return null;
    }
    let realCount = sendCount;
    if (channel === 2) {
      realCount = sendCount - notsent_count + balance / 20;
    }
    return (
      <div>
        <a>{realCount}</a>封
        {channel === 2 ? (
          <span>
            (额度消耗<a>{sendCount}</a>个
            {balance ? (
              <span>
                , 余额购买<a>{balance / 20}</a>个
              </span>
            ) : null}
            {notsent_count ? (
              <span>
                , 返还额度<a>{notsent_count}</a>个
              </span>
            ) : null}
            )
          </span>
        ) : null}
      </div>
    );
  };

  const renderStartTime = (task: any) => {
    const { create_time, timeStart } = task;
    if (timeStart) {
      return moment(timeStart).format('YYYY-MM-DD HH:mm:ss');
    }
    return moment(create_time).format('YYYY-MM-DD HH:mm:ss');
  };

  const renderTaskChoice = (eList: any) => {
    if (!eList) return '';
    const { views, tags } = eList;
    const viewList = views.map(({ name, id }: any) => {
      return (
        <Tooltip title="视图" key={id}>
          <Tag color="success">{name}</Tag>
        </Tooltip>
      );
    });
    const tagList = tags.map(({ name, id, color }: any) => {
      return (
        <Tooltip title="标签" key={id}>
          <Tag color={color}>{name}</Tag>
        </Tooltip>
      );
    });
    return (
      <span>
        {viewList}
        {tagList}
      </span>
    );
  };

  const description = () => {
    const { task } = state;
    const {
      channel,
      create_time,
      finish_time,
      notsent_count,
      balance,
      sendCount,
      status,
      matchList,
      excludeList,
    } = task;
    return (
      <RouteContext.Consumer>
        {({ isMobile }) => (
          <Descriptions className={styles.headerList} size="small" column={isMobile ? 1 : 2}>
            <Descriptions.Item label="任务ID">{gtid}</Descriptions.Item>
            <Descriptions.Item label="创建时间">
              {moment(create_time).format('YYYY-MM-DD HH:mm:ss')}
            </Descriptions.Item>
            <Descriptions.Item label="开始时间">{renderStartTime(task)}</Descriptions.Item>
            <Descriptions.Item label="结束时间">
              {finish_time ? moment(finish_time).format('YYYY-MM-DD HH:mm:ss') : null}
            </Descriptions.Item>
            <Descriptions.Item label="收件人">{renderTaskChoice(matchList)}</Descriptions.Item>
            <Descriptions.Item label="排除对象">{renderTaskChoice(excludeList)}</Descriptions.Item>
            <Descriptions.Item label="消耗额度">
              {costDetails(channel, sendCount, balance, notsent_count)}
            </Descriptions.Item>
            <Descriptions.Item label="消耗余额">
              ¥ {numeral(balance / 1000).format('0,0.00')}
            </Descriptions.Item>
            <Descriptions.Item label="状态">{statusList[status]}</Descriptions.Item>
            <Descriptions.Item label="更多">
              <Button type="primary" size="small" onClick={() => setState({ inforVisiable: true })}>
                更多信息
              </Button>
            </Descriptions.Item>
          </Descriptions>
        )}
      </RouteContext.Consumer>
    );
  };

  const getPerforData = (data: any) => {
    const {
      bounced_count,
      total_count,
      send_count,
      opened_count,
      opened_num,
      clicked_count,
      clicked_num,
      // reply_count,
      // reply_num,
      senders,
      subjects,
      contents,
      down_count,
      down_num,
    } = data;
    let per = numeral(((send_count + bounced_count) / total_count) * 100).format('0,0.00');
    setState({
      sended: { ...sended, per, sub1Value: total_count, sub2Value: send_count + bounced_count },
    });

    per = numeral((send_count / (send_count + bounced_count)) * 100).format('0,0.00');
    setState({
      delivered: {
        ...delivered,
        per,
        sub1Value: send_count + bounced_count,
        sub2Value: send_count,
      },
    });

    per = numeral((opened_num / send_count) * 100).format('0,0.00');
    setState({ opened: { ...opened, per, sub1Value: opened_num, sub2Value: opened_count } });

    per = numeral((clicked_num / send_count) * 100).format('0,0.00');
    setState({ clicked: { ...clicked, per, sub1Value: clicked_num, sub2Value: clicked_count } });

    per = numeral((down_num / send_count) * 100).format('0,0.00');
    setState({ downed: { ...downed, per, sub1Value: down_num, sub2Value: down_count } });

    // per = numeral((reply_num / send_count) * 100).format('0,0.00');
    // setState({ reply: { ...reply, per, sub1Value: reply_num, sub2Value: reply_count } });

    if (senders) {
      setState({ senderNum: senders.length });
    }
    if (subjects) {
      setState({ subjectNum: subjects.length });
    }
    if (contents) {
      setState({ contentNum: contents.length });
    }
  };

  const { run: detailsRun, refresh: detailsRefresh } = useRequest(apiTaskDetails, {
    manual: true,
    onSuccess: (data: any) => {
      if (data) {
        setState({ task: data });
        getPerforData(data);
      }
    },
  });

  const getTitle = () => {
    const { task } = state;
    const { name } = task;
    return (
      <Space size="large" style={{ fontSize: 20, marginBottom: 12 }}>
        <a onClick={onCancel}>
          <ArrowLeftOutlined />
        </a>
        <span>任务名称：{name}</span>
        {gtid ? (
          <a onClick={() => setState({ editTaskName: true, taskName: name })}>
            <EditOutlined style={{ color: '#2eabff' }} />
          </a>
        ) : null}
      </Space>
    );
  };

  useEffect(() => {
    detailsRun({ gtid });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const renderTabName = (key: string) => {
    let name = '统 计';
    if (key === 'recipients') {
      name = '客 户';
    }
    if (state.tabActiveKey === key) {
      return (
        <span>
          <BookOutlined /> {name}
        </span>
      );
    }
    return (
      <span>
        <Badge dot={true}>
          <BookOutlined /> {name}
        </Badge>
      </span>
    );
  };

  return (
    <>
      <Card>
        {getTitle()}
        {description()}
        <TaskInfo
          visible={state.inforVisiable}
          current={state.task}
          onCancel={() => setState({ inforVisiable: false })}
        />
        <TaskRename
          visible={state.editTaskName}
          onCancel={() => setState({ editTaskName: false })}
          gtid={gtid}
          name={state.taskName}
          taskReload={() => detailsRefresh()}
        />
      </Card>
      <Card style={{ marginTop: 12 }}>
        <Tabs onChange={onTabChange} type="card">
          <Tabs.TabPane tab={renderTabName('performance')} key="performance">
            {renderChildren()}
          </Tabs.TabPane>
          <Tabs.TabPane tab={renderTabName('recipients')} key="recipients">
            {renderChildren()}
          </Tabs.TabPane>
        </Tabs>
      </Card>
    </>
  );
};

export default TaskDetails;
