import React, { useEffect } from 'react';
import {
  Card,
  Descriptions,
  Row,
  Col,
  Statistic,
  theme,
  Tag,
  Tooltip,
  Space,
  Checkbox,
} from 'antd';
import { CheckOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { apiWelcomeInfo, apiPing, apiTodayData } from '@/services/user';
import { history, Link, useModel, useRequest } from '@umijs/max';
import { useSetState, useTrackedEffect } from 'ahooks';
import { PageContainer } from '@ant-design/pro-components';
import { ReactDiv } from '@/components/EditTabs';
import { yieldDelayCss } from '@/utils/animation';
import styles from './index.less';
// const quickLinks = [
//   { name: '联系人', link: '/contacts/contacts', icon: <ContactsOutlined /> },
//   { name: '公司', link: '/contacts/companies', icon: <TeamOutlined /> },
//   { name: '联系人导入', link: '/contacts/contacts-import', icon: <TeamOutlined /> },
//   { name: '获客', link: '/search', icon: <SearchOutlined /> },
//   { name: '批量搜索', link: '/search/tasks', icon: <SearchOutlined /> },
//   { name: '邮件营销', link: '/marketing', icon: <GlobalOutlined /> },
//   { name: '收件箱', link: '/mails', icon: <MailOutlined /> },
//   { name: '我的余额', link: '/expenses/balance', icon: <DollarOutlined /> },
//   { name: '我的企业', link: '/enterprise', icon: <HomeOutlined /> },
// ];
interface InfoCardProps extends ReactDiv {
  title: string;
  index: number;
  desc: string;
  href: string;
}
const ColorList = [
  { key: 'daybreak', color: '#1890ff', title: '拂晓蓝' },
  { key: 'techBlue', color: '#1677FF', title: '科技蓝' },
  { key: 'geekblue', color: '#2F54EB', title: '极客蓝' },
  { key: 'dust', color: '#F5222D', title: '薄暮红' },
  { key: 'volcano', color: '#FA541C', title: '火山红' },
  { key: 'sunset', color: '#FAAD14', title: '日落黄' },
  { key: 'cyan', color: '#13C2C2', title: '明青色' },
  { key: 'green', color: '#52C41A', title: '极光绿' },
  { key: 'purple', color: '#722ED1', title: '酱色紫' },
];

const ColorTag: React.FC<any> = React.forwardRef(({ color, check, ...rest }, ref) => (
  <a {...rest}>
    <div
      style={{ backgroundColor: color, width: 22, height: 22, textAlign: 'center' }}
      ref={ref as any}
    >
      {check ? <CheckOutlined style={{ fontSize: 16, color: 'white' }} /> : ''}
    </div>
  </a>
));

const InfoCard: React.FC<InfoCardProps> = ({ title, index, desc, style, href, ...props }) => {
  const { useToken } = theme;
  const { token } = useToken();

  return (
    <div
      className={`${styles.infocard} both-up`}
      {...props}
      style={{
        // backgroundColor: token.colorBgElevated,
        boxShadow: `0px 1px 5px ${token.colorBorderSecondary}`,
        borderRadius: '8px',
        fontSize: '14px',
        color: token.colorTextSecondary,
        lineHeight: '22px',
        padding: '16px 19px',
        minWidth: '220px',
        backdropFilter: 'blur(20px)',
        flex: 1,
        ...style,
      }}
      onClick={() => history.push(href)}
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
            width: 24,
            height: 24,
            lineHeight: '18px',
            backgroundSize: '100%',
            textAlign: 'center',
            padding: 2,
            color: '#FFF',
            fontWeight: 'bold',
            borderRadius: 12,
            backgroundColor: token.colorPrimary,
          }}
        >
          {index}
        </div>
        <div
          style={{
            fontSize: '16px',
            color: token.colorText,
            paddingBottom: 8,
            paddingTop: 6,
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
const CardsData = [
  {
    index: 1,
    href: '/search/global-engine',
    title: '全球客户搜索',
    desc: 'Google、LinkedIn、Facebook、Twitter、Zoominfo等，一键获取姓名、职位、社媒、企业官网等。',
  },
  {
    index: 2,
    title: '邮箱批量验证',
    href: '/contacts/contacts',
    desc: '邮箱验证服务完全免费，单日可验证上百万邮箱，全球邮箱验证准确率99%+。',
  },
  {
    index: 3,
    title: '邮件营销服务',
    href: '/marketing/tasks',
    desc: '批量自动发送邮箱，支持数据统计，实时追踪发送效果，低成本，个性化，轻松上手。',
  },
  {
    index: 4,
    title: '邮件实时追踪',
    href: '/marketing/tracks',
    desc: '实时了解客户阅读、点击、下载击状态及时跟进客户情况，自动统计追踪数据，客户开发更高效。',
  },
];
const Welcome: React.FC = () => {
  const { initialState, setInitialState } = useModel('@@initialState');
  const colorPrimary = initialState?.settings?.colorPrimary;
  const navTheme = initialState?.settings?.navTheme ? initialState?.settings?.navTheme : 'light';
  const { token } = theme.useToken();
  const [state, setState] = useSetState<Record<string, any>>({
    delay: -1,
  });
  // const { data: logsData } = useRequest(apiRecentlyLogs);
  const { data: welcomeData } = useRequest(apiWelcomeInfo);
  const { run: pingRun } = useRequest(apiPing, { manual: true });

  const { data: todayData, loading: todayLoading } = useRequest(apiTodayData, {
    pollingInterval: 60000,
  });

  const getPingTime = async () => {
    const t1 = Date.now();
    await pingRun();
    const delay = Date.now() - t1;
    setState({ delay });
  };
  useTrackedEffect(

    (changes: any) => {
      const deps = ["welcomeData", "todayData", "todayLoading", "token", "initialState", "colorPrimary", "navTheme", "state"]
      console.log('触发更新的依赖是: ', deps[changes[0]]);
    },
    [welcomeData, todayData, todayLoading, token, initialState, colorPrimary, navTheme, state],
  );
  useEffect(() => {
    const { colorPrimaryActive, colorPrimaryBg } = token;
    setInitialState((preInitialState) => ({
      ...preInitialState,
      settings: {
        ...preInitialState?.settings,
        token: {
          sider: {
            colorTextMenuSelected: colorPrimaryActive,
            colorBgMenuItemSelected: colorPrimaryBg,
          },
        },
      },
    }));
  }, [setInitialState, token]);

  useEffect(() => {
    getPingTime();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onThemeColorChange = (color: string) => {
    setInitialState((preInitialState) => ({
      ...preInitialState,
      settings: { ...preInitialState?.settings, colorPrimary: color },
    }));
  };

  const renderDelayTime = () => {
    const { delay } = state;
    if (delay < 0) {
      return null;
    }
    if (delay < 100) {
      return <Tag color="success">{delay} ms</Tag>;
    }
    if (delay < 200) {
      return <Tag color="warning">{delay} ms</Tag>;
    }
    return <Tag color="error">{delay} ms</Tag>;
  };

  const renderLocation = (address: string) => {
    if (!address) return null;
    if (address.indexOf('中国') < 0) {
      return (
        <Tag icon={<ExclamationCircleOutlined />} color="warning">
          您正在使用代理软件，建议关闭以提升访问体验
        </Tag>
      );
    }
    return null;
  };
  const cardDelay = yieldDelayCss({ max: 4 });
  const todayDelay = yieldDelayCss({ max: 9, delay: 0.1 });
  const desDelay = yieldDelayCss({ max: 7, delay: 0.4 });

  const onNavThemeChange = (themeType: 'light' | 'realDark', checked: boolean) => {
    if (checked) {
      setInitialState((preInitialState) => ({
        ...preInitialState,
        settings: { ...preInitialState?.settings, navTheme: themeType },
      }));
    }
  };

  return (
    <PageContainer title={false}>
      <Card>
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
              // overflow: "hidden"
            }}
          >
            {CardsData.map((card) => (
              <InfoCard
                style={{ animationDelay: cardDelay.next().value! }}
                key={card.index}
                index={card.index}
                href={card.href}
                title={card.title}
                desc={card.desc}
              />
            ))}
          </div>
        </div>
      </Card>
      <Row gutter={24}>
        <Col xl={16} lg={24} md={24} sm={24} xs={24}>
          <div>
            <Card
              style={{
                height: '100%',
                marginTop: 12,
                marginRight: 0,
              }}
              title="今日数据"
              loading={todayLoading}
            >
              {todayData?.map((item: any) => {
                const { type, name, url, value } = item;
                return (
                  <Card.Grid
                    className="both-down"
                    style={{
                      width: '33.3%',
                      textAlign: 'center',
                      animationDelay: todayDelay.next().value!,
                      height: 134,
                      paddingTop: 32,
                    }}
                    key={type}
                  >
                    <Link to={url} style={{ width: '100%', textAlign: 'center' }}>
                      {' '}
                      <Statistic
                        title={name}
                        value={value}
                        valueStyle={
                          value
                            ? { color: token.colorPrimaryActive, fontSize: 32 }
                            : { fontSize: 32 }
                        }
                      />
                    </Link>
                  </Card.Grid>
                );
              })}
            </Card>
          </div>
        </Col>
        <Col xl={8} lg={24} md={24} sm={24} xs={24}>
          <div>
            <Card
              title="主题设置"
              style={{
                height: '100%',
                marginTop: 12,
              }}
              bodyStyle={{ padding: 0 }}
            >
              <Descriptions
                title={false}
                bordered
                column={1}
                labelStyle={{ width: 128, height: 48 }}
              >
                <Descriptions.Item
                  label="整体风格"
                  className="both-left"
                  style={{ animationDelay: desDelay.next().value! }}
                >
                  <div>
                    <Checkbox.Group value={[navTheme]}>
                      <Checkbox
                        value="light"
                        onChange={(e) => onNavThemeChange(e.target.value, e.target.checked)}
                      >
                        亮色风格
                      </Checkbox>
                      <Checkbox
                        value="realDark"
                        onChange={(e) => onNavThemeChange(e.target.value, e.target.checked)}
                      >
                        暗色风格
                      </Checkbox>
                    </Checkbox.Group>
                  </div>
                </Descriptions.Item>
                <Descriptions.Item
                  label="主题颜色"
                  className="both-left"
                  style={{ animationDelay: desDelay.next().value! }}
                >
                  <div>
                    <Space>
                      {ColorList.map((item) => (
                        <Tooltip key={item.key} title={item.title}>
                          <ColorTag
                            key={item.key}
                            color={item.color}
                            check={colorPrimary === item.color}
                            onClick={() => onThemeColorChange(item.color)}
                          />
                        </Tooltip>
                      ))}
                    </Space>
                  </div>
                </Descriptions.Item>
              </Descriptions>
            </Card>
            <Card
              className="both-left"
              bordered={false}
              title="登录信息"
              style={{
                height: '100%',
                marginTop: 12,
              }}
              bodyStyle={{ padding: 0 }}
            >
              <Descriptions title={false} bordered column={1} labelStyle={{ width: 128 }}>
                <Descriptions.Item
                  label="当前访问IP"
                  className="both-left"
                  style={{ animationDelay: desDelay.next().value! }}
                >
                  {welcomeData?.ip}
                </Descriptions.Item>
                <Descriptions.Item
                  label="位置信息"
                  className="both-left"
                  style={{ animationDelay: desDelay.next().value! }}
                >
                  {welcomeData?.address}
                </Descriptions.Item>
                <Descriptions.Item
                  label="访问速度"
                  className="both-left"
                  style={{ animationDelay: desDelay.next().value! }}
                >
                  {renderDelayTime()}
                </Descriptions.Item>
                <Descriptions.Item
                  label="提示信息"
                  className="both-left"
                  style={{ animationDelay: desDelay.next().value! }}
                >
                  {renderLocation(welcomeData?.address)}
                </Descriptions.Item>
              </Descriptions>
              {/* <Table<any>
              rowKey="_id"
              size="small"
              columns={columns}
              dataSource={logsData}
              pagination={{
                style: { marginBottom: 0 },
                pageSize: 10,
              }}
            /> */}
            </Card>
          </div>
        </Col>
      </Row>
    </PageContainer>
  );
};

export default Welcome;
