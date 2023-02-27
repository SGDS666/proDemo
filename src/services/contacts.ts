// @ts-ignore
/* eslint-disable */
import { request } from '@umijs/max';

export async function apiTagsList() {
  return request('/api/contacts/tags-list', {
    method: 'POST',
  });
}

export async function apiTagsTree() {
  return request('/api/contacts/tags-tree', {
    method: 'POST',
  });
}

export async function apiTagsAdd(params: any) {
  return request('/api/contacts/tags-add', {
    method: 'POST',
    data: params,
  });
}

export async function apiTagsDirAdd(params: any) {
  return request('/api/contacts/tags-dir-add', {
    method: 'POST',
    data: params,
  });
}

export async function apiTagsSave(params: any) {
  return request('/api/contacts/tags-save', {
    method: 'POST',
    data: params,
  });
}

export async function apiViewAdd(params: any) {
  return request('/api/contacts/view/add', {
    method: 'POST',
    data: params,
  });
}

export async function apiViewSave(params: any) {
  return request('/api/contacts/view/save', {
    method: 'POST',
    data: params,
  });
}

export async function apiViewShareSet(params: any) {
  return request('/api/contacts/view/share-set', {
    method: 'POST',
    data: params,
  });
}

export async function apiViewRename(params: any) {
  return request('/api/contacts/view/rename', {
    method: 'POST',
    data: params,
  });
}

export async function apiViewDelete(params: any) {
  return request('/api/contacts/view/delete', {
    method: 'POST',
    data: params,
  });
}

export async function apiViewConfig(params: any) {
  return request('/api/contacts/view-config', {
    method: 'POST',
    data: params,
  });
}

export async function apiPinViews() {
  return request('/api/contacts/views-pin', {
    method: 'POST',
  });
}

export async function apiPinViewsSave(params: any) {
  return request('/api/contacts/views-pin-save', {
    method: 'POST',
    data: params,
  });
}

export async function apiViewsList() {
  return request('/api/contacts/views-list', {
    method: 'POST',
  });
}

export async function apiViewsTree() {
  return request('/api/contacts/views-tree', {
    method: 'POST',
  });
}

export async function apiContactsShow(params: any) {
  return request('/api/contacts/contacts/show', {
    method: 'POST',
    data: params,
  });
}

export async function apiCompaniesShow(params: any) {
  return request('/api/contacts/companies/show', {
    method: 'POST',
    data: params,
  });
}

export async function apiCompaniesDelete(params: any) {
  return request('/api/contacts/companies/delete', {
    method: 'POST',
    data: params,
  });
}

export async function apiContactAdd(params: any) {
  return request('/api/contacts/contact/add', {
    method: 'POST',
    data: params,
  });
}

// 联系人批量更新
export async function apiContactsSave(params: any) {
  return request('/api/contacts/contacts/save', {
    method: 'POST',
    data: params,
  });
}

// 联系人单独更新
export async function apiContactSave(params: any) {
  return request('/api/contacts/contact/save', {
    method: 'POST',
    data: params,
  });
}

// 批量更新标签
export async function apiContactsTags(params: any) {
  return request('/api/contacts/contacts/tags', {
    method: 'POST',
    data: params,
  });
}

// 批量删除
export async function apiContactsDelete(params: any) {
  return request('/api/contacts/contacts/delete', {
    method: 'POST',
    data: params,
  });
}

export async function apiContactImportFile(params: any) {
  return request('/api/contacts/contacts/import-file', {
    method: 'POST',
    data: params,
  });
}

export async function apiContactImportSave(params: any) {
  return request('/api/contacts/contacts/import-save', {
    method: 'POST',
    data: params,
  });
}

export async function apiImportHistory(params: any) {
  return request('/api/contacts/import/history', {
    method: 'POST',
    data: params,
  });
}

export async function apiImportHistoryDelete(params: any) {
  return request('/api/contacts/import/history-delete', {
    method: 'POST',
    data: params,
  });
}

export async function apiExportHistory(params: any) {
  return request('/api/contacts/export/history', {
    method: 'POST',
    data: params,
  });
}

export async function apiExportSave(params: any) {
  return request('/api/contacts/contacts/exportSave', {
    method: 'POST',
    data: params,
  });
}

export async function apiExportQuota() {
  return request('/api/contacts/export-quota', {
    method: 'POST',
  });
}

export async function apiRecycleShow(params: any) {
  return request('/api/contacts/recycle/show', {
    method: 'POST',
    data: params,
  });
}

export async function apiRecycleRestore(params: any) {
  return request('/api/contacts/recycle/restore', {
    method: 'POST',
    data: params,
  });
}

export async function apiTagsItems() {
  return request('/api/contacts/tags-items', {
    method: 'POST',
  });
}

export async function apiTagsDirs() {
  return request('/api/contacts/tags-dirs', {
    method: 'POST',
  });
}

export async function apiTagsDirsSort(params: any) {
  return request('/api/contacts/tags-dirs-sort', {
    method: 'POST',
    data: params,
  });
}

export async function apiTagsSort(params: any) {
  return request('/api/contacts/tags-sort', {
    method: 'POST',
    data: params,
  });
}

export async function apiTagsOptions() {
  const { data } = await request('/api/customer/tags-options', {
    method: 'POST',
  });
  return data;
}

export async function apiMailToOptions(params: any) {
  return request('/api/contacts/mail-to-options', {
    method: 'POST',
    data: params,
  });
}

export async function apiBlackDomainsList(params: any) {
  return request('/api/contacts/black/domains-list', {
    method: 'POST',
    data: params,
  });
}

export async function apiBlackDomainsDelete(params: any) {
  return request('/api/contacts/black/domains-delete', {
    method: 'POST',
    data: params,
  });
}

export async function apiBlackDomainsSave(params: any) {
  return request('/api/contacts/black/domains-save', {
    method: 'POST',
    data: params,
  });
}

export async function apiTextSave(params: any) {
  return request('/api/contacts/text-save', {
    method: 'POST',
    data: { ...params },
  });
}

// 增加标签或删除标签
export async function apiTagsSet(params: any) {
  return request('/api/contacts/tags-set', {
    method: 'POST',
    data: { ...params },
  });
}
