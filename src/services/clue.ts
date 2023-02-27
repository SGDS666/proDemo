// @ts-ignore
/* eslint-disable */
import { request } from '@umijs/max';

export async function apiEmailsList(params: any) {
  return request('/api/clue/emails-list', {
    method: 'POST',
    data: { ...params },
  });
}
