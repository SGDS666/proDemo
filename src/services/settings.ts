// @ts-ignore
/* eslint-disable */
import { formatParams } from '@/utils/common';
import { request } from '@umijs/max';

export async function apiFieldsShow() {
  return request('/api/settings/fields/show', {
    method: 'POST',
  });
}

export async function apiTempletsShow(params: any) {
  return request('/api/settings/templets/show', {
    method: 'POST',
    data: params,
  });
}

export async function apiSignaturesShow(params: any) {
  return request('/api/settings/signatures/show', {
    method: 'POST',
    data: params,
  });
}

export async function apiContactTagsDirs() {
  return request('/api/settings/tags/contact-dirs', {
    method: 'POST',
  });
}

export async function apiContactTagsList(params: any) {
  const postData = formatParams(params);
  const { data } = await request('/api/settings/tags/contact-list', {
    method: 'POST',
    data: postData,
  });
  const { total, current, list } = data;
  return { data: list, total, current };
}

export async function apiContactTagsDelete(params: any) {
  return request('/api/settings/tags/contact-delete', {
    method: 'POST',
    data: params,
  });
}

export async function apiContactTagsMove(params: any) {
  return request('/api/settings/tags/contact-move', {
    method: 'POST',
    data: params,
  });
}
