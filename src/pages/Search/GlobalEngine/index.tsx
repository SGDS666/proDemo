import React from 'react';
import {
  Avatar,
  Button,
  Card,
  Divider,
  Input,
  message,
  Pagination,
  Space,
  Switch,
  Tag,
  Tooltip,
  Alert,
} from 'antd';
import RightContainer from '@/components/Global/RightContainer';
import {
  GlobalOutlined,
  GoogleOutlined,
  InfoCircleOutlined,
  LinkOutlined,
  MailOutlined,
  QuestionCircleOutlined,
  ReadOutlined,
  SettingOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import { useSetState } from 'ahooks';
import { apiPreviewCompanies } from '@/services/search';
import { useRequest, history } from '@umijs/max';
import { isIncludeGoogleParams } from '@/utils/common';
import TaskCreate from '../components/TaskCreate';
import GoogleInputModal from '@/components/Search/GoogleInputModal';
import { getSearchGrammar, optimizeGrammar } from '@/utils/search';
import { ProList } from '@ant-design/pro-components';
// import styles from '../style.less';
import { CountriesData } from '@/config/countries';
import { ParseKeywordColor } from '@/components/Tools';
import {
  FackbookIcon,
  GoogleIcon,
  LinkedInIcon,
  TwitterIcon,
  ZoominfoIcon,
} from '@/components/Icon';
import CompanyDetails from '@/components/Search/CompanyDetails';
import Introduce from '../components/introduce';
import CheckCards from '@/components/CheckCards';
import { yieldDelayCss } from '@/utils/animation';

export const LanguagesData = [
  { name: '英文', value: 'EN' },
  { name: '中文', value: 'CN', disable: true },
  { name: '法文', value: 'FR', disable: true },
];

const IconText = ({ icon, count, name }: { icon: any; count: number; name: string }) => (
  <span style={{ marginRight: 12 }}>
    {React.createElement(icon, { style: { marginInlineEnd: 8 } })}
    <a style={{ marginRight: 2 }}>{count}</a>
    {name}
  </span>
);

const Search: React.FC = () => {
  const [state, setState] = useSetState<Record<string, any>>({
    country: 'Global',
    gl: 'us',
    language: 'EN',
    platform: 'google',
    dataList: [],
    dataTotal: -1,
    dataKeyword: '',
    hasSearch: false,
    createVisible: false,
    seniorVisible: false,
    keyword: '',
    description: '',
    searchValues: {},
    optimize: true,
    realGrammar: '',
    dataPage: 1,
    dataCount: 0,
    domain: '',
    companyVisible: false,
  });

  const onClickGoogleUrl = () => {
    const { keyword, platform, language, optimize } = state;
    const realGrammar = encodeURIComponent(optimizeGrammar(platform, keyword, optimize));
    let url = 'https://google.com';
    if (platform === 'google') {
      url += `/search?q=${realGrammar}&hl=${language}`;
    }
    if (platform === 'linkedin') {
      url += `/search?q=site:linkedin.com/company ${realGrammar}&hl=${language}`;
    }
    if (platform === 'zoominfo') {
      url += `/search?q=site:zoominfo.com/c ${realGrammar}&hl=${language}`;
    }
    window.open(url);
  };

  const { run: searchRun, loading: searchLoading } = useRequest(apiPreviewCompanies, {
    manual: true,
    onSuccess: (data: any) => {
      if (!data) return;
      const { list, total, page, count } = data;
      const dataList: any = [];
      list.forEach((item: any) => {
        if (item?.title) {
          dataList.push(item);
        }
      });
      setState({ dataList, dataTotal: total, dataPage: page, dataCount: count });
    },
  });

  const onSearch = async (senior: boolean, value?: string) => {
    const { country, language, platform, optimize } = state;
    let { keyword } = state;
    if (senior) {
      keyword = value;
    }
    keyword = keyword.trim();
    if (!keyword) {
      setState({ hasSearch: false });
      return;
    }
    if (!senior) {
      if (keyword && !isIncludeGoogleParams(keyword)) {
        keyword = `"${keyword}"`;
      }
    }
    const realGrammar = optimizeGrammar(platform, keyword, optimize);
    if (realGrammar) {
      await searchRun({ keyword: realGrammar, country, language, platform, page: 1 });
      setState({ hasSearch: true, dataKeyword: keyword, keyword });
    }
  };

  const onPlatformChange = (value: any) => {
    if (value) {
      setState({ platform: value });
      const { hasSearch, keyword, language, country, optimize } = state;
      const realGrammar = optimizeGrammar(value, keyword, optimize);
      if (hasSearch && realGrammar) {
        searchRun({ keyword: realGrammar, country, language, platform: value, page: 1 });
      }
    }
  };

  const onPageChange = (page: number) => {
    const { platform, keyword, language, country, optimize } = state;
    const realGrammar = optimizeGrammar(platform, keyword, optimize);
    searchRun({ keyword: realGrammar, country, language, platform, page });
  };

  const onClickCreateTask = () => {
    const { keyword, platform, optimize } = state;
    const realGrammar = optimizeGrammar(platform, keyword, optimize);
    setState({ createVisible: true, realGrammar });
  };

  const onTaskCreateSuccess = () => {
    history.push('/search/tasks');
  };

  const onSearchAction = (values: any) => {
    const { searchValues } = values;
    const { grammar, description } = getSearchGrammar(searchValues);
    setState({ keyword: grammar, description, searchValues });
    onSearch(true, grammar);
  };

  const renderListTitle = (record: any) => {
    const { domain, orgName, gg_title, title: oriTitle } = record;
    const title = orgName || domain || gg_title || oriTitle;
    return (
      <span>
        <Avatar
          shape="square"
          src={<img src={`https://ico.laifaxin.com/ico/${domain}`} alt="avatar" />}
          style={{ marginRight: 12 }}
        />
        {ParseKeywordColor(title, state.dataKeyword)}
      </span>
    );
  };

  const renderListContent = (record: any) => {
    const { gg_desc, short_description, description } = record;
    const desc = short_description || gg_desc || description;
    return (
      <div style={{ height: 48, overflow: 'hidden' }}>
        {ParseKeywordColor(desc, state.dataKeyword)}
      </div>
    );
  };

  const renderCountry = (record: any) => {
    const { company_country, countryCode } = record;
    let countryName = '全球';
    if (company_country) {
      const index = CountriesData.findIndex((o) => o.en === company_country);
      if (index >= 0) {
        const { cn } = CountriesData[index];
        countryName = cn;
      } else {
        countryName = company_country;
      }
    }

    return (
      <Tag>
        {countryCode ? (
          <img
            src={`https://files.laifaxin.com/flags/countries_flags/${countryCode}.png`}
            height={12}
            width={18}
            style={{ marginRight: 4, marginBottom: -2 }}
          />
        ) : (
          <GlobalOutlined style={{ marginRight: 4 }} />
        )}
        {countryName}
      </Tag>
    );
  };

  const renderListActions = (record: any) => {
    let { employees, generic, personal, gg_total } = record;
    if (!employees) employees = 0;
    if (!generic) generic = 0;
    if (!personal) personal = 0;
    if (!gg_total) gg_total = 1;
    const mailCount = generic + personal;
    return [
      <IconText icon={TeamOutlined} count={employees} name="成员" key="listTeamMembersKey" />,
      <IconText icon={MailOutlined} count={mailCount} name="邮箱" key="listMailCountKey" />,
      <IconText icon={ReadOutlined} count={gg_total} name="页面" key="listGoogleTotalKey" />,
    ];
  };

  const renderListDescription = (record: any) => {
    const { website, linkedin_url, facebook_url, twitter_url } = record;
    if (!website) {
      return null;
    }
    // let url = website;
    // if (website.indexOf('http') < 0) {
    //   url = `http://${website}`;
    // }
    const linkedin = linkedin_url ? (
      // <a target="_blank" href={linkedin_url} rel="noreferrer" className={styles['social-link']}>
      //   <LinkedinOutlined />
      // </a>
      <LinkedInIcon style={{ width: 14, height: 14 }} />
    ) : null;
    const fackbook = facebook_url ? (
      // <a target="_blank" href={facebook_url} rel="noreferrer" className={styles['social-link']}>
      //   <FacebookOutlined />
      // </a>
      <FackbookIcon style={{ width: 14, height: 14 }} />
    ) : null;
    const twitter = twitter_url ? (
      // <a target="_blank" href={twitter_url} rel="noreferrer" className={styles['social-link']}>
      //   <TwitterOutlined />
      // </a>
      <TwitterIcon style={{ width: 14, height: 14 }} />
    ) : null;
    return (
      <Space style={{ marginLeft: 48, padding: '0 0' }}>
        {renderCountry(record)}
        {/* {popImg} */}
        <a target="_blank" href={website} rel="noreferrer">
          <LinkOutlined style={{ fontSize: 14 }} />
        </a>
        <a>{linkedin}</a>
        {fackbook}
        {twitter}
      </Space>
    );
  };

  const onListRownClick = (record: any) => {
    const { domain } = record;
    if (domain) {
      setState({ domain, companyVisible: true });
      return;
    }
    message.warning('暂无该企业数据，该数据已提交至后台，系统将自动收集该企业数据');
  };

  const checkCardStyle = { width: 148, height: 63 };
  const cardsDelay = yieldDelayCss({ max: 6 })
  return (
    <RightContainer pageTitle={false} pageGroup="search" pageActive="preview">
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Card style={{ width: 860 }} title="全球搜客引擎" headStyle={{ textAlign: 'center' }} className='both-down'>
          <CheckCards
            style={{ width: '100%' }}
            childStyle={{ width: "180px", height: "100px", marginRight: "12px" }}
            checkValue={state.platform}
            childClassName="both-big"
            onChange={(val) => onPlatformChange(val)}
            Cards={[
              {
                title: "Google",
                avatar: <Avatar src={<GoogleIcon shape="square" />} />,
                value: "google",
                style: { ...checkCardStyle, animationDelay: cardsDelay.next().value }
              },
              {
                title: "LinkedIn",
                avatar: <Avatar src={<LinkedInIcon />} shape="square" />,
                value: "linkedin",
                style: { ...checkCardStyle, animationDelay: cardsDelay.next().value }
              },
              {
                title: "Zoominfo",
                avatar: <Avatar src={<ZoominfoIcon />} shape="square" />,
                value: "zoominfo",
                style: { ...checkCardStyle, animationDelay: cardsDelay.next().value }
              },
              {
                title: "facebook",
                avatar: <Avatar src={<FackbookIcon />} shape="square" />,
                value: "facebook",
                style: { ...checkCardStyle, animationDelay: cardsDelay.next().value },
                disabled: true,
              },
              {
                title: "twitter",
                avatar: <Avatar src={<TwitterIcon />} shape="square" />,
                value: "twitter",
                style: { ...checkCardStyle, animationDelay: cardsDelay.next().value },
                disabled: true,
              }
            ]}
          />
          <Input.Search
            placeholder="请输入客户特征词（客户提供的产品/服务相关词）"
            style={{ width: '100%' }}
            size="large"
            onSearch={() => onSearch(false)}
            value={state.keyword}
            onChange={(e) => setState({ keyword: e.target.value })}
            loading={searchLoading}
            enterButton="搜索"
          />
          <div style={{ marginTop: 12 }}>
            <Button type="text" onClick={() => setState({ seniorVisible: true })}>
              <SettingOutlined /> 搜索设置
            </Button>
            {state.platform === 'google' ? (
              <span style={{ marginLeft: 24 }}>
                启用结果优化{' '}
                <Tooltip
                  title={
                    <div>
                      <div>启用此选项可大幅提高搜索质量，但搜索结果数量可能会减少。</div>
                      <div>
                        如果您要自行设置的排除词和包含词较多时，建议不开启内设排除词，以消除系统内置排除词的效果
                      </div>
                    </div>
                  }
                >
                  <QuestionCircleOutlined />
                </Tooltip>
                <Switch
                  style={{ marginLeft: 6 }}
                  checked={state.optimize}
                  onChange={(checked) => setState({ optimize: checked })}
                />
              </span>
            ) : null}
            <Button
              type="text"
              onClick={() => window.open('https://laifa.xin/ggsskh')}
              style={{ marginLeft: 24 }}
            >
              <InfoCircleOutlined /> 语法说明
            </Button>
            {state.keyword ? (
              <Button type="text" onClick={onClickGoogleUrl} style={{ marginLeft: 24 }}>
                <GoogleOutlined /> Google
              </Button>
            ) : null}
          </div>
        </Card>
      </div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {state.hasSearch ? (
          <Card
            style={{
              marginTop: 12,
              width: 860,
              justifyContent: 'left',
              alignItems: 'left',
            }}
            title={
              <span>
                在全球网络中约找到 <a>{state.dataTotal}</a> 家企业
              </span>
            }
            bodyStyle={{ padding: 0 }}
            extra={
              <Button onClick={() => onClickCreateTask()} type="primary">
                创建任务
              </Button>
            }
            loading={searchLoading}
          >
            <ProList<{ title: string }>
              itemLayout="vertical"
              rowKey="orgId"
              dataSource={state.dataList}
              metas={{
                title: { render: (_: any, record: any) => renderListTitle(record) },
                actions: { render: (_: any, record: any) => renderListActions(record) },
                description: { render: (_: any, record: any) => renderListDescription(record) },
                content: { render: (_: any, record: any) => renderListContent(record) },
              }}
              onItem={(record: any) => {
                return {
                  onClick: () => onListRownClick(record),
                };
              }}
              split
            />
            {state.dataCount ? (
              <div style={{ width: '100%', textAlign: 'center' }}>
                <Divider />
                <Pagination
                  current={state.dataPage}
                  total={state.dataCount}
                  onChange={onPageChange}
                  showSizeChanger={false}
                />
                <Alert
                  message="当前页面最多显示前 100 条数据，更多数据请创建任务"
                  type="info"
                  showIcon
                  action={
                    <Button onClick={() => onClickCreateTask()} size="small" type="primary">
                      创建任务
                    </Button>
                  }
                  style={{ marginTop: 12 }}
                />
              </div>
            ) : null}
          </Card>
        ) : (
          <Introduce title="将全球网络中为您搜索以下数据" />

        )}
      </div>
      <TaskCreate
        visible={state.createVisible}
        onCancel={() => setState({ createVisible: false })}
        initValues={{
          type: 'keyword',
          platform: state.platform,
          language: state.language,
          keyword: state.keyword,
          country: state.country,
          optimize: state.optimize,
        }}
        actionReload={() => onTaskCreateSuccess()}
      />
      <GoogleInputModal
        visible={state.seniorVisible}
        onCancel={() => setState({ seniorVisible: false })}
        keyword={state.keyword}
        actionReload={(values) => onSearchAction(values)}
      />
      <CompanyDetails
        domain={state.domain}
        visible={state.companyVisible}
        onCancel={() => setState({ companyVisible: false })}
      />
    </RightContainer>
  );
};

export default Search;
