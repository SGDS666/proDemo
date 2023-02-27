import { request } from '@umijs/max';
import { formatParams } from '@/utils/common';

// 群发任务列表
// export async function apiMassTaskList(params: any) {
//   const postData = formatParams(params);
//   const { data } = await request('/api/marketing/tasks/show', {
//     method: 'POST',
//     data: postData,
//   });
//   const { total, current } = data;
//   return { data: data.list, total, current };
// }

export async function apiMassTaskList(params: any) {
  return request('/api/marketing/tasks/show', {
    method: 'POST',
    data: params,
  });
}

export async function apiMassTaskCount() {
  return request('/api/marketing/tasks-count', {
    method: 'POST',
  });
}

export async function apiTaskDetails(params: any) {
  return request('/api/marketing/task-details', {
    method: 'POST',
    data: { ...params },
  });
}

export async function apiTaskLogs(params: any) {
  const postData = formatParams(params);
  const { data } = await request('/api/marketing/task-logs', {
    method: 'POST',
    data: postData,
  });
  const { total, current } = data;
  return { data: data.list, total, current };
}

export async function apiTaskRename(params: any) {
  return request('/api/marketing/task-rename', {
    method: 'POST',
    data: { ...params },
  });
}

export async function apiGetMassConfig() {
  return request('/api/tasks/get-mass-config', {
    method: 'POST',
  });
}

export async function apiSaveMassConfig(params: any) {
  return request('/api/tasks/save-mass-config', {
    method: 'POST',
    data: { ...params },
  });
}

export async function apiTaskSendCount(params: any) {
  return request('/api/tasks/mass-count', {
    method: 'POST',
    data: { ...params },
  });
}

export async function apiMassTaskAdd(params: any) {
  return request('/api/tasks/mass/add', {
    method: 'POST',
    data: { ...params },
  });
}

export async function apiMassTaskSave(params: any) {
  return request('/api/tasks/mass/save', {
    method: 'POST',
    data: { ...params },
  });
}

export async function apiMassTaskInfo(params: any) {
  return request('/api/tasks/mass/info', {
    method: 'POST',
    data: { ...params },
  });
}

export async function apiMassTaskAudit(params: any) {
  return request('/api/tasks/mass-audit', {
    method: 'POST',
    data: { ...params },
  });
}

export async function apiMassTaskRevoke(params: any) {
  return request('/api/tasks/mass-revoke', {
    method: 'POST',
    data: { ...params },
  });
}

export async function apiMassTaskDelete(params: any) {
  return request('/api/tasks/mass/delete', {
    method: 'POST',
    data: { ...params },
  });
}

export async function apiMassTaskDrop(params: any) {
  return request('/api/tasks/mass/drop', {
    method: 'POST',
    data: { ...params },
  });
}

export async function apiMassTaskStart(params: any) {
  return request('/api/tasks/mass/start', {
    method: 'POST',
    data: { ...params },
  });
}

export async function apiMassTaskStop(params: any) {
  return await request('/api/tasks/mass/stop', {
    method: 'POST',
    data: { ...params },
  });
}

export async function apiTaskHtml(params: any) {
  const { data } = await request('/api/marketing/task-html', {
    method: 'POST',
    data: { ...params },
  });
  return data;
}

export async function apiTaskSendTags(params: any) {
  const { success } = await request('/api/marketing/task-tags', {
    method: 'POST',
    data: { ...params },
  });
  return success;
}

export async function apiTaskPreview(params: any) {
  return await request('/api/marketing/task-preview', {
    method: 'POST',
    data: { ...params },
  });
}

////////////////////////////////////////

export async function apiTaskSave(params: any) {
  const { data } = await request('/api/group/task-save', {
    method: 'POST',
    data: { ...params },
  });
  return data;
}

export async function apiTaskCostCheck(params: any) {
  const { data } = await request('/api/group/cost-check', {
    method: 'POST',
    data: { ...params },
  });
  return data;
}

export async function apiTaskMultiDelete(params: any) {
  const { success } = await request('/api/group/task-multi-delete', {
    method: 'POST',
    data: { ...params },
  });
  return success;
}

export async function apiTaskDraftDelete(params: any) {
  const { success } = await request('/api/group/draft-delete', {
    method: 'POST',
    data: { ...params },
  });
  return success;
}

export async function apiTaskRecycleMultiDelete(params: any) {
  const { success } = await request('/api/group/recycle-multi-delete', {
    method: 'POST',
    data: { ...params },
  });
  return success;
}

export async function apiTaskGetOther() {
  const { data } = await request('/api/group/task-get-other', {
    method: 'POST',
  });
  return data;
}

export async function apiTaskDisplayMore(params: any) {
  const { data } = await request('/api/marketing/task-display-more', {
    method: 'POST',
    data: { ...params },
  });
  return data;
}

export async function apiTaskCustomerTreeData() {
  const { data } = await request('/api/group/customer-tree-data', {
    method: 'POST',
  });
  return data;
}

export async function apiTrackLogs(params: any) {
  return request('/api/marketing/tracks/show', {
    method: 'POST',
    data: params,
  });
}

export async function apiTrackTags(params: any) {
  return request('/api/marketing/tracks-tags', {
    method: 'POST',
    data: params,
  });
}

export async function apiTrackOutput(params: any) {
  const { data } = await request('/api/mail/track-output', {
    method: 'POST',
    timeout: 300000,
    data: { ...params },
  });
  return data;
}
