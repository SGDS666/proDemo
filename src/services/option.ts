// @ts-ignore
/* eslint-disable */
import { request } from '@umijs/max';

export async function apiSearchOptionsSave(params: any) {
  return request('/api/option/search-options-save', {
    method: 'POST',
    data: { ...params },
  });
}

export async function apiSearchOptionsList() {
  return request('/api/option/search-options-list', {
    method: 'POST',
  });
}

export async function apiCustomOptionsList(params: any) {
  return request('/api/option/custom-options-list', {
    method: 'POST',
    data: { ...params },
  });
}

// 保存选项(覆盖)
export async function apiCustomOptionsSave(params: any) {
  return request('/api/option/custom-options-save', {
    method: 'POST',
    data: { ...params },
  });
}

export async function apiCustomOptionsAdd(params: any) {
  return request('/api/option/custom-options-add', {
    method: 'POST',
    data: { ...params },
  });
}
