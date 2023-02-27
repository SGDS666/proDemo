import React, { useEffect } from 'react';
import { Descriptions, Drawer, message, Progress, Tag, Typography } from 'antd';
import { apiSearchTasksRename } from '@/services/search';
import { useRequest } from '@umijs/max';
import {
  LinkedinOutlined,
  GoogleOutlined,
  MinusCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  SyncOutlined,
} from '@ant-design/icons';
import { LanguagesData } from '@/pages/Search/Preview';
import { exTimes, exTimeToDateTime } from '@/utils/common';
import { CountriesData } from '@/config/countries';
import { useSetState } from 'ahooks';

interface InfoProps {
  visible: boolean;
  onCancel: () => void;
  taskInfo: any;
}
const TaskDetails: React.FC<InfoProps> = (props) => {
  const { taskInfo, visible, onCancel } = props;
  const [state, setState] = useSetState<Record<string, any>>({
    taskName: '',
  });

  useEffect(() => {
    if (visible) {
      const { name } = taskInfo;
      setState({ taskName: name });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const { run: renameRun } = useRequest(apiSearchTasksRename, {
    manual: true,
    onSuccess: () => {
      message.success('修改成功');
    },
  });

  const onTaskChange = (task_id: string, value: string) => {
    const { taskName } = state;
    if (taskName !== value) {
      renameRun({ name: value, task_id });
      setState({ taskName: value });
    }
  };

  const renderTaskName = (record: any) => {
    const { task_id } = record;
    const { taskName } = state;
    return (
      <Typography.Paragraph
        editable={{
          onChange: (value: string) => onTaskChange(task_id, value),
        }}
      >
        {taskName}
      </Typography.Paragraph>
    );
  };

  const renderPlatform = (record: any) => {
    const { platform } = record;
    if (platform === 'linkedin') {
      return <LinkedinOutlined />;
    }
    if (platform === 'zoominfo') {
      return <span style={{ fontSize: 16, fontWeight: 500 }}>🅉</span>;
    }
    if (platform === 'google') {
      return <GoogleOutlined />;
    }
    return platform;
  };

  const renderType = (record: any) => {
    const { type } = record;
    if (type === 'keyword') {
      return '关键词';
    } else if (type === 'domain') {
      return '域名';
    } else if (type === 'name') {
      return '公司名';
    }
    return type;
  };

  const renderLanguage = (record: any) => {
    const { language } = record;
    const index = LanguagesData.findIndex((o: any) => o.value === language);
    if (index >= 0) {
      const { name, value } = LanguagesData[index];
      return `${name} (${value})`;
    }
    return language;
  };

  const renderStatus = (record: any) => {
    const { status } = record;
    if (status === 'running') {
      return (
        <Tag icon={<SyncOutlined spin />} color="processing">
          运行中
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
    if (status === 'continue') {
      return (
        <Tag icon={<ClockCircleOutlined />} color="default">
          继续中
        </Tag>
      );
    }
    if (status === 'deleted') {
      return (
        <Tag icon={<CloseCircleOutlined />} color="error">
          已取消
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

  const renderProcess = (record: any) => {
    const { progress } = record;
    return <Progress percent={progress} size="small" />;
  };

  const renderCostTime = (record: any) => {
    const { status, create_time, start_time, finish_time } = record;
    const startTime = start_time ? start_time : create_time;
    let costTime = 0;
    if (status === 'finished') {
      costTime = finish_time - startTime;
    } else {
      costTime = Date.now() - startTime;
    }
    return exTimes(costTime);
  };

  const renderCountry = (record: any) => {
    const { country } = record;
    const index = CountriesData.findIndex((o: any) => o.en === country);
    if (index >= 0) {
      const { en, cn } = CountriesData[index];
      return `${cn} (${en})`;
    }
    return country;
  };

  const renderKeyword = (record: any) => {
    const { keyword } = record;
    return (
      <Typography.Paragraph
        ellipsis={{
          rows: 3,
          expandable: true,
        }}
      >
        {keyword}
      </Typography.Paragraph>
    );
  };

  return (
    <Drawer
      destroyOnClose
      width={680}
      title="任务相关信息"
      placement="right"
      open={visible}
      onClose={() => onCancel()}
    >
      <Descriptions title={false} bordered labelStyle={{ width: 128 }} column={1} size="middle">
        <Descriptions.Item label="任务ID">{taskInfo?.task_id}</Descriptions.Item>
        <Descriptions.Item label="任务名称">{renderTaskName(taskInfo)}</Descriptions.Item>
        <Descriptions.Item label="状态">{renderStatus(taskInfo)}</Descriptions.Item>
        <Descriptions.Item label="进度">{renderProcess(taskInfo)}</Descriptions.Item>
        <Descriptions.Item label="搜索方式">{renderType(taskInfo)}</Descriptions.Item>
        <Descriptions.Item label="搜索内容">{renderKeyword(taskInfo)}</Descriptions.Item>
        {taskInfo?.type === 'keyword' ? (
          <>
            <Descriptions.Item label="搜索平台">{renderPlatform(taskInfo)}</Descriptions.Item>
            <Descriptions.Item label="搜索语言">{renderLanguage(taskInfo)}</Descriptions.Item>
            <Descriptions.Item label="搜索国家">{renderCountry(taskInfo)}</Descriptions.Item>
            <Descriptions.Item label="搜索城市">{taskInfo?.cities?.toString()}</Descriptions.Item>
            <Descriptions.Item label="排除国家">
              {taskInfo?.notCountryCodes?.toString()}
            </Descriptions.Item>
            <Descriptions.Item label="企业数量">{taskInfo?.orgCount}</Descriptions.Item>
            <Descriptions.Item label="员工数量">{taskInfo?.peoCount}</Descriptions.Item>
          </>
        ) : null}

        <Descriptions.Item label="域名数量">
          <a>{taskInfo?.domainCount}</a>
        </Descriptions.Item>
        <Descriptions.Item label="精准邮箱">
          <a>{taskInfo?.personalCount}</a>
        </Descriptions.Item>
        <Descriptions.Item label="普通邮箱">
          <a>{taskInfo?.genericCount}</a>
        </Descriptions.Item>
        <Descriptions.Item label="创建时间">
          {exTimeToDateTime(taskInfo?.create_time)}
        </Descriptions.Item>
        <Descriptions.Item label="开始时间">
          {exTimeToDateTime(taskInfo?.start_time)}
        </Descriptions.Item>
        <Descriptions.Item label="结束时间">
          {exTimeToDateTime(taskInfo?.finish_time)}
        </Descriptions.Item>
        <Descriptions.Item label="耗时">{renderCostTime(taskInfo)}</Descriptions.Item>
      </Descriptions>
    </Drawer>
  );
};

export default TaskDetails;
