// @ts-ignore
/* eslint-disable */
import { request } from '@umijs/max';

export async function apiFileGetAuth(params: any) {
  const response = await request('/api/file/get-auth', {
    method: 'POST',
    data: { ...params },
  });
  return response;
}

export async function apiFileSaveLog(params: any) {
  const { data } = await request('/api/file/save-log', {
    method: 'POST',
    data: { ...params },
  });
  return data;
}
