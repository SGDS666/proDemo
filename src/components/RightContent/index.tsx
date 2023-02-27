import {
  CopyOutlined,
  IdcardOutlined,
  LogoutOutlined,
  MailOutlined,
  PlusOutlined,
  ToolOutlined,
  ZoomInOutlined,
} from '@ant-design/icons';
import { useEmotionCss } from '@ant-design/use-emotion-css';
import { useModel, history, useRequest } from '@umijs/max';
import { Avatar, Menu, message, notification, Popover, Space } from 'antd';
import React, { useEffect } from 'react';
// import HeaderDropdown from '../HeaderDropdown';
import { setAlpha } from '@ant-design/pro-components';
// import { flushSync } from 'react-dom';
import { apiMyOrganize } from '@/services/enterprise';
import { useSetState } from 'ahooks';
import { apiAccountBalnace, reqLogout } from '@/services/user';
import { GiftIcon, MailIcon, NoticeIcon } from '@/components/Global/SiderActions';
import copy from 'copy-to-clipboard';

export type SiderTheme = 'light' | 'dark';

/**
 * 退出登录，并且将当前的 url 保存
 */
const loginOut = async () => {
  await reqLogout();
  notification.success({ message: '登出成功!' });
  history.push('/user/login');
};

export type SiderProps = {
  collapsed: boolean | undefined;
  isMobile: boolean | undefined;
};

const GlobalHeaderRight: React.FC<SiderProps> = (props) => {
  const { collapsed, isMobile } = props;
  const { initialState } = useModel('@@initialState');
  const { currentUser } = initialState || {};
  const userName = currentUser?.nickname ? currentUser?.nickname : currentUser?.uid;
  const [state, setState] = useSetState({
    orgItems: [],
    currentOrgName: '',
    uid: '',
    isOrg: false,
    vip: 0,
    vipTime: 0,
    searchCount: 0,
    futureSearchCount: 0,
    sendCount: 0,
  });

  const AvatarLogo = () => {
    const avatarClassName = useEmotionCss(({ token }) => {
      return {
        marginRight: collapsed ? undefined : '8px',
        marginLeft: collapsed ? '4px' : undefined,
        // color: token.colorPrimary,
        verticalAlign: 'top',
        background: setAlpha(token.colorBgContainer, 0.85),
        [`@media only screen and (max-width: ${token.screenMD}px)`]: {
          margin: 0,
        },
      };
    });

    if (currentUser?.isOrg) {
      return (
        <Avatar className={avatarClassName} style={{ backgroundColor: '#1890ff' }} size="small">
          企
        </Avatar>
      );
    }
    return (
      <Avatar className={avatarClassName} style={{ backgroundColor: '#87d068' }} size="small">
        个
      </Avatar>
    );
  };

  const onOrgClick = (id: string | undefined) => {
    const { pathname } = history.location;
    if (!id) return;
    if (currentUser?.uid === id) {
      return;
    }
    document.location.href = `${pathname}?orgId=${id}`;
  };

  const { run: myOrgsRun } = useRequest(apiMyOrganize, {
    manual: true,
    onSuccess: (data: any) => {
      if (!data) return;
      const orgItems = data.map((item: any) => {
        const { uid, orgName } = item;
        if (uid === currentUser?.uid) {
          setState({ currentOrgName: orgName });
        }
        return {
          key: uid,
          label: orgName,
          icon: (
            <Avatar style={{ backgroundColor: '#1890ff' }} size="small">
              <span style={{ color: 'white' }}>企</span>
            </Avatar>
          ),
          onClick: () => onOrgClick(uid),
        };
      });
      orgItems.push({
        key: 'orgCreate',
        icon: <PlusOutlined style={{ fontSize: 16, color: '#1b9aee' }} />,
        label: <span style={{ color: '#1b9aee' }}>创建企业</span>,
        onClick: () => history.push('/enterprise/personal'),
      });
      setState({ orgItems });
    },
  });

  const { run: balnaceRun } = useRequest(apiAccountBalnace, {
    manual: true,
    onSuccess: (data: any) => {
      if (!data) return;
      const { uid, vip, vipTime, searchCount, futureSearchCount, sendCount, isOrg } = data;
      setState({ uid, vip, vipTime, searchCount, futureSearchCount, sendCount, isOrg });
    },
  });

  useEffect(() => {
    if (currentUser) {
      myOrgsRun();
      balnaceRun();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]);

  const className = useEmotionCss(() => {
    return {
      display: 'flex',
      height: '48px',
      width: collapsed ? '48px' : '240px',
      overflow: 'hidden',
      gap: 8,
    };
  });

  const actionClassName = useEmotionCss(({ token }) => {
    return {
      width: '100%',
      display: 'flex',
      height: '48px',
      // textAlign: 'center',
      // marginLeft: 'auto',
      overflow: 'hidden',
      alignItems: 'center',
      padding: '0 8px',
      cursor: 'pointer',
      borderRadius: token.borderRadius,
      '&:hover': {
        backgroundColor: token.colorBgTextHover,
      },
    };
  });

  const Name = () => {
    const nameClassName = useEmotionCss(({ token }) => {
      return {
        width: '100%',
        height: '48px',
        overflow: 'hidden',
        lineHeight: '48px',
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
        [`@media only screen and (max-width: ${token.screenMD}px)`]: {
          display: 'none',
        },
      };
    });
    if (currentUser?.isOrg) {
      return <span className={`${nameClassName} anticon`}>{state.currentOrgName}</span>;
    }
    return <span className={`${nameClassName} anticon`}>{userName}</span>;
  };

  if (!initialState || !initialState.settings) {
    return null;
  }

  const onClickCopy = () => {
    if (currentUser?.uid) {
      copy(currentUser?.uid);
      message.success('复制ID成功');
    }
  };

  const renderUserid = () => {
    if (currentUser?.isOrg) {
      return (
        <div>
          企业ID：{currentUser?.uid} <CopyOutlined />
        </div>
      );
    }
    return (
      <div>
        账号ID：{currentUser?.uid} <CopyOutlined />
      </div>
    );
  };

  const menuItems = [
    {
      key: 'personal',
      type: 'group',
      label: '个人',
      children: [
        {
          icon: (
            <Avatar style={{ backgroundColor: '#87d068' }} size="small">
              <span style={{ color: 'white' }}>个</span>
            </Avatar>
          ),
          key: currentUser?.userid ? currentUser?.userid : 'personal',
          label: userName,
          onClick: () => onOrgClick(currentUser?.userid),
        },
      ],
    },
    {
      key: 'organize',
      type: 'group',
      label: '企业',
      children: state.orgItems,
    },
    {
      type: 'divider' as const,
    },
    {
      key: 'accountId',
      icon: <IdcardOutlined />,
      label: renderUserid(),
      onClick: () => onClickCopy(),
    },
    {
      icon: <MailOutlined />,
      key: 'sendCount',
      label: (
        <div>
          发送邮件额度 <a>{state.sendCount}</a>
        </div>
      ),
      onClick: () => {
        history.push('/expenses/purchase?type=sendCount');
      },
    },
    {
      icon: <ZoomInOutlined />,
      key: 'searchCount',
      label: (
        <div>
          获客邮箱额度 <a>{state.searchCount}</a>
        </div>
      ),
      onClick: () => {
        history.push('/expenses/purchase?type=searchMonth');
      },
    },
    {
      type: 'divider' as const,
    },
    {
      key: 'settings',
      icon: <ToolOutlined />,
      label: '个人设置',
      onClick: () => {
        history.push('/account/setting');
      },
    },
    {
      type: 'divider' as const,
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      danger: true,
      onClick: () => {
        loginOut();
      },
    },
  ];
  if (isMobile) {
    return (
      <Space size="large">
        <MailIcon />
        <NoticeIcon key="noticeKey" />
        <GiftIcon key="giftKey" />
        <div className={className}>
          <Popover
            placement="rightBottom"
            content={
              <Menu
                style={{ width: 256, padding: 0 }}
                selectedKeys={currentUser?.uid ? [currentUser?.uid] : []}
                mode="inline"
                items={menuItems}
              />
            }
          >
            <span className={actionClassName}>
              <AvatarLogo />
              {collapsed ? null : <Name />}
            </span>
          </Popover>
        </div>
      </Space>
    );
  }

  return (
    <div className={className}>
      <Popover
        placement="rightBottom"
        content={
          <Menu
            style={{ width: 256, padding: 0 }}
            selectedKeys={currentUser?.uid ? [currentUser?.uid] : []}
            mode="inline"
            items={menuItems}
          />
        }
      >
        <span className={actionClassName}>
          <AvatarLogo />
          {collapsed ? null : <Name />}
        </span>
      </Popover>
    </div>
  );
};
export default GlobalHeaderRight;
