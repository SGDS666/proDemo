// @ts-ignore
/* eslint-disable */
import { formatParams } from '@/utils/common';
import { request } from '@umijs/max';

// skipErrorHandler: true, 该配置为 true 是会跳过默认的错误处理，用于项目中部分特殊的接口。

export async function apiOrganizeUsers() {
  return request('/api/enterprise/organize-users', {
    method: 'POST',
  });
}

export async function apiSubordinateUsers() {
  return request('/api/enterprise/subordinate-users', {
    method: 'POST',
  });
}

export async function apiMyOrganize() {
  return request('/api/enterprise/my-orgs', {
    method: 'POST',
  });
}

export async function apiCreateOrganize(params: any) {
  return request('/api/enterprise/organize-create', {
    method: 'POST',
    data: params,
  });
}

export async function apiProfileShow() {
  return request('/api/enterprise/profile/show', {
    method: 'POST',
  });
}

export async function apiProfileModify(params: any) {
  return request('/api/enterprise/profile/modify', {
    method: 'POST',
    data: params,
  });
}

export async function apiMembersShow(
  params: {
    current?: number;
    pageSize?: number;
  },
  options?: { [key: string]: any },
) {
  const postData = formatParams(params);
  return request<any>('/api/enterprise/members/show', {
    method: 'POST',
    data: postData,
    ...(options || {}),
  });
}

export async function apiInviteStatus(params: any) {
  return request('/api/enterprise/invite-status', {
    method: 'POST',
    data: params,
    skipErrorHandler: true,
  });
}

export async function apiInviteJoin(params: any) {
  return request('/api/enterprise/invite-join', {
    method: 'POST',
    data: params,
  });
}

export async function apiMembersModify(params: any) {
  return request('/api/enterprise/members/modify', {
    method: 'POST',
    data: params,
  });
}

export async function apiMembersInvite(params: any) {
  return request('/api/enterprise/members/invite', {
    method: 'POST',
    data: params,
  });
}

export async function apiMembersDisable(params: any) {
  return request('/api/enterprise/members/disable', {
    method: 'POST',
    data: params,
  });
}

export async function apiMembersDelete(params: any) {
  return request('/api/enterprise/members/delete', {
    method: 'POST',
    data: params,
  });
}

export async function apiTeamsProfile(params: any) {
  return request('/api/enterprise/teams/profile-show', {
    method: 'POST',
    data: params,
  });
}

export async function apiTeamsShow() {
  return request('/api/enterprise/teams/show', {
    method: 'POST',
  });
}

export async function apiTeamsChange(params: any) {
  return request('/api/enterprise/teams/change', {
    method: 'POST',
    data: params,
  });
}

export async function apiTeamsManage(params: any) {
  return request('/api/enterprise/teams/manage', {
    method: 'POST',
    data: params,
  });
}

export async function apiTeamsUserList(params: any) {
  return request('/api/enterprise/teams/user-list', {
    method: 'POST',
    data: params,
  });
}

export async function apiRolesList(): Promise<any> {
  return request<API.CommonResult>('/api/enterprise/roles-list', {
    method: 'POST',
  });
}

export async function apiRoleChange(params: any) {
  return request('/api/enterprise/role/change', {
    method: 'POST',
    data: params,
  });
}

export async function apiRoleUserList(params: any): Promise<any> {
  return request<API.CommonResult>('/api/enterprise/role-user-list', {
    method: 'POST',
    data: params,
  });
}

export async function apiPermissionTree(): Promise<any> {
  return request<API.CommonResult>('/api/enterprise/permissions-tree', {
    method: 'POST',
  });
}

export async function apiRolePermissionsShow(params: any): Promise<any> {
  return request<API.CommonResult>('/api/enterprise/permissions/show', {
    method: 'POST',
    data: params,
  });
}

export async function apiPermissionsManage(params: any) {
  return request<API.CommonResult>('/api/enterprise/permissions/manage', {
    method: 'POST',
    data: params,
  });
}

export async function apiPermissionsSave(params: any) {
  return request<API.CommonResult>('/api/enterprise/permissions/save', {
    method: 'POST',
    data: params,
  });
}

export async function apiOperationsShow(
  params: {
    current?: number;
    pageSize?: number;
  },
  options?: { [key: string]: any },
) {
  const postData = formatParams(params);
  const { data } = await request<any>('/api/enterprise/operations/show', {
    method: 'POST',
    data: postData,
    ...(options || {}),
  });
  const { total, current, list } = data;
  return { data: list, total, current };
}
