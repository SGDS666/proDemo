import React, { useEffect } from 'react';
import {
  BellOutlined,
  GiftOutlined,
  MailOutlined,
  QuestionCircleOutlined,
  WechatOutlined,
} from '@ant-design/icons';
import { Badge } from 'antd';
import { history, useModel, useRequest } from '@umijs/max';
import { useSetState } from 'ahooks';
import { apiVipGiftStatus } from '@/services/vip';
import GiftModel from './compoments/GiftModel';
import WechatModel from './compoments/WechatModel';
// import Icon from '@ant-design/icons/lib/components/Icon';
// import { DarkIcon, LightIcon } from './MyIcon';

export type RightProps = {
  children: React.ReactNode;
  pageGroup: string;
  pageTitle: string | boolean;
  pageActive: string;
};

const QustionIcon: React.FC = () => {
  return (
    <QuestionCircleOutlined
      style={{ fontSize: 18 }}
      onClick={() => {
        window.open('https://www.laifa.xin/web-100-xinshourumen-getting-started/');
      }}
    />
  );
};

export const MailIcon: React.FC = () => {
  const { initialState } = useModel('@@initialState');
  const { currentUser } = initialState ?? {};
  const { mailsCountData, mailsCountRun } = useModel('user');

  useEffect(() => {
    if (currentUser) {
      mailsCountRun();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]);

  return (
    <Badge dot={mailsCountData?.unseenCount}>
      <MailOutlined
        style={{ fontSize: 18 }}
        onClick={() => {
          history.push('/mails');
        }}
      />
    </Badge>
  );
};

export const NoticeIcon: React.FC = () => {
  const { initialState } = useModel('@@initialState');
  const { currentUser } = initialState ?? {};
  const { messageData, messageRun } = useModel('user');
  useEffect(() => {
    if (currentUser) {
      messageRun();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]);

  return (
    <Badge dot={messageData?.total}>
      <BellOutlined
        style={{ fontSize: 18 }}
        onClick={() => {
          history.push('/notifications/messages');
        }}
      />
    </Badge>
  );
};

export const GiftIcon: React.FC = () => {
  const { initialState } = useModel('@@initialState');
  const { currentUser } = initialState ?? {};
  const [state, setState] = useSetState<Record<string, any>>({
    tips: false,
    giftVisible: false,
  });

  const { run: statusRun } = useRequest(apiVipGiftStatus, {
    manual: true,
    onSuccess: (data) => {
      const { tips } = data;
      setState({ tips });
    },
  });

  useEffect(() => {
    if (currentUser) {
      statusRun();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]);

  return (
    <Badge dot={state.tips}>
      <GiftOutlined style={{ fontSize: 18 }} onClick={() => setState({ giftVisible: true })} />
      <GiftModel
        visible={state.giftVisible}
        onCancel={() => setState({ giftVisible: false })}
        actionReload={() => statusRun()}
      />
    </Badge>
  );
};

const WechatIcon: React.FC = () => {
  const [state, setState] = useSetState<Record<string, any>>({
    tips: false,
    wechatVisible: false,
  });

  return (
    <>
      <WechatOutlined
        style={{ color: '#87d068', fontSize: 18 }}
        onClick={() => setState({ wechatVisible: true })}
      />
      <WechatModel
        visible={state.wechatVisible}
        onCancel={() => setState({ wechatVisible: false })}
      />
    </>
  );
};

// const ChangeMode: React.FC<{ style?: React.CSSProperties }> = ({ style }) => {
//   const { initialState, setInitialState } = useModel("@@initialState")
//   const theme = initialState?.settings?.navTheme
//   const changeMode = () => {
//     setInitialState((preInitialState) => {
//       const settings = { ...preInitialState?.settings }
//       let navTheme: any;
//       if (settings.navTheme === "light") {
//         navTheme = "realDark"
//       } else {
//         navTheme = 'light'
//       }

//       const newsettings = { ...settings, navTheme }
//       return { ...preInitialState, settings: newsettings }
//     })
//   }

//   if (theme === "light") {
//     return <Icon component={LightIcon} onClick={changeMode} style={{ ...style }} />
//     // return <BulbFilled onClick={changeMode} style={{ color: token.colorPrimaryBorder, ...style }} />
//   }

//   return (
//     <Icon component={DarkIcon} onClick={changeMode} style={{ ...style }} />
//   )
// }
export default (isMobile: boolean | undefined, collapsed: boolean | undefined) => {

  if (isMobile) {
    return [];
  }
  if (collapsed) {
    return [<MailIcon key="mailKey" />, <NoticeIcon key="noticeKey" />, <GiftIcon key="giftKey" />,];
  }
  return [
    <WechatIcon key="wechat" />,
    <QustionIcon key="qustionKey" />,
    <MailIcon key="mailKey" />,
    <NoticeIcon key="noticeKey" />,
    <GiftIcon key="giftKey" />,
    // <ChangeMode key="themechange" style={{ fontSize: "18px" }} />
  ];
};
