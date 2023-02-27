import { request } from '@umijs/max';

export async function apiOperationHistory(params: any) {
  return request('/api/operation/history-list', {
    method: 'POST',
    data: { ...params },
  });
}
