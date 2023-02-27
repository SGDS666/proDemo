// @ts-ignore
/* eslint-disable */

declare namespace API {
  type CurrentUser = {
    isOrg?: boolean;
    name?: string;
    nickname?: string;
    avatar?: string;
    uid?: string;
    pid?: string;
    userid?: string;
    email?: string;
    orgId?: string;
    teamIds?: string[];
    title?: string;
    group?: string;
    tags?: { key?: string; label?: string }[];
    notifyCount?: number;
    unreadCount?: number;
    country?: string;
    access?: string;
    address?: string;
    phone?: string;
    vip?: number;
  };

  type LoginResult = {
    success: boolean;
    errorMessage?: string;
    type: string;
    accesstoken: string;
  };

  type CommonResult = {
    success: boolean;
    errorMessage?: string;
    data?: object;
  };

  type PageParams = {
    current?: number;
    pageSize?: number;
  };

  type KeyListItem = {
    uid?: string;
    updateAt?: number;
    createAt?: number;
    status?: number;
    apiUser: string;
    apiKey: string;
  };

  type RuleListItem = {
    key?: number;
    disabled?: boolean;
    href?: string;
    avatar?: string;
    name?: string;
    owner?: string;
    desc?: string;
    callNo?: number;
    status?: number;
    updatedAt?: string;
    createdAt?: string;
    progress?: number;
  };

  type RuleList = {
    data?: RuleListItem[];
    /** 列表的内容总数 */
    total?: number;
    success?: boolean;
  };

  type FakeCaptcha = {
    code?: number;
    status?: string;
  };

  type LoginParams = {
    username?: string;
    password?: string;
    autoLogin?: boolean;
    type?: string;
    host?: string;
  };

  type ErrorResponse = {
    /** 业务约定的错误码 */
    errorCode: string;
    /** 业务上的错误信息 */
    errorMessage?: string;
    /** 业务上的请求是否成功 */
    success?: boolean;
  };

  type NoticeIconList = {
    data?: NoticeIconItem[];
    /** 列表的内容总数 */
    total?: number;
    success?: boolean;
  };

  type NoticeIconItemType = 'notification' | 'message' | 'event';

  type NoticeIconItem = {
    id?: string;
    extra?: string;
    key?: string;
    read?: boolean;
    avatar?: string;
    title?: string;
    status?: string;
    datetime?: string;
    description?: string;
    type?: NoticeIconItemType;
  };
}
