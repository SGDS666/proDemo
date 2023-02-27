import React, { useState } from 'react';
import { Card, Typography, Descriptions, Button } from 'antd';
import { useRequest } from '@umijs/max';
import { apiProfileShow } from '@/services/enterprise';
import { exTimeToDate } from '@/utils/common';
import OrgUpdateForm from './components/OrgUpdateForm';
import UseAccess from '@/components/Global/UseAccess';
import RightContainer from '@/components/Global/RightContainer';

const EnterpriseProfile: React.FC = () => {
  const { data, loading, refresh } = useRequest(apiProfileShow);
  const [updateVisible, setUpdateVisible] = useState(false);

  const renderLevel = () => {
    if (!data) return '';
    const { level } = data;
    if (level === 0) return '试用版';
    if (level === 1) return '企业版';
    return level;
  };

  const renderTime = (key: string) => {
    if (!data) return '';
    if (!data[key]) return '';
    return exTimeToDate(data[key]);
  };

  return (
    <RightContainer pageTitle={false} pageGroup="enterprise" pageActive="profile">
      <Card
        title="当前企业信息"
        loading={loading}
        bordered
        extra={
          <UseAccess accessKey="enterprise.profile.modify">
            <Button type="primary" onClick={() => setUpdateVisible(true)}>
              修改
            </Button>
          </UseAccess>
        }
      >
        <Descriptions
          column={1}
          style={{ margin: 'auto', maxWidth: 400 }}
          labelStyle={{ fontSize: 20, minWidth: 96 }}
          contentStyle={{ fontSize: 20 }}
        >
          <Descriptions.Item label="企业ID">
            <Typography.Text strong copyable>
              {data?.uid}
            </Typography.Text>
          </Descriptions.Item>
          <Descriptions.Item label="企业名称">
            <Typography.Text strong copyable>
              {data?.name}
            </Typography.Text>
          </Descriptions.Item>
          <Descriptions.Item label="成员数量">
            <Typography.Text strong>{data?.userCount}</Typography.Text>
          </Descriptions.Item>
          <Descriptions.Item label="创建时间">
            <Typography.Text strong>{renderTime('create_time')}</Typography.Text>
          </Descriptions.Item>
          <Descriptions.Item label="版本信息">
            <Typography.Text strong>{renderLevel()}</Typography.Text>
          </Descriptions.Item>
          <Descriptions.Item label="到期时间">
            <Typography.Text strong>{renderTime('expire_time')}</Typography.Text>
          </Descriptions.Item>
        </Descriptions>
      </Card>
      <OrgUpdateForm
        visible={updateVisible}
        onCancel={() => setUpdateVisible(false)}
        actionReload={() => refresh()}
        values={data}
      />
    </RightContainer>
  );
};

export default EnterpriseProfile;
