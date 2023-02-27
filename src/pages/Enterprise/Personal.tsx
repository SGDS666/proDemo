import React from 'react';
import { Card, Typography, Button, Spin, Table, Tag, message } from 'antd';
import { HomeTwoTone, PlusOutlined, SmileTwoTone } from '@ant-design/icons';
import { apiInviteJoin, apiMyOrganize } from '@/services/enterprise';
import { useModel, useRequest } from '@umijs/max';
import OrgCreateForm from './components/OrgCreateForm';
import { useSetState } from 'ahooks';
import RightContainer from '@/components/Global/RightContainer';

const EnterprisePersonal: React.FC = () => {
  const [state, setState] = useSetState({
    createVisible: false,
  });

  const { data: orgList, loading, refresh: orgRefreesh } = useRequest(apiMyOrganize);

  const { run: joinRun } = useRequest(apiInviteJoin, {
    manual: true,
    onSuccess: () => {
      message.success('加入成功');
      orgRefreesh();
    },
  });

  const { initialState } = useModel('@@initialState');
  if (!initialState) {
    return <Spin size="large">未登录</Spin>;
  }
  const { uid, userid } = initialState.currentUser;

  const renderAction = (record: any) => {
    const { status, uid: id } = record;
    if (uid === id) {
      return <Tag>当前企业</Tag>;
    }
    if (status === 'pending') {
      return (
        <Button type="primary" size="small" onClick={() => joinRun({ orgId: id })}>
          立即加入
        </Button>
      );
    }
    if (status === 'disabled') {
      return '';
    }
    return <a href={`/enterprise?orgId=${id}`}>切换到该企业</a>;
  };

  const renderStatus = (status: string) => {
    if (status === 'pending') {
      return <Tag color="#2db7f5">等待加入</Tag>;
    }
    if (status === 'ok') {
      return <Tag color="#87d068">正常</Tag>;
    }
    if (status === 'disabled') {
      return <Tag color="#f50">已禁用</Tag>;
    }
    return <Tag>{status}</Tag>;
  };

  const columns = [
    {
      title: '企业ID',
      dataIndex: 'uid',
      key: 'uid',
    },
    {
      title: '企业名称',
      dataIndex: 'orgName',
      key: 'orgName',
    },
    {
      title: '我的角色',
      dataIndex: 'role_name',
      key: 'role_name',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (text: string) => renderStatus(text),
    },
    {
      title: '操作',
      dataIndex: 'action',
      key: 'action',
      render: (text: string, record: any) => renderAction(record),
    },
  ];

  return (
    <RightContainer pageTitle={false} pageGroup="enterprise" pageActive="personal">
      <Card title="当前版本" style={{ marginBottom: 12 }} className="both-down">
        {uid && uid !== userid ? (
          <Typography.Title
            level={2}
            style={{
              textAlign: 'center',
            }}
          >
            <HomeTwoTone /> 企业版{' '}
            <Button type="link" href={`/enterprise?orgId=${userid}`}>
              切换到个人版
            </Button>
          </Typography.Title>
        ) : (
          <Typography.Title
            level={2}
            style={{
              textAlign: 'center',
            }}
          >
            <SmileTwoTone twoToneColor="#52c41a" /> 个人版{' '}
          </Typography.Title>
        )}
      </Card>
      <Card
        title="已加入企业"
        loading={loading}
        className="both-up"
        extra={
          <Button type="primary" onClick={() => setState({ createVisible: true })}>
            <PlusOutlined /> 新建企业
          </Button>
        }
      >
        {orgList && orgList.length ? (
          <Table columns={columns} dataSource={orgList} pagination={false} rowKey="uid" />
        ) : (
          <Typography.Title
            level={2}
            style={{
              textAlign: 'center',
            }}
          >
            未加入企业
          </Typography.Title>
        )}
      </Card>
      <OrgCreateForm
        visible={state.createVisible}
        onCancel={() => setState({ createVisible: false })}
        actionReload={() => orgRefreesh()}
      />
    </RightContainer>
  );
};

export default EnterprisePersonal;
