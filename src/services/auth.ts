// @ts-ignore
/* eslint-disable */
import { request } from '@umijs/max';

export async function apiAuthAccess(params: any) {
  return request('/api/auth/access', {
    method: 'POST',
    data: params,
  });
}
