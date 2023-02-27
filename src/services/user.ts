// @ts-ignore
/* eslint-disable */
import { request } from '@umijs/max';

export interface UserRegisterParams {
  email: string;
  password: string;
  captcha: string;
  host: string;
  inviteCode?: string;
}

export async function reqRegist(params: UserRegisterParams) {
  return request('/api/user/regist', {
    method: 'POST',
    data: params,
    skipErrorHandler: true,
  });
}

export async function reqRegistCaptcha(params: { email: string; host: string }) {
  return request('/api/user/regist-captcha', {
    method: 'POST',
    data: params,
    skipErrorHandler: true,
  });
}

export async function reqResetCaptcha(params: { email: string; host: string }) {
  return request('/api/user/reset-captcha', {
    method: 'POST',
    data: params,
    skipErrorHandler: true,
  });
}

export async function reqResetPassword(params: UserRegisterParams) {
  return request('/api/user/reset-password', {
    method: 'POST',
    data: params,
    // skipErrorHandler: true,
  });
}

/** 登录接口 POST /api/login/account */
export async function apiUserLogin(params: any) {
  return request('/api/user/login', {
    method: 'POST',
    data: params,
    skipErrorHandler: true,
  });
}

/** 获取当前的用户 GET /api/currentUser */
export async function apiCurrentUser(options?: { [key: string]: any }) {
  return request<{
    data: API.CurrentUser;
  }>('/api/account/current', {
    method: 'GET',
    ...(options || {}),
  });
}

export async function apiAccountInfo() {
  return request('/api/account/info', {
    method: 'POST',
  });
}

export async function apiAccountInfoSave(params: any) {
  return request('/api/account/info-save', {
    method: 'POST',
    data: params,
  });
}

export async function apiPasswordChange(params: any) {
  return request('/api/account/password-change', {
    method: 'POST',
    data: params,
  });
}

export async function apiUserPermissions() {
  return request('/api/account/permissions', {
    method: 'POST',
  });
}

export async function apiPageAuth() {
  return request('/api/account/page-auth', {
    method: 'POST',
  });
}

export async function apiPageTabs() {
  return request('/api/account/page-tabs', {
    method: 'POST',
  });
}

/** 退出登录接口 POST /api/login/outLogin */
export async function reqLogout(options?: { [key: string]: any }) {
  return request<Record<string, any>>('/api/account/logout', {
    method: 'POST',
    ...(options || {}),
  });
}

export async function apiTabList(params: any) {
  return request('/api/account/tab-list', {
    method: 'POST',
    data: params,
  });
}

// 发送邮箱验证码
export async function apiVerifyCaptcha() {
  return request('/api/account/verify-captcha', {
    method: 'POST',
  });
}

// 验证码校验
export async function apiVerifyCode(params: any) {
  return request('/api/account/verify-code', {
    method: 'POST',
    data: { ...params },
  });
}

// 新邮箱验证码
export async function apiRenewCaptcha(params: any) {
  return request('/api/account/renew-captcha', {
    method: 'POST',
    data: { ...params },
  });
}

// 新邮箱修改
export async function apiRenewEmail(params: any) {
  return request('/api/account/renew-email', {
    method: 'POST',
    data: { ...params },
  });
}

export async function apiAccountBalnace(): Promise<any> {
  return request('/api/account/balance', {
    method: 'POST',
  });
}

export async function apiRecentlyLogs() {
  return request('/api/account/login-recently-logs', {
    method: 'POST',
  });
}

export async function apiWelcomeInfo() {
  return request('/api/account/welcome-info', {
    method: 'POST',
  });
}

export async function apiTodayData() {
  return request('/api/account/today-count', {
    method: 'POST',
  });
}

export async function apiPing() {
  return request('/api/account/ping', {
    method: 'POST',
  });
}

export async function apiUserBankInfo() {
  return request('/api/account/bank-info', {
    method: 'POST',
  });
}

export async function apiUserVerifyCaptcha(params: any) {
  return request('/api/account/verify-captcha', {
    method: 'POST',
    data: { ...params },
  });
}

export async function apiUserIdInfo() {
  return request('/api/account/id-info', {
    method: 'POST',
  });
}

export async function apiUserIdSave(params: any) {
  return request('/api/account/id-save', {
    method: 'POST',
    data: { ...params },
  });
}
