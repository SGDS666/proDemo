import { formatParams } from '@/utils/common';
import { request } from '@umijs/max';

export async function apiMessageCount() {
  return request('/api/notifications/messages-count', {
    method: 'POST',
    skipErrorHandler: true,
  });
}

export async function apiMessageShow(params: any) {
  const postData = formatParams(params);
  return request('/api/notifications/messages/show', {
    method: 'POST',
    data: postData,
  });
}

export async function apiMessageDetails(params: any) {
  return request('/api/notifications/message-details', {
    method: 'POST',
    data: params,
  });
}

export async function apiMessagesDelete(params: any) {
  return request('/api/notifications/messages-delete', {
    method: 'POST',
    data: params,
  });
}

export async function apiMessagesRead(params: any) {
  return request('/api/notifications/messages-read', {
    method: 'POST',
    data: params,
  });
}
