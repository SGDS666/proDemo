import React, { useEffect } from 'react';
import { Drawer, Descriptions, Divider } from 'antd';
import { useSetState } from 'ahooks';
import { apiTaskDisplayMore } from '@/services/tasks';

interface OperationModalProps {
  visible: boolean;
  onCancel: () => void;
  current: object;
}

const DEFAULT_VALUES = {
  gtid: '',
  channel: 1,
  name: '',
  status: '',
  create_time: 0,
  timeStart: 0,
  update_time: 0,
  finish_time: 0,
  send_time: 0,
  total_count: 0,
  send_count: 0,
  balance: 0,
  sendCount: 0,
  senders: [],
  senderMore: false,
  senderList: [],
  subjects: [],
  subjectMore: false,
  subjectList: [],
  contents: [],
  contentMore: false,
  contentList: [],
};

const statusList = {
  waiting: '等待审核',
  deny: '等待被拒',
  running: '运行中',
  finished: '已完成',
  draft: '草稿',
  pause: '已暂停',
  schedule: '定时中',
};

const TaskInfo: React.FC<OperationModalProps> = (props) => {
  const { visible, onCancel, current } = props;
  const [state, setState] = useSetState<Record<string, any>>({ ...DEFAULT_VALUES });

  const {
    gtid,
    channel,
    name,
    timeStart,
    finish_time,
    total_count,
    send_count,
    bounced_count,
    notsent_count,
  } = state;

  const contentMoreClick = async () => {
    setState({ contentMore: true });
    const { contents } = state;
    const data = await apiTaskDisplayMore({ type: 'content', ids: contents });
    if (data) {
      setState({ contentList: data });
    }
  };

  useEffect(() => {
    if (visible) {
      setState({ ...DEFAULT_VALUES });
      setState({ ...current });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const onClose = () => {
    onCancel();
  };

  const getStatus = () => {
    const { status } = state;
    if (statusList[status]) {
      return statusList[status];
    }
    return status;
  };

  const senderMoreClick = async () => {
    setState({ senderMore: true });
    const { senders } = state;
    const data = await apiTaskDisplayMore({ type: 'sender', ids: senders });
    if (data) {
      setState({ senderList: data });
    }
  };

  const senderItem = () => {
    const { senders, senderMore, senderList } = state;
    if (!senderMore) {
      return (
        <div>
          数量：{senders.length} <a onClick={senderMoreClick}>显示详细</a>
        </div>
      );
    }
    return (
      <div>
        数量：{senders.length}
        {senderList.map((item: any) => (
          <div key={item.mail_addr}>
            <Divider style={{ marginTop: 12, marginBottom: 12 }} />
            <div>
              {item.mail_addr}({item.mail_name})
            </div>
          </div>
        ))}
      </div>
    );
  };

  const subjectMoreClick = async () => {
    setState({ subjectMore: true });
    const { subjects } = state;
    const data = await apiTaskDisplayMore({ type: 'subject', ids: subjects });
    if (data) {
      setState({ subjectList: data });
    }
  };

  const subjectItem = () => {
    const { subjects, subjectMore, subjectList } = state;
    if (!subjectMore) {
      return (
        <div>
          数量：{subjects.length} <a onClick={subjectMoreClick}>显示详细</a>
        </div>
      );
    }
    return (
      <div>
        数量：{subjects.length}
        {subjectList.map((item: any) => (
          <div key={item.subject}>
            <Divider style={{ marginTop: 12, marginBottom: 12 }} />
            <div>{item.subject}</div>
          </div>
        ))}
      </div>
    );
  };

  const contentItem = () => {
    const { contents, contentMore, contentList } = state;
    if (!contentMore) {
      return (
        <div>
          数量：{contents.length} <a onClick={contentMoreClick}>显示详细</a>
        </div>
      );
    }
    return (
      <div>
        数量：{contents.length}
        {contentList.map((item: any) => (
          <div key={item.id}>
            <Divider style={{ marginTop: 12, marginBottom: 12 }} />
            <div dangerouslySetInnerHTML={{ __html: item.html }} />
          </div>
        ))}
      </div>
    );
  };

  return (
    <Drawer title={false} placement="right" onClose={onClose} open={visible} width={640}>
      <Descriptions title="任务详情" column={2} size="small" layout="vertical" bordered>
        <Descriptions.Item label="任务ID">{gtid} </Descriptions.Item>
        <Descriptions.Item label="任务名称">{name}</Descriptions.Item>
        <Descriptions.Item label="发送渠道">
          {channel === 1 ? '自有邮箱' : '系统邮箱'}
        </Descriptions.Item>
        <Descriptions.Item label="状态">{getStatus()}</Descriptions.Item>
        <Descriptions.Item label="总数">{total_count}</Descriptions.Item>
        <Descriptions.Item label="成功">{send_count}</Descriptions.Item>
        <Descriptions.Item label="退信">{bounced_count}</Descriptions.Item>
        <Descriptions.Item label="未发送">{notsent_count}</Descriptions.Item>
        <Descriptions.Item label="发信邮箱" span={2}>
          {senderItem()}
        </Descriptions.Item>
        <Descriptions.Item label="邮件主题" span={2}>
          {subjectItem()}
        </Descriptions.Item>
        <Descriptions.Item label="邮件内容" span={2}>
          {contentItem()}
        </Descriptions.Item>
      </Descriptions>
    </Drawer>
  );
};

export default TaskInfo;
