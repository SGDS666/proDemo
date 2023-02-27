import React from 'react';
import { Card, Alert, Typography } from 'antd';
import { HeartTwoTone, SmileTwoTone } from '@ant-design/icons';
import RightContainer from '@/components/Global/RightContainer';

const Operations: React.FC = () => {
  return (
    <RightContainer pageTitle={false} pageGroup="contacts" pageActive="operations">
      <Card>
        <Alert
          message={'功能开发中...'}
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
          <SmileTwoTone /> 来发信 <HeartTwoTone twoToneColor="#eb2f96" /> You
        </Typography.Title>
      </Card>
    </RightContainer>
  );
};

export default Operations;
