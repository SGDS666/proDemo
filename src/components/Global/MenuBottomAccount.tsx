import React, { useState } from 'react';
import { Button, Divider, notification, Popover } from 'antd';
import { useModel, history, useRequest } from '@umijs/max';
import {
  ArrowLeftOutlined,
  CheckOutlined,
  HomeOutlined,
  LogoutOutlined,
  SyncOutlined,
  ToolOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { apiMyOrganize } from '@/services/enterprise';
import { reqLogout } from '@/services/user';

const MenuBottomAccount: React.FC = () => {
  const [visible, setVisible] = useState(false);
  const { initialState } = useModel('@@initialState');
  const currentUser = initialState?.currentUser;
  const nickname = currentUser?.nickname || currentUser?.uid;
  const uid = currentUser?.uid;
  const userid = currentUser?.userid;
  const { data: orgData } = useRequest(apiMyOrganize);

  const onOrgClick = (id: string | undefined) => {
    if (!id) return;
    if (uid === id) {
      return;
    }
    document.location.href = `/enterprise?orgId=${id}`;
  };

  const logoutAction = async () => {
    await reqLogout();
    notification.success({ message: '登出成功!' });
    history.push('/user/login');
  };

  const content = (
    <div style={{ width: '256px' }}>
      <div style={{ color: '#bfbfbf', fontSize: 12 }}>个人</div>
      <Button
        size="large"
        type="text"
        style={{ width: '100%', textAlign: 'left' }}
        onClick={() => onOrgClick(userid)}
      >
        <UserOutlined /> {nickname}
        {uid && uid !== userid ? null : (
          <CheckOutlined style={{ color: '#1890ff', marginLeft: '12px' }} />
        )}
      </Button>
      <div style={{ color: '#bfbfbf', fontSize: 12 }}>企业</div>
      {orgData?.map((item: any) => (
        <Button
          size="large"
          type="text"
          style={{ width: '100%', textAlign: 'left' }}
          key={item.uid}
          onClick={() => onOrgClick(item.uid)}
        >
          <HomeOutlined /> {item.orgName}{' '}
          {uid === item.uid ? (
            <CheckOutlined style={{ color: '#1890ff', marginLeft: '12px' }} />
          ) : null}
        </Button>
      ))}
      <Divider style={{ margin: '6px' }} />
      <Button
        size="large"
        type="text"
        style={{ width: '100%', textAlign: 'left' }}
        onClick={() => {
          setVisible(false);
          history.push('/account/setting');
        }}
      >
        <ToolOutlined /> 账号设置
      </Button>
      <Button
        size="large"
        type="text"
        style={{ width: '100%', textAlign: 'left' }}
        onClick={() => {
          setVisible(false);
          window.location.href = 'https://app.laifaxin.com';
        }}
      >
        <ArrowLeftOutlined /> 切换到旧版
      </Button>
      <Button
        size="large"
        type="link"
        danger
        style={{ width: '100%', textAlign: 'left' }}
        onClick={logoutAction}
      >
        <LogoutOutlined /> 退出登录
      </Button>
    </div>
  );
  return (
    <Popover
      placement="rightBottom"
      content={content}
      title={false}
      trigger="click"
      open={visible}
      onOpenChange={(val: boolean) => setVisible(val)}
    >
      <SyncOutlined />
      <span>更多</span>
    </Popover>
  );
};

export default MenuBottomAccount;
