import React, { useEffect } from 'react';
import { Card, Typography, Descriptions, Button, message, Result } from 'antd';
import { useRequest, history } from '@umijs/max';
import { apiInviteStatus, apiInviteJoin } from '@/services/enterprise';
import { PageContainer } from '@ant-design/pro-layout';
import { getPageQuery } from '@/utils/common';
import { useSetState } from 'ahooks';

const params = getPageQuery();
const { orgId, code } = params;

const EnterpriseInvite: React.FC = () => {
  const [state, setState] = useSetState({
    success: false,
    message: '',
    data: { orgId: '', name: '' },
  });

  const { run: joinRun } = useRequest(apiInviteJoin, {
    manual: true,
    onSuccess: () => {
      message.success('加入成功');
      history.push('/enterprise');
    },
  });

  const getInviteStatus = async () => {
    const result = await apiInviteStatus({ orgId, code });
    if (result) {
      const { success, message: msg, data } = result;
      setState({ success, message: msg, data });
    }
  };

  useEffect(() => {
    getInviteStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <PageContainer title={false}>
      <Card title="企业邀请" bordered style={{ height: 480 }}>
        {state.success ? (
          <Descriptions
            column={1}
            style={{ margin: 'auto', maxWidth: 400 }}
            labelStyle={{ fontSize: 20, minWidth: 96 }}
            contentStyle={{ fontSize: 20 }}
          >
            <Descriptions.Item label="企业ID" style={{ marginTop: 24 }}>
              <Typography.Text strong copyable>
                {state.data?.orgId}
              </Typography.Text>
            </Descriptions.Item>
            <Descriptions.Item label="企业名称">
              <Typography.Text strong copyable>
                {state.data?.name}
              </Typography.Text>
            </Descriptions.Item>
            <Descriptions.Item label={false}>
              <Button
                style={{ width: '100%', marginTop: 96 }}
                type="primary"
                size="large"
                onClick={() => joinRun({ orgId, code })}
              >
                确认加入
              </Button>
            </Descriptions.Item>
          </Descriptions>
        ) : (
          <div style={{ textAlign: 'center' }}>
            <Result
              status="error"
              title={state.message}
              extra={
                <Button type="primary" key="console" onClick={() => history.push('/')}>
                  返回主页
                </Button>
              }
            />
          </div>
        )}
      </Card>
    </PageContainer>
  );
};

export default EnterpriseInvite;
