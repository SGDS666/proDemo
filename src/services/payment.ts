// @ts-ignore
/* eslint-disable */
import { request } from '@umijs/max';

export async function apiOrderCreate(params: any) {
  return request('/api/payment/order-create', {
    method: 'POST',
    data: { ...params },
  });
}

export async function apiOrderCheck(params: any) {
  return request('/api/payment/order-check', {
    method: 'POST',
    data: { ...params },
  });
}

export async function apiGoodsList(params: any) {
  return request('/api/payment/goods-list', {
    method: 'POST',
    data: { ...params },
  });
}

export async function apiCashOut(params: any) {
  return await request('/api/payment/cash-out', {
    method: 'POST',
    data: { ...params },
  });
}
