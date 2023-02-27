import React, { useEffect } from 'react';
import { Drawer, Descriptions } from 'antd';
import { useSetState } from 'ahooks';
import { exTimeToDateTime } from '@/utils/common';
import { apiTaskHtml } from '@/services/tasks';

interface OperationModalProps {
  visible: boolean;
  onCancel: () => void;
  current: object;
}

const DEFAULT_VALUES = {
  gtid: '',
  sid: '',
  from: '',
  to: '',
  create_time: 0,
  subject: '',
  html: '',
  read_num: 0,
  read_time: 0,
  read_recently: 0,
  click_num: 0,
  click_time: 0,
  click_recently: 0,
  success: false,
  error: '',
};

const SendDetails: React.FC<OperationModalProps> = (props) => {
  const { visible, onCancel, current } = props;
  const [state, setState] = useSetState<Record<string, any>>({
    gtid: '',
    sid: '',
    from: '',
    to: '',
    create_time: 0,
    subject: '',
    html: '',
    htmlId: '',
    markId: '',
    read_num: 0,
    read_time: 0,
    read_recently: 0,
    click_num: 0,
    click_time: 0,
    click_recently: 0,
    error: '',
    status: 'error',
  });

  const {
    gtid,
    sid,
    from,
    to,
    create_time,
    subject,
    html,
    read_num,
    read_time,
    read_recently,
    click_num,
    click_time,
    click_recently,
    status,
    error,
  } = state;

  useEffect(() => {
    if (visible) {
      setState({ ...DEFAULT_VALUES, ...current });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const getMailHtml = async () => {
    const { htmlId } = state;
    if (htmlId) {
      const data = await apiTaskHtml({ id: htmlId });
      if (data && data.html) {
        setState({ html: data.html });
        return;
      }
    }
    setState({ html: '<p>null</p>' });
  };

  const onClose = () => {
    onCancel();
  };

  return (
    <Drawer title={false} placement="left" onClose={onClose} open={visible} width={640}>
      <Descriptions title="发送详情" column={2} size="small" layout="vertical" bordered>
        <Descriptions.Item label="任务ID">{gtid}</Descriptions.Item>
        <Descriptions.Item label="发送ID">{sid}</Descriptions.Item>
        <Descriptions.Item label="发信地址">{from}</Descriptions.Item>
        <Descriptions.Item label="收信地址">{to}</Descriptions.Item>
        <Descriptions.Item label="发送时间">{exTimeToDateTime(create_time)}</Descriptions.Item>
        <Descriptions.Item label="发送结果">
          {status === 'success' ? '成功' : '失败'}
        </Descriptions.Item>
        <Descriptions.Item label="错误提示" span={2}>
          {error}
        </Descriptions.Item>
        <Descriptions.Item label="阅读次数">{read_num}</Descriptions.Item>
        <Descriptions.Item label="点击次数">{click_num}</Descriptions.Item>
        <Descriptions.Item label="首次阅读">{exTimeToDateTime(read_time)}</Descriptions.Item>
        <Descriptions.Item label="首次点击">{exTimeToDateTime(click_time)}</Descriptions.Item>
        <Descriptions.Item label="最近阅读">{exTimeToDateTime(read_recently)}</Descriptions.Item>
        <Descriptions.Item label="最近点击">{exTimeToDateTime(click_recently)}</Descriptions.Item>
        <Descriptions.Item label="邮件主题" span={2}>
          {subject}
        </Descriptions.Item>
        <Descriptions.Item label="邮件正文">
          {html ? (
            <div dangerouslySetInnerHTML={{ __html: html }} />
          ) : (
            <a onClick={getMailHtml}>显示邮件正文</a>
          )}
        </Descriptions.Item>
      </Descriptions>
    </Drawer>
  );
};

export default SendDetails;
