import RightContent from '@/components/RightContent';
import type { Settings as LayoutSettings } from '@ant-design/pro-components';
import { Link, RunTimeLayoutConfig, } from '@umijs/max';
import { history } from '@umijs/max';
import defaultSettings from '../config/defaultSettings';
import { errorConfig } from './requestErrorConfig';
import React from 'react';
import { apiCurrentUser, apiPageAuth, apiUserPermissions } from './services/user';
import SiderActions from '@/components/Global/SiderActions';
import { ConfigProvider, } from 'antd';
//@ts-ignore
import ErrorBoundary from './components/ErrorBoundaries';




const loginPath = '/user/login';

// 检查路径是否需要登录
const checkNeedLogin = () => {
  const { pathname } = window.location;
  if (pathname.includes('/user/')) return false;
  if (pathname.includes('/regist')) return false;
  if (pathname.includes('/i/')) return false;
  if (pathname.includes('messages-count')) return false;
  if (pathname.includes('mails-count')) return false;
  return true;
};

/**
 * @see  https://umijs.org/zh-CN/plugins/plugin-initial-state
 * */
export async function getInitialState(): Promise<{
  settings?: Partial<LayoutSettings>;
  currentUser?: API.CurrentUser;
  loading?: boolean;
  fetchUserInfo?: () => Promise<API.CurrentUser | undefined>;
  fetchPageAuth?: () => Promise<any | undefined>;
  fetchUserPermissions?: () => Promise<any | undefined>;
  pageAuth?: any;
  userPermissions?: any;
}> {
  const fetchUserInfo = async () => {
    try {
      const msg = await apiCurrentUser({
        skipErrorHandler: true,
      });
      return msg.data;
    } catch (error) {
      history.push(loginPath);
    }
    return undefined;
  };
  const fetchPageAuth = async () => {
    try {
      const msg = await apiPageAuth();
      return msg.data;
    } catch (error) {
      history.push(loginPath);
    }
    return {};
  };
  const fetchUserPermissions = async () => {
    try {
      const msg = await apiUserPermissions();
      return msg.data;
    } catch (error) {
      history.push(loginPath);
    }
    return {};
  };
  const needLogin = checkNeedLogin();
  if (needLogin) {
    const currentUser = await fetchUserInfo();
    const pageAuth = await fetchPageAuth();
    const userPermissions = await fetchUserPermissions();
    return {
      fetchUserInfo,
      fetchPageAuth,
      currentUser,
      pageAuth,
      userPermissions,
      settings: defaultSettings as Partial<LayoutSettings>,
    };
  }
  return {
    fetchUserInfo,
    fetchPageAuth,
    fetchUserPermissions,
    settings: defaultSettings as Partial<LayoutSettings>,
  };
}

// ProLayout 支持的api https://procomponents.ant.design/components/layout
export const layout: RunTimeLayoutConfig = ({ initialState }) => {
  const settings = initialState?.settings
  const mode = initialState?.settings?.navTheme
  const isDark = mode === "realDark"
  return {

    menu: {
      collapsedShowTitle: true,
    },
    actionsRender: (props) => SiderActions(props?.isMobile, props?.collapsed),
    rightContentRender: (props) => (
      <RightContent collapsed={props?.collapsed} isMobile={props?.isMobile} />
    ),
    // footerRender: () => <Footer />,
    onPageChange: () => {
      const { location } = history;
      // 如果没有登录，重定向到 login11
      if (!initialState?.currentUser && location.pathname !== loginPath) {
        history.push(loginPath);
      }
    },
    menuHeaderRender: undefined,
    menuItemRender: (item, defaultDom) => {
      return (<Link to={item.path!}>{defaultDom}</Link>)
    },
    // 自定义 403 页面
    // unAccessible: <div>unAccessible</div>,
    // 增加一个 loading 的状态
    childrenRender: (children) => {
      // if (initialState?.loading) return <PageLoading />;
      console.log("children render")
      return <ConfigProvider
        theme={{
          token: {
            "colorPrimary": isDark ? "#1961ff" : initialState?.settings?.colorPrimary,
          }
        }}>
        <ErrorBoundary>
          {children}
        </ErrorBoundary>

      </ConfigProvider>;
    },
    ...settings,

  };
};

/**
 * @name request 配置，可以配置错误处理
 * 它基于 axios 和 ahooks 的 useRequest 提供了一套统一的网络请求和错误处理方案。
 * @doc https://umijs.org/docs/max/request#配置
 */
export const request = {
  ...errorConfig,
};


