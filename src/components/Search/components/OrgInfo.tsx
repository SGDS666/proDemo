import React, { useEffect } from 'react';
import { apiOrgInfo } from '@/services/search';
import { useRequest } from '@umijs/max';
import { Descriptions, Spin } from 'antd';
import { LinkedinOutlined } from '@ant-design/icons';
import { renderPlatformUrl } from '@/utils/common';

interface InfoProps {
  orgId: string;
}
const OrgInfo: React.FC<InfoProps> = (props) => {
  const { orgId } = props;

  const { data, run, loading } = useRequest(apiOrgInfo, { debounceInterval: 500, manual: true });

  const renderSocial = () => {
    if (!data) return null;
    const { linkedin_id, platform: plat, platform_url, zoominfo_url } = data;
    if (linkedin_id) {
      const url = renderPlatformUrl('linkedin', linkedin_id, '');
      return (
        <a target="_blank" rel="noopener noreferrer" href={url}>
          <h3>
            <LinkedinOutlined />
          </h3>
        </a>
      );
    }
    if (plat === 'zoominfo') {
      const url = zoominfo_url ? zoominfo_url : platform_url;
      return (
        <a target="_blank" rel="noopener noreferrer" href={url}>
          <span style={{ fontSize: 16, fontWeight: 500 }}>🅉</span>
        </a>
      );
    }
    return null;
  };

  const renderCountryFlag = (countryCode: string) => {
    if (!countryCode || countryCode === 'unkown') {
      return null;
    }
    return (
      <>
        <img
          src={`https://files.laifaxin.com/flags/countries_flags/${countryCode}.png`}
          width={24}
        />
        <span style={{ paddingLeft: 12 }}>{countryCode}</span>
      </>
    );
  };

  const renderWebsite = (website: string) => {
    if (!website) {
      return null;
    }
    if (website.indexOf('http') >= 0) {
      return (
        <a target="_blank" rel="noopener noreferrer" href={website}>
          {website}
        </a>
      );
    }
    return (
      <a target="_blank" rel="noopener noreferrer" href={`http://${website}`}>
        {website}
      </a>
    );
  };

  useEffect(() => {
    if (orgId) {
      run({ orgId });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orgId]);

  return (
    <div>
      <Spin spinning={loading} tip="加载中...">
        <Descriptions title="企业基本信息" bordered labelStyle={{ width: 128 }} column={1}>
          <Descriptions.Item label="官网">{renderWebsite(data?.website)}</Descriptions.Item>
          <Descriptions.Item label="国家或地区">
            {renderCountryFlag(data?.countryCode)}
          </Descriptions.Item>
          <Descriptions.Item label="总部">{data?.headquarters}</Descriptions.Item>
          <Descriptions.Item label="企业规模">{data?.company_size}</Descriptions.Item>
          <Descriptions.Item label="创立时间">{data?.founded}</Descriptions.Item>
          <Descriptions.Item label="官方电话">{data?.phone_number}</Descriptions.Item>
          <Descriptions.Item label="类别">{data?.type}</Descriptions.Item>
          <Descriptions.Item label="行业">{data?.industries}</Descriptions.Item>
          <Descriptions.Item label="主营">{data?.specialties}</Descriptions.Item>
          <Descriptions.Item label="营业额">{data?.revenue}</Descriptions.Item>
          <Descriptions.Item label="社媒">{renderSocial()}</Descriptions.Item>
        </Descriptions>
      </Spin>
    </div>
  );
};

export default OrgInfo;
