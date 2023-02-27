import { request } from '@umijs/max';
import { formatParams } from '@/utils/common';

export async function apiAccountBalance() {
  return request('/api/expenses/account/balance', {
    method: 'POST',
  });
}

export async function apiOrderList(params: any) {
  const postData = formatParams(params);
  const { data } = await request('/api/expenses/orders/show', {
    method: 'POST',
    data: postData,
  });
  const { total, current } = data;
  return { data: data.list, total, current };
}

export async function apiPackageList(params: any) {
  const postData = formatParams(params);
  const { data } = await request('/api/expenses/packages/show', {
    method: 'POST',
    data: postData,
  });
  const { total, current } = data;
  return { data: data.list, total, current };
}

export async function apiBillList(params: any) {
  const postData = formatParams(params);
  const { data } = await request('/api/expenses/billing/show', {
    method: 'POST',
    data: postData,
  });
  const { total, current } = data;
  return { data: data.list, total, current };
}

export async function apiCdkeyExchange(params: any) {
  return request('/api/expenses/cdkey/exchange', {
    method: 'POST',
    data: { ...params },
  });
}
