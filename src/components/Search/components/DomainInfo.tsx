import React from 'react';
import { Descriptions, Spin } from 'antd';

interface InfoProps {
  domainInfo: any;
  loading: boolean;
}
const DomainInfo: React.FC<InfoProps> = (props: InfoProps) => {
  const { domainInfo, loading } = props;

  return (
    <div>
      <Spin spinning={loading} tip="加载中...">
        <Descriptions title="域名基本信息" bordered labelStyle={{ width: 128 }} column={1}>
          <Descriptions.Item label="域名">{domainInfo?.domain}</Descriptions.Item>
          <Descriptions.Item label="谷歌收录数">{domainInfo?.gg_total}</Descriptions.Item>
          <Descriptions.Item label="标题">{domainInfo?.gg_title}</Descriptions.Item>
          <Descriptions.Item label="描述">{domainInfo?.gg_desc}</Descriptions.Item>
        </Descriptions>
      </Spin>
    </div>
  );
};

export default DomainInfo;
