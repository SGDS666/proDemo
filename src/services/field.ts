// @ts-ignore
/* eslint-disable */
import { request } from '@umijs/max';

export async function apiContactTableColumns() {
  return request('/api/fields/contact-table-columns', {
    method: 'POST',
  });
}

export async function apiContactTableFields() {
  return request('/api/fields/contact-table-Fields', {
    method: 'POST',
  });
}

export async function apiContactTagsField() {
  return request('/api/fields/contact-tags-field', {
    method: 'POST',
  });
}

export async function apiContactShowColumns() {
  return request('/api/fields/contact-show-columns', {
    method: 'POST',
  });
}

export async function apiContactCraeteColumns() {
  return request('/api/fields/contact-create-columns', {
    method: 'POST',
  });
}

export async function apiContactCraeteFields() {
  return request('/api/fields/contact-create-fields', {
    method: 'POST',
  });
}

export async function apiContactUpdateColumns() {
  return request('/api/fields/contact-update-columns', {
    method: 'POST',
  });
}

export async function apiContactUpdateFields() {
  return request('/api/fields/contact-update-fields', {
    method: 'POST',
  });
}

export async function apiContactFilterColumns() {
  return request('/api/fields/contact-filter-columns', {
    method: 'POST',
  });
}

export async function apiContactFilterFields() {
  return request('/api/fields/contact-filter-fields', {
    method: 'POST',
  });
}

export async function apiContactImportFields() {
  return request('/api/fields/contact-import-fields', {
    method: 'POST',
  });
}

export async function apiFieldContactShow() {
  const params = { belongTo: 'contact', saveType: 'read' };
  return request('/api/fields/contacts-fields', {
    method: 'POST',
    data: params,
  });
}

export async function apiFieldCompanyShow() {
  const params = { belongTo: 'company', saveType: 'read' };
  return request('/api/fields/company-fields', {
    method: 'POST',
    data: params,
  });
}

export async function apiContactsFields(params: any) {
  return request('/api/fields/contacts-fields', {
    method: 'POST',
    data: params,
  });
}

export async function apiContactsColumns(params: any) {
  return request('/api/fields/contacts-columns', {
    method: 'POST',
    data: params,
  });
}

export async function apiSaveColumnsConfig(params: any) {
  return request('/api/fields/save-columns-config', {
    method: 'POST',
    data: params,
  });
}

export async function apiSaveFieldConfig(params: any) {
  return request('/api/fields/save-field-config', {
    method: 'POST',
    data: params,
  });
}

export async function apiFieldCreate(params: any) {
  return request('/api/fields/field/create', {
    method: 'POST',
    data: params,
  });
}

export async function apiFieldUpdate(params: any) {
  return request('/api/fields/field/update', {
    method: 'POST',
    data: params,
  });
}

export async function apiFieldDelete(params: any) {
  return request('/api/fields/field/delete', {
    method: 'POST',
    data: params,
  });
}
