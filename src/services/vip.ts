// @ts-ignore
/* eslint-disable */
import { request } from '@umijs/max';

export async function apiVipGiftStatus() {
  return request('/api/vip/gift-status', {
    method: 'POST',
  });
}

export async function apiVipGet(params: any) {
  return request('/api/vip/gift-get', {
    method: 'POST',
    data: params,
  });
}
