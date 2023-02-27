import React from 'react';
import { Descriptions, Spin, Tag, Typography } from 'antd';
import numeral from 'numeral';

interface InfoProps {
  loading: boolean;
  data: any;
}
const CompanyInfo: React.FC<InfoProps> = (props) => {
  const { loading, data } = props;
  const renderKeywordTags = (keywords: string) => {
    if (!keywords) {
      return '';
    }
    const wordsArr = keywords.split(',');
    const tags = wordsArr.map((word: string) => <Tag key={word}>{word}</Tag>);
    return (
      <Typography.Paragraph
        ellipsis={{
          rows: 2,
          expandable: true,
        }}
      >
        {tags}
      </Typography.Paragraph>
    );
  };

  const renderMoney = (money: number) => {
    if (!money) {
      return '';
    }
    return `$ ${numeral(money).format('0,0')}`;
  };

  return (
    <div>
      <Spin spinning={loading} tip="加载中...">
        <Descriptions title={false} bordered labelStyle={{ width: 108 }} column={1} size="small">
          <Descriptions.Item label="国家">{data?.company_country}</Descriptions.Item>
          <Descriptions.Item label="地址">{data?.company_address}</Descriptions.Item>
          <Descriptions.Item label="创立时间">{data?.founded}</Descriptions.Item>
          <Descriptions.Item label="员工数">{data?.employees}</Descriptions.Item>
          <Descriptions.Item label="营业额">{renderMoney(data?.revenue)}</Descriptions.Item>
          <Descriptions.Item label="行业">{data?.industry}</Descriptions.Item>
          <Descriptions.Item label="公司介绍">
            <Typography.Paragraph
              ellipsis={{
                rows: 2,
                expandable: true,
              }}
            >
              {data?.short_description}
            </Typography.Paragraph>
          </Descriptions.Item>
          <Descriptions.Item label="关键词">{renderKeywordTags(data?.keywords)}</Descriptions.Item>
          <Descriptions.Item label="相关技术">
            {renderKeywordTags(data?.technologies)}
          </Descriptions.Item>
          <Descriptions.Item label="谷歌收录">{data?.gg_total}</Descriptions.Item>
          <Descriptions.Item label="网站标题">{data?.gg_title}</Descriptions.Item>
          <Descriptions.Item label="网站描述">{data?.gg_desc}</Descriptions.Item>
        </Descriptions>
      </Spin>
    </div>
  );
};

export default CompanyInfo;
