import React from 'react';
import { Card, Alert, Typography } from 'antd';
import { HeartTwoTone, SmileTwoTone } from '@ant-design/icons';

const Inbox: React.FC = () => {
  return (
    <Card>
      <Alert
        message={'更快更强的重型组件，已经发布。'}
        type="success"
        showIcon
        banner
        style={{
          margin: -12,
          marginBottom: 24,
        }}
      />
      <Typography.Title
        level={2}
        style={{
          textAlign: 'center',
        }}
      >
        <SmileTwoTone /> 来发信 <HeartTwoTone twoToneColor="#eb2f96" /> 邮件
      </Typography.Title>
    </Card>
  );
};

export default Inbox;
