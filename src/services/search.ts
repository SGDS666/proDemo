// @ts-ignore
/* eslint-disable */
import { request } from '@umijs/max';

export async function apiPreviewCompanies(params: any) {
  return request('/api/search/preview-companies', {
    method: 'POST',
    data: { ...params },
  });
}

export async function apiPreviewOrgInfo(params: any) {
  return request('/api/search/preview-org-info', {
    method: 'POST',
    data: { ...params },
  });
}

export async function apiPreviewOrgPeople(params: any) {
  return request('/api/search/preview-org-people', {
    method: 'POST',
    data: { ...params },
  });
}

export async function apiPreviewOrgEmails(params: any) {
  return request('/api/search/preview-org-emails', {
    method: 'POST',
    data: { ...params },
  });
}

// export async function apiPreviewCompanyInfo(params: any) {
//   return request('/api/search/preview-company-info', {
//     method: 'POST',
//     data: { ...params },
//   });
// }

// export async function apiPreviewCompanyPeople(params: any) {
//   return request('/api/search/preview-company-people', {
//     method: 'POST',
//     data: { ...params },
//   });
// }

// export async function apiPreviewCompanyEmails(params: any) {
//   return request('/api/search/preview-company-emails', {
//     method: 'POST',
//     data: { ...params },
//   });
// }

export async function apiPreviewCompanyPhones(params: any) {
  return request('/api/search/preview-company-phones', {
    method: 'POST',
    data: { ...params },
  });
}

export async function apiPreviewDomainInfo(params: any) {
  return request('/api/search/preview-domain-info', {
    method: 'POST',
    data: { ...params },
  });
}

export async function apiPreviewTotayCount() {
  return request('/api/search/preview-today-count', {
    method: 'POST',
  });
}

export async function apiSearchTasksShow(params: any) {
  return request('/api/search/tasks/show', {
    method: 'POST',
    data: { ...params },
  });
}

export async function apiSearchTasksStatus(params: any) {
  return request('/api/search/tasks-status', {
    method: 'POST',
    data: { ...params },
    skipErrorHandler: true,
  });
}

export async function apiSearchTasksStart(params: any) {
  return request('/api/search/tasks-start', {
    method: 'POST',
    data: { ...params },
  });
}

export async function apiSearchTasksStop(params: any) {
  return request('/api/search/tasks-stop', {
    method: 'POST',
    data: { ...params },
  });
}

export async function apiSearchTasksDelete(params: any) {
  return request('/api/search/tasks-delete', {
    method: 'POST',
    data: { ...params },
  });
}

export async function apiSearchTasksDrop(params: any) {
  return request('/api/search/tasks-drop', {
    method: 'POST',
    data: { ...params },
  });
}

export async function apiSearchTasksRename(params: any) {
  return request('/api/search/tasks-rename', {
    method: 'POST',
    data: { ...params },
  });
}

export async function apiSearchCompanyList(params: any) {
  return request('/api/search/company-list', {
    method: 'POST',
    data: { ...params },
  });
}

export async function apiSearchOrgList(params: any) {
  return request('/api/search/org-list', {
    method: 'POST',
    data: { ...params },
  });
}

export async function apiSearchDomainList(params: any) {
  return request('/api/search/domain-list', {
    method: 'POST',
    data: { ...params },
  });
}

export async function apiSearchTasksCreate(params: any) {
  return request('/api/search/tasks/create', {
    method: 'POST',
    data: { ...params },
  });
}

export async function apiTaskConfigShow() {
  return request('/api/search/task-config-show', {
    method: 'POST',
  });
}

export async function apiSaveConfigShow() {
  return request('/api/search/save-config-show', {
    method: 'POST',
  });
}

export async function apiOrgInfo(params: any) {
  return request('/api/search/org-info', {
    method: 'POST',
    data: { ...params },
  });
}

export async function apiCompanyInfo(params: any) {
  return request('/api/search/company-info', {
    method: 'POST',
    data: { ...params },
  });
}

export async function apiCompanyInfoCheck(params: any) {
  return request('/api/search/company-info-check', {
    method: 'POST',
    data: { ...params },
  });
}

export async function apiOrgPeople(params: any) {
  return request('/api/search/org-people', {
    method: 'POST',
    data: { ...params },
  });
}

export async function apiOrgEmails(params: any) {
  return request('/api/search/org-emails', {
    method: 'POST',
    data: { ...params },
  });
}

export async function apiOrgPersonals(params: any) {
  return request('/api/search/org-personals', {
    method: 'POST',
    data: { ...params },
  });
}

export async function apiDomainEmails(params: any) {
  return request('/api/search/domain-emails', {
    method: 'POST',
    data: { ...params },
  });
}

export async function apiEmailSave(params: any) {
  return request('/api/search/email-save', {
    method: 'POST',
    data: { ...params },
  });
}

export async function apiDomainPersonals(params: any) {
  return request('/api/search/domain-personals', {
    method: 'POST',
    data: { ...params },
  });
}

export async function apiDomainSaveStatus(params: any) {
  return request('/api/search/domain-save-status', {
    method: 'POST',
    data: { ...params },
  });
}

export async function apiSearchTasksSave(params: any) {
  return request('/api/search/tasks/save', {
    method: 'POST',
    data: { ...params },
  });
}

export async function apiSearchTasksContacts(params: any) {
  return request('/api/search/tasks/save-contacts', {
    method: 'POST',
    data: { ...params },
  });
}

export async function apiSearchTasksSaveBlack(params: any) {
  return request('/api/search/tasks/save-black', {
    method: 'POST',
    data: { ...params },
  });
}

export async function apiSearchTasksCancelBlack(params: any) {
  return request('/api/search/tasks/cancel-black', {
    method: 'POST',
    data: { ...params },
  });
}

export async function apiDomainSaveContacts(params: any) {
  return request('/api/search/domain/save-contacts', {
    method: 'POST',
    data: { ...params },
  });
}

export async function apiDomainSaveBlack(params: any) {
  return request('/api/search/domain/save-black', {
    method: 'POST',
    data: { ...params },
  });
}

export async function apiDomainCancelBlack(params: any) {
  return request('/api/search/domain/cancel-black', {
    method: 'POST',
    data: { ...params },
  });
}

export async function apiSearchSavedList(params: any) {
  return request('/api/search/saved-list', {
    method: 'POST',
    data: { ...params },
  });
}

export async function apiSearchSavedDownload(params: any) {
  return request('/api/search/saved-download', {
    method: 'POST',
    data: { ...params },
  });
}

export async function apiSearchSavedStop(params: any) {
  return request('/api/search/saved-stop', {
    method: 'POST',
    data: { ...params },
  });
}

export async function apiSearchSavedEnd(params: any) {
  return request('/api/search/saved-end', {
    method: 'POST',
    data: { ...params },
  });
}

export async function apiSearchSavedStart(params: any) {
  return request('/api/search/saved-start', {
    method: 'POST',
    data: { ...params },
  });
}

export async function apiPositionList() {
  return request('/api/search/position-list', {
    method: 'POST',
  });
}

export async function apiCountryCityCount(params: any) {
  return request('/api/search/city-count', {
    method: 'POST',
    data: params,
  });
}
