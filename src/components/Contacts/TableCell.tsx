import {
  CheckCircleTwoTone,
  CloseCircleTwoTone,
  InfoCircleOutlined,
  LinkOutlined,
  LoadingOutlined,
  QuestionCircleTwoTone,
} from '@ant-design/icons';
import { Tag, Tooltip } from 'antd';
import moment from 'moment';
import React from 'react';

interface Props {
  dataIndex: string;
  values: any;
  field: any;
}

const TableCell: React.FC<Props> = (props) => {
  const { dataIndex, values, field } = props;
  const { valueType, width, items } = field;
  const { tags, email, verify_status, first_name, last_name, userid } = values;
  const value = values[dataIndex];

  const renderVerifyStatus = () => {
    let icon;
    if (verify_status === 'valid') {
      icon = (
        <Tooltip title="有效邮箱 (安全评级：高，建议发送)">
          <CheckCircleTwoTone twoToneColor="#52c41a" /> 有效
        </Tooltip>
      );
    } else if (verify_status === 'invalid') {
      icon = (
        <Tooltip title="无效邮箱 (安全评级：低，不建议发送)">
          <CloseCircleTwoTone twoToneColor="#eb2f96" /> 无效
        </Tooltip>
      );
    } else if (verify_status === 'unkown') {
      icon = (
        <Tooltip title="未知邮箱 (安全评级：中，建议发送)">
          <QuestionCircleTwoTone /> 未知
        </Tooltip>
      );
    } else if (verify_status === 'full') {
      icon = (
        <Tooltip title="全域邮箱 (安全评级：中，建议发送)">
          <QuestionCircleTwoTone twoToneColor="orange" /> 全域
        </Tooltip>
      );
    } else if (verify_status === '') {
      icon = (
        <Tooltip title="邮件未验证">
          <InfoCircleOutlined /> 未验证
        </Tooltip>
      );
    } else {
      icon = (
        <Tooltip title="验证中 (请等待结果)">
          <LoadingOutlined /> 验证中
        </Tooltip>
      );
    }
    return (
      <div style={{ width: width - 24, overflow: 'hidden', whiteSpace: 'nowrap' }}>{icon}</div>
    );
  };

  const renderEmail = () => {
    let icon;
    if (verify_status === 'valid') {
      icon = (
        <Tooltip title="有效邮箱 (安全评级：高，建议发送)">
          <CheckCircleTwoTone twoToneColor="#52c41a" />
        </Tooltip>
      );
    } else if (verify_status === 'invalid') {
      icon = (
        <Tooltip title="无效邮箱 (安全评级：低，不建议发送)">
          <CloseCircleTwoTone twoToneColor="#eb2f96" />
        </Tooltip>
      );
    } else if (verify_status === 'unkown') {
      icon = (
        <Tooltip title="未知邮箱 (安全评级：中，建议发送)">
          <QuestionCircleTwoTone />
        </Tooltip>
      );
    } else if (verify_status === 'full') {
      icon = (
        <Tooltip title="全域邮箱 (安全评级：中，建议发送)">
          <QuestionCircleTwoTone twoToneColor="orange" />
        </Tooltip>
      );
    } else if (verify_status === '') {
      icon = (
        <Tooltip title="邮件未验证">
          <InfoCircleOutlined />
        </Tooltip>
      );
    } else {
      icon = (
        <Tooltip title="验证中 (请等待结果)">
          <LoadingOutlined />
        </Tooltip>
      );
    }
    const mail = (
      <Tooltip title={email}>
        <a href={`mailto:${email}`} onClick={(e) => e.stopPropagation()}>
          {email}
        </a>
      </Tooltip>
    );
    return (
      <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {icon}&nbsp;{mail}
      </div>
    );
  };

  const renderTag = () => {
    if (!tags) return null;
    const ts = tags.map((id: string) => {
      const idx = items.findIndex((item: any) => item.id === id);
      if (idx >= 0) {
        const { name, color } = items[idx];
        return (
          <Tag key={id} color={color}>
            {name}
          </Tag>
        );
      }
      return null;
    });
    return (
      <Tooltip title={ts}>
        <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {ts}
        </div>
      </Tooltip>
    );
  };

  const renderName = () => {
    if (first_name && last_name) {
      return <span>{`${last_name} ${first_name}`}</span>;
    }
    if (first_name && !last_name) {
      return <span>{`${first_name}`}</span>;
    }
    if (!first_name && last_name) {
      return <span>{`${last_name}`}</span>;
    }
    return <span>-</span>;
  };

  const renderDateTime = () => {
    return <div>{moment(value).format('YYYY-MM-DD')}</div>;
  };

  const renderDate = () => {
    return <div>{moment(value).format('YYYY-MM-DD')}</div>;
  };

  const renderLink = () => {
    if (value) {
      const link = value.includes('http') ? value : `http://${value}`;
      return (
        <a target="_blank" rel="noopener noreferrer" href={link}>
          <LinkOutlined />
        </a>
      );
    }
    return null;
  };

  const renderUserid = () => {
    if (!userid) {
      return null;
    }
    const idx = items.findIndex((item: any) => item.userid === userid);
    if (idx >= 0) {
      const { nickname } = items[idx];
      return <a>{nickname}</a>;
    }
    return <a>未知用户</a>;
  };

  const renderCell = () => {
    if (typeof value === 'undefined') {
      return <div>-</div>;
    }
    if (dataIndex === 'email') {
      return renderEmail();
    } else if (dataIndex === 'tags') {
      return renderTag();
    } else if (dataIndex === 'name') {
      return renderName();
    } else if (valueType === 'date') {
      return renderDate();
    } else if (valueType === 'dateTime') {
      return renderDateTime();
    } else if (dataIndex === 'sourcePage') {
      return renderLink();
    } else if (dataIndex === 'userid') {
      return renderUserid();
    } else if (dataIndex === 'verify_status') {
      return renderVerifyStatus();
    } else {
      return (
        <Tooltip title={value}>
          <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {value}
          </div>
        </Tooltip>
      );
    }
  };

  return renderCell();
};

export default TableCell;
