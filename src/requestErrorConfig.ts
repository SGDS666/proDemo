import type { RequestOptions } from '@@/plugin-request/request';
import type { RequestConfig } from '@umijs/max';
import { history } from '@umijs/max';
import { message, notification } from 'antd';
import { getPageQuery } from './utils/common';

// 错误处理方案： 错误类型
enum ErrorShowType {
  SILENT = 0,
  WARN_MESSAGE = 1,
  ERROR_MESSAGE = 2,
  NOTIFICATION = 3,
  REDIRECT = 9,
}
// 与后端约定的响应数据格式
interface ResponseStructure {
  success: boolean;
  data: any;
  code?: number;
  message?: string;
  showType?: ErrorShowType;
}

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
 * @name 错误处理
 * pro 自带的错误处理， 可以在这里做自己的改动
 * @doc https://umijs.org/docs/max/request#配置
 */
export const errorConfig: RequestConfig = {
  errorConfig: {
    // 自制错误抛出
    errorThrower: (res: any) => {
      console.log(res);
      const {
        success,
        data,
        code: errorCode,
        message: errorMessage,
        showType,
      } = res as unknown as ResponseStructure;
      if (!success) {
        const error: any = new Error(errorMessage);
        error.name = 'BizError';
        error.info = { code: errorCode, message: errorMessage, showType, data };
        throw error; // 抛出自制的错误
      }
    },
    // 错误接收及处理
    errorHandler: (error: any, opts: any) => {
      if (opts?.skipErrorHandler) return;
      // 我们的 errorThrower 抛出的错误。
      if (error.name === 'BizError') {
        const errorInfo: ResponseStructure | undefined = error.info;
        if (errorInfo) {
          const { message: errorMessage, code: errorCode } = errorInfo;
          switch (errorInfo.showType) {
            case ErrorShowType.SILENT:
              // do nothing
              break;
            case ErrorShowType.WARN_MESSAGE:
              message.warning(errorMessage);
              break;
            case ErrorShowType.ERROR_MESSAGE:
              message.error(errorMessage);
              break;
            case ErrorShowType.NOTIFICATION:
              notification.open({
                description: errorMessage,
                message: errorCode,
              });
              break;
            case ErrorShowType.REDIRECT:
              // TODO: redirect
              message.error(errorMessage);
              history.push('/user/login');
              break;
            default:
              message.error(errorMessage);
          }
        }
      } else if (error.response) {
        // Axios 的错误
        // 请求成功发出且服务器也响应了状态码，但状态代码超出了 2xx 的范围
        const status = error.response.status;
        const { responseURL } = error.response.request;
        if (status === 422) {
          const { message } = error.response.data;
          notification.error({ message: `参数错误 ${message} ${responseURL}` });
        } else if (status === 203) {
          const needLogin = checkNeedLogin();
          if (needLogin) {
            history.push('/user/login');
          }
        } else if (status !== 200) {
          notification.error({ message: `请求错误 ${status} ${responseURL}` });
        } else {
          message.error(`请求失败: ${status} ${responseURL}`);
        }
      } else if (error.request) {
        // 请求已经成功发起，但没有收到响应
        // \`error.request\` 在浏览器中是 XMLHttpRequest 的实例，
        // 而在node.js中是 http.ClientRequest 的实例
        message.error('服务器未响应，请重试！');
      } else {
        // 发送请求时出了点问题
        message.error('Request error, please retry.');
      }
    },
  },

  // 请求拦截器
  requestInterceptors: [
    (config: RequestOptions) => {
      // 拦截请求配置，进行个性化处理。
      const params = getPageQuery();
      const { orgId } = params;
      let accesstoken = window.localStorage.getItem('accesstoken');
      let orgid = window.localStorage.getItem('orgId');
      if (orgId && typeof orgId === 'string' && orgId !== orgid) {
        window.localStorage.setItem('orgId', orgId);
        orgid = orgId;
      }
      if (!accesstoken) accesstoken = '';
      if (!orgid || orgid === 'undefined' || typeof orgid === 'undefined') orgid = '';
      const authHeader = { accesstoken, uid: orgid };
      return { ...config, headers: authHeader };
    },
  ],

  // 响应拦截器
  responseInterceptors: [
    (response: any) => {
      // 拦截响应数据，进行个性化处理
      // const { status, data } = response;
      // if (status === 200) {
      //   const { success, message: errorMessage } = data;
      //   if (!success) {
      //     message.error(errorMessage);
      //   }
      // } else if (status === 203) {
      //   const needLogin = checkNeedLogin();
      //   if (needLogin) {
      //     history.push('/user/login');
      //   }
      // }
      return response;
    },
  ],
};
