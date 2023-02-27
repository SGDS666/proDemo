import { request } from '@umijs/max';
import { formatParams } from '@/utils/common';

export async function apiPartnerInviteInfo() {
  return await request('/api/partner/invite-info', {
    method: 'POST',
  });
}

export async function apiPartnerHide() {
  return await request('/api/partner/invite-hide', {
    method: 'POST',
  });
}

export async function apiPartnerInviteBind(params: any) {
  return await request('/api/partner/invite-bind', {
    method: 'POST',
    data: { ...params },
  });
}

export async function apiPartnerBind(params: any) {
  const { success } = await request('/api/partner/binding', {
    method: 'POST',
    data: { ...params },
  });
  return success;
}

export async function apiPartnerInviteRecord(params: any) {
  const postData = formatParams(params);
  const { data } = await request('/api/partner/invite-record', {
    method: 'POST',
    data: postData,
  });
  const { total, current } = data;
  return { data: data.list, total, current };
}

export async function apiPartnerInviteCommission(params: any) {
  const postData = formatParams(params);
  const { data } = await request('/api/partner/invite-commission', {
    method: 'POST',
    data: postData,
  });
  const { total, current } = data;
  return { data: data.list, total, current };
}

export async function apiPartnerCashOut(params: any) {
  const postData = formatParams(params);
  const { data } = await request('/api/partner/cash-out', {
    method: 'POST',
    data: postData,
  });
  const { total, current } = data;
  return { data: data.list, total, current };
}
