// @ts-ignore
/* eslint-disable */
import { request } from '@umijs/max';
import { formatParams } from '@/utils/common';

export async function apiAccountsItems() {
  return request('/api/mails/accounts-items', {
    method: 'POST',
  });
}

export async function apiAccountsConfig(params: any) {
  return request('/api/mails/accounts-config', {
    method: 'POST',
    data: params,
  });
}

export async function apiAccountsPosteConfig(params: any) {
  return request('/api/mails/accounts-poste-config', {
    method: 'POST',
    data: params,
  });
}

export async function apiAccountsCheck(params: any) {
  return request('/api/mails/accounts-check', {
    method: 'POST',
    data: params,
  });
}

export async function apiAccountsAdd(params: any) {
  return request('/api/mails/accounts-add', {
    method: 'POST',
    data: params,
  });
}

export async function apiAccountsSave(params: any) {
  return request('/api/mails/accounts-save', {
    method: 'POST',
    data: params,
  });
}

export async function apiAccountPassword(params: any) {
  return request('/api/mails/account-password', {
    method: 'POST',
    data: params,
  });
}

export async function apiAccountsDelete(params: any) {
  return request('/api/mails/accounts-delete', {
    method: 'POST',
    data: params,
  });
}

export async function apiMailsCount() {
  return request('/api/mails/mails-count', {
    method: 'POST',
    skipErrorHandler: true,
  });
}

export async function apiAccountsList() {
  return request('/api/mails/accounts-list', {
    method: 'POST',
  });
}

export async function apiMailsList(params: any) {
  return request('/api/mails/mails-list', {
    method: 'POST',
    data: params,
  });
}

export async function apiMailSendStatus(params: any) {
  return request('/api/mails/send-status', {
    method: 'POST',
    data: params,
  });
}

export async function apiMailsOpen(params: any) {
  return request('/api/mails/mail-open', {
    method: 'POST',
    data: params,
  });
}

export async function apiMailOwnerSet(params: any) {
  return request('/api/mails/mail-owner-set', {
    method: 'POST',
    data: params,
  });
}

export async function apiMailsDelete(params: any) {
  return request('/api/mails/mails-delete', {
    method: 'POST',
    data: params,
  });
}

export async function apiMailDelete(params: any) {
  return request('/api/mails/mail-delete', {
    method: 'POST',
    data: params,
  });
}

export async function apiMailsDrop(params: any) {
  return request('/api/mails/mails-drop', {
    method: 'POST',
    data: params,
  });
}

export async function apiMailDrop(params: any) {
  return request('/api/mails/mail-drop', {
    method: 'POST',
    data: params,
  });
}

export async function apimailsunseen(params: any) {
  return request('/api/mails/mail-mark-unseen', {
    method: 'POST',
    data: params,
  });
}
export async function apimailsnotjunk(params: any) {
  return request('/api/mails/mail-mark-not-junk', {
    method: 'POST',
    data: params,
  });
}

export async function apiMailTrackInfo(params: any) {
  return await request('/api/mails/track-info', {
    method: 'POST',
    data: params,
  });
}

export async function apiMailHistory(params: any) {
  return await request('/api/mails/mail-history', {
    method: 'POST',
    data: params,
  });
}

export async function apiMailCancelTimer(params: any) {
  return request('/api/mails/cancel-timer', {
    method: 'POST',
    data: params,
  });
}

//////////////////////////////////////////
export async function apiAccountItems() {
  return request('/api/mailbox/account-items', {
    method: 'POST',
  });
}
export async function apiSenderItems() {
  return request('/api/mailbox/sender-items', {
    method: 'POST',
  });
}

export async function apiAttachmentItems() {
  return request('/api/mailbox/attachment-items', {
    method: 'POST',
  });
}

export async function apiMailsSend(params: any) {
  return request('/api/mails/mails-send', {
    method: 'POST',
    data: params,
  });
}

export async function apiMailsSave(params: any) {
  return request('/api/mails/mails-save', {
    method: 'POST',
    data: { ...params },
  });
}

export async function apiSenderCount() {
  const { data } = await request('/api/mailbox/sender-count', {
    method: 'POST',
  });
  return data;
}

export async function apiSenderCheck(params: any) {
  return request('/api/mailbox/sender-check', {
    method: 'POST',
    data: { ...params },
    skipErrorHandler: true,
  });
}

export async function apiSenderSave(params: any) {
  const { success } = await request('/api/mailbox/sender-save', {
    method: 'POST',
    data: { ...params },
  });
  return success;
}

// 邮件内容
export async function apiContentList(params: any) {
  const postData = formatParams(params);
  const { data } = await request('/api/mailbox/content-list', {
    method: 'POST',
    data: postData,
  });
  const { total, current } = data;
  return { data: data.list, total, current };
}

export async function apiContentSave(params: any) {
  return request('/api/mailbox/content-save', {
    method: 'POST',
    data: { ...params },
  });
}

export async function apiContentDelete(params: any) {
  return request('/api/mailbox/content-delete', {
    method: 'POST',
    data: { ...params },
  });
}

export async function apiFolderAdd(params: any) {
  const { success } = await request('/api/mailbox/folder-add', {
    method: 'POST',
    data: { ...params },
  });
  return success;
}

export async function apiFolderSave(params: any) {
  const { success } = await request('/api/mailbox/folder-save', {
    method: 'POST',
    data: { ...params },
  });
  return success;
}

export async function apiFolderDelete(params: any) {
  return request('/api/mailbox/folder-delete', {
    method: 'POST',
    data: { ...params },
  });
}

export async function apiFolderList(params: any) {
  const { data } = await request('/api/mailbox/folder-list', {
    method: 'POST',
    data: { ...params },
  });
  return data;
}

export async function apiFolderItems(params: any) {
  return request('/api/mailbox/folder-items', {
    method: 'POST',
    data: { ...params },
  });
}

export async function apiFolderExchange(params: any) {
  const { data } = await request('/api/mailbox/folder-exchange', {
    method: 'POST',
    data: { ...params },
  });
  return data;
}

export async function apiContentTree() {
  return request('/api/mailbox/templets-tree', {
    method: 'POST',
  });
}

export async function apiAttachmentOptions() {
  return request('/api/mailbox/attachment-options', {
    method: 'POST',
  });
}

export async function apiAttachmentSave(params: any) {
  return request('/api/mailbox/attachment-save', {
    method: 'POST',
    data: { ...params },
  });
}
//////////////////////////////////////////////
// export async function apiMailSave(params: any) {
//   const { success, data } = await request('/api/mails/mail-save', {
//     method: 'POST',
//     data: { ...params },
//   });
//   return { success, data };
// }
export async function apiMailSave(params: any) {
  return request('/api/mails/mail-save', {
    method: 'POST',
    data: params,
  });
}

export async function apiAccountOptions() {
  const { data } = await request('/api/mailbox/account-options', {
    method: 'POST',
  });
  return data;
}

export async function apiSenderOptions() {
  const { data } = await request('/api/mailbox/sender-options', {
    method: 'POST',
  });
  return data;
}

export async function apiMailSend(params: any) {
  const { success, data } = await request('/api/mail/send', {
    method: 'POST',
    data: { ...params },
  });
  return { success, data };
}

export async function apiSignDefaultSet(params: any) {
  const { success } = await request('/api/mailbox/sign-default-set', {
    method: 'POST',
    data: { ...params },
  });
  return success;
}

export async function apiSignDefault(params: any) {
  const { data } = await request('/api/mailbox/sign-default', {
    method: 'POST',
    data: { ...params },
  });
  return data;
}

export async function apiSignItems() {
  const { data } = await request('/api/mailbox/sign-items', {
    method: 'POST',
  });
  return data;
}

// 邮件签名
export async function apiSignSave(params: any) {
  return request('/api/mailbox/sign-save', {
    method: 'POST',
    data: { ...params },
  });
}

export async function apiSignAdd(params: any) {
  return request('/api/mailbox/sign-add', {
    method: 'POST',
    data: { ...params },
  });
}

export async function apiSignCount() {
  return request('/api/mailbox/sign-count', {
    method: 'POST',
  });
}

export async function apiSignList(params: any) {
  const postData = formatParams(params);
  const { data } = await request('/api/mailbox/sign-list', {
    method: 'POST',
    data: postData,
  });
  const { total, current } = data;
  return { data: data.list, total, current };
}

export async function apiSignDelete(params: any) {
  const { success } = await request('/api/mailbox/sign-delete', {
    method: 'POST',
    data: { ...params },
  });
  return success;
}
