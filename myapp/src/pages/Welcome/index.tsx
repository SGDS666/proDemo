import { useLink } from '@/hooks/useLink';
import { PageContainer } from '@ant-design/pro-components';
import { useModel } from '@umijs/max';
import { Card, theme, Row, Col } from 'antd';
import React from 'react';
import LoginInfo from './component/LoginInfo';

import TodayData from './component/TodayData';
import styles from './welcome.less';
/**
 * 每个单独的卡片，为了复用样式抽成了组件
 * @param param0
 * @returns
 */
const InfoCard: React.FC<{
  title: string;
  index: number;
  desc: string;
  href: string;
}> = ({ title, href, index, desc }) => {
  const { useToken } = theme;

  const { token } = useToken();
  const linkto = useLink()
 
  return (
    <div
      onClick={()=>linkto(href)}
      className={styles.card}
      style={{
        borderRadius: '8px',
        fontSize: '14px',
        color: token.colorTextSecondary,
        lineHeight: '22px',
        padding: '16px 19px',
        minWidth: '220px',
        flex: 1,
      }}
    >
      <div
        style={{
          display: 'flex',
          gap: '4px',
          alignItems: 'center',
        }}
      >
        <div
          style={{
            width: 48,
            height: 48,
            lineHeight: '22px',
            backgroundSize: '100%',
            textAlign: 'center',
            padding: '8px 16px 16px 12px',
            color: '#FFF',
            fontWeight: 'bold',
            backgroundImage:
              "url('https://gw.alipayobjects.com/zos/bmw-prod/daaf8d50-8e6d-4251-905d-676a24ddfa12.svg')",
          }}
        >
          {index}
        </div>
        <div
          style={{
            fontSize: '16px',
            color: token.colorText,
            paddingBottom: 8,
          }}
        >
          {title}
        </div>
      </div>
      <div
        style={{
          fontSize: '14px',
          color: token.colorTextSecondary,
          textAlign: 'justify',
          lineHeight: '22px',
          marginBottom: 8,
        }}
      >
        {desc}
      </div>
    </div>
  );
};

const Welcome: React.FC = () => {
  const { token } = theme.useToken();
  const { initialState } = useModel('@@initialState');
  return (
    <PageContainer>
      <Card
        style={{
          borderRadius: 8,
        }}
        bodyStyle={{
          backgroundImage:
            initialState?.settings?.navTheme === 'realDark'
              ? 'background-image: linear-gradient(75deg, #1A1B1F 0%, #191C1F 100%)'
              : 'background-image: linear-gradient(75deg, #FBFDFF 0%, #F5F7FF 100%)',
        }}
      >
        <div
          style={{
            backgroundPosition: '100% -30%',
            backgroundRepeat: 'no-repeat',
            backgroundSize: '274px auto',
            backgroundImage:
              "url('https://gw.alipayobjects.com/mdn/rms_a9745b/afts/img/A*BuFmQqsB2iAAAAAAAAAAAAAAARQnAQ')",
          }}
        >
          <div
            style={{
              fontSize: '20px',
              color: token.colorTextHeading,
            }}
          >
            欢迎使用 来发信
          </div>
          <p
            style={{
              fontSize: '14px',
              color: token.colorTextSecondary,
              lineHeight: '22px',
              marginTop: 16,
              marginBottom: 32,
              width: '65%',
            }}
          >
            专为外贸企业提供全球营销的一站式服务平台，助力外贸业务飞速发展
          </p>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 16,
            }}
          >
            <InfoCard
              index={1}
              href="/search/global-engine"
              title="全球客户搜索"

              desc="Google、LinkedIn、Facebook、Twitter、Zoominfo等，一键获取姓名、职位、社媒、企业官网等。"
            />
            <InfoCard
              index={2}
              title="邮箱批量验证"
              href="/contacts/companies"
              desc="邮箱验证服务完全免费，单日可验证上百万邮箱，全球邮箱验证准确率99%+。"
            />
            <InfoCard
              index={3}
              title="邮件营销服务"
              href="/marketing/tasks"
              desc="批量自动发送邮箱，支持数据统计，实时追踪发送效果，低成本，个性化，轻松上手。"
            />
            <InfoCard
              index={4}
              title="邮件实时追踪"
              href="/marketing/tasks"
              desc="实时了解客户阅读、点击、下载击状态及时跟进客户情况，自动统计追踪数据，客户开发更高效。"
            />
          </div>
        </div>
      </Card>
      <Row wrap justify="space-between" gutter={16}>
        <Col xl={15} xs={24} >
          <TodayData/>
        </Col>
        <Col xl={9} xs={24}>
          <LoginInfo/>
        </Col>
      </Row>


    </PageContainer>
  );
};

export default Welcome;
