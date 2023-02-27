import { request } from '@umijs/max';

export async function apiReportNormalData() {
  const { data } = await request('/api/report/normal-data', {
    method: 'POST',
  });
  return data;
}

export async function apiReportChartsData(params: any) {
  const { data } = await request('/api/reports/charts-data', {
    method: 'POST',
    data: { ...params },
  });
  return data;
}

export async function apiReportOverviewData() {
  const { data } = await request('/api/reports/overview/show', {
    method: 'POST',
  });
  return data;
}

export async function apiTeamTotalData(params: any) {
  return request('/api/reports/team-total-data', {
    method: 'POST',
    data: params,
  });
}

export async function apiTeamMemberData(params: any) {
  return request('/api/reports/team-member-data', {
    method: 'POST',
    data: params,
  });
}
