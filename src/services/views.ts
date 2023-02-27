// @ts-ignore
/* eslint-disable */
import { request } from '@umijs/max';

export async function apiViewAdd(params: any) {
  return request('/api/views/view-add', {
    method: 'POST',
    data: params,
  });
}

export async function apiViewRename(params: any) {
  return request('/api/views/view-rename', {
    method: 'POST',
    data: params,
  });
}

export async function apiViewSave(params: any) {
  return request('/api/views/view-save', {
    method: 'POST',
    data: params,
  });
}

export async function apiViewShareSet(params: any) {
  return request('/api/views/share-set', {
    method: 'POST',
    data: params,
  });
}

export async function apiViewDelete(params: any) {
  return request('/api/views/view-delete', {
    method: 'POST',
    data: params,
  });
}

export async function apiViewConfig(params: any) {
  return request('/api/views/view-config', {
    method: 'POST',
    data: params,
  });
}

export async function apiPinViews(params: any) {
  return request('/api/views/views-pin', {
    method: 'POST',
    data: params,
  });
}

export async function apiPinViewsSave(params: any) {
  return request('/api/views/views-pin-save', {
    method: 'POST',
    data: params,
  });
}

export async function apiViewsList(params: any) {
  return request('/api/views/views-list', {
    method: 'POST',
    data: params,
  });
}
