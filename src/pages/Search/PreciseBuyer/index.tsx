import React, { useEffect } from 'react';
import {
  Avatar,
  Button,
  Card,
  Divider,
  message,
  Pagination,
  Space,
  Switch,
  Tag,
  Tooltip,
  Alert,
  Row,
  Form,
  Col,
  Checkbox,
  Select,
} from 'antd';
import RightContainer from '@/components/Global/RightContainer';
import {
  GlobalOutlined,
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
import { useRequest, history, } from '@umijs/max';
import { isIncludeGoogleParams } from '@/utils/common';
import TaskCreate from '../components/TaskCreate';
import { exPreciseBuyerGrammar, optimizeGrammar } from '@/utils/search';
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
import KeywordsSetting from '@/components/Search/components/KeywordsSetting';
import { apiCustomOptionsAdd, apiCustomOptionsList } from '@/services/option';
import IndustrySelectModal from '@/components/Search/components/IndustrySelectModal';
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

const PreciseBuyer: React.FC = () => {
  const [form] = Form.useForm();
  const [state, setState] = useSetState<Record<string, any>>({
    country: 'Global',
    gl: 'us',
    language: 'EN',
    platform: 'linkedin',
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
    categoryOptions: [],
    industryOptions: [],
    industrySelectVisible: false,
  });

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

  const { run: listRun } = useRequest(apiCustomOptionsList, {
    manual: true,
    onSuccess: (data: any) => {
      if (!data) return;
      const { type, values } = data;
      const options = values.map((word: string) => {
        return { value: word, label: word };
      });
      if (type === 'categoryKeywords') {
        setState({ categoryOptions: options });
      } else if (type === 'industryKeywords') {
        setState({ industryOptions: options });
      }
    },
  });

  const { run: addKeywordRun } = useRequest(apiCustomOptionsAdd, { manual: true });

  const getKeywordOptions = async () => {
    await listRun({ type: 'categoryKeywords' });
    await listRun({ type: 'industryKeywords' });
  };

  useEffect(() => {
    getKeywordOptions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    await searchRun({ keyword: realGrammar, country, language, platform, page: 1 });
    setState({ hasSearch: true, dataKeyword: keyword, keyword });
  };

  const onPlatformChange = (value: any) => {
    setState({ platform: value });
    const { hasSearch, keyword, language, country, optimize } = state;
    const realGrammar = optimizeGrammar(value, keyword, optimize);
    if (hasSearch) {
      searchRun({ keyword: realGrammar, country, language, platform: value, page: 1 });
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

  const saveKeywords = async (values: any) => {
    const { categoryKeywords, industryKeywords } = values;
    if (categoryKeywords && categoryKeywords.length) {
      await addKeywordRun({ type: 'categoryKeywords', values: categoryKeywords });
      await listRun({ type: 'categoryKeywords' });
    }
    if (industryKeywords && industryKeywords.length) {
      await addKeywordRun({ type: 'industryKeywords', values: industryKeywords });
      await listRun({ type: 'industryKeywords' });
    }
  };

  const onSearchAction = async () => {
    const values = form.getFieldsValue();
    const grammar = exPreciseBuyerGrammar(values);
    await onSearch(true, grammar);
    saveKeywords(values);
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
    const linkedin = linkedin_url ? <LinkedInIcon style={{ width: 14, height: 14 }} /> : null;
    const fackbook = facebook_url ? <FackbookIcon style={{ width: 14, height: 14 }} /> : null;
    const twitter = twitter_url ? <TwitterIcon style={{ width: 14, height: 14 }} /> : null;
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

  const importOptions = [
    { label: '品牌商', value: 'brand' },
    { label: '分销商', value: 'distributor' },
    { label: '批发商', value: 'wholesaler' },
    { label: '零售商', value: 'retailer' },
    { label: '承包商', value: 'contractor' },
    { label: '设计商', value: 'design' },
    { label: '链锁商超', value: 'suppermarket' },
    { label: '生产制造商', value: 'manufacturer' },
    { label: '解决方案提供商', value: 'solution' },
  ];

  const onFormValuesChange = (changedValues: any) => {
    const { importTypes, categoryKeywords, industryKeywords } = changedValues;
    if (importTypes && importTypes.length > 3) {
      importTypes.splice(3, 1);
      form.setFieldsValue({ importTypes });
      message.error('进口商类型最多选 3 个');
      return;
    }
    if (categoryKeywords && categoryKeywords.length > 3) {
      categoryKeywords.splice(3, 1);
      form.setFieldsValue({ categoryKeywords });
      message.error('分类关键词最多 3 个');
      return;
    }
    if (industryKeywords && industryKeywords.length > 3) {
      industryKeywords.splice(3, 1);
      form.setFieldsValue({ industryKeywords });
      message.error('行业关键词最多 3 个');
      return;
    }
  };

  const onClickUseIndustry = (industry: string) => {
    form.setFieldsValue({ industryKeywords: [industry] });
    setState({ industrySelectVisible: false });
  };
  const cardSDelay = yieldDelayCss({ max: 6 })
  return (
    <RightContainer pageTitle={false} pageGroup="search" pageActive="preview">
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Card
          style={{ width: 860 }}
          title="精准买家数据"
          className='both-down'
          headStyle={{ textAlign: 'center' }}
          bodyStyle={{ paddingBottom: 0 }}
        >
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
                style: { ...checkCardStyle, animationDelay: cardSDelay.next().value }
              },
              {
                title: "LinkedIn",
                avatar: <Avatar src={<LinkedInIcon />} shape="square" />,
                value: "linkedin",
                style: { ...checkCardStyle, animationDelay: cardSDelay.next().value }
              },
              {
                title: "Zoominfo",
                avatar: <Avatar src={<ZoominfoIcon />} shape="square" />,
                value: "zoominfo",
                style: { ...checkCardStyle, animationDelay: cardSDelay.next().value }
              },
              {
                title: "facebook",
                avatar: <Avatar src={<FackbookIcon />} shape="square" />,
                value: "facebook",
                style: { ...checkCardStyle, animationDelay: cardSDelay.next().value },
                disabled: true,
              },
              {
                title: "twitter",
                avatar: <Avatar src={<TwitterIcon />} shape="square" />,
                value: "twitter",
                style: { ...checkCardStyle, animationDelay: cardSDelay.next().value },
                disabled: true,
              }
            ]}
          />
          <Form
            name="advanced_search"
            form={form}
            onValuesChange={onFormValuesChange}
            initialValues={{ importTypes: ['brand', 'distributor', 'wholesaler'] }}
          >
            <Row gutter={24}>
              <Col span={12}>
                <Form.Item name="categoryKeywords" label="分类关键词">
                  <Select
                    options={state.categoryOptions}
                    mode="tags"
                    style={{ width: '100%' }}
                    placeholder="输入后按回车可直接创建(可多个)"
                    allowClear
                    notFoundContent={<div>历史数据为空</div>}
                    dropdownRender={(menu) => (
                      <div>
                        {menu} <Divider style={{ margin: 0 }} />
                        <div style={{ height: 28, paddingTop: 8, paddingLeft: 12 }}>
                          <a
                            onClick={() =>
                              setState({ settingVisible: true, settingType: 'categoryKeywords' })
                            }
                          >
                            <SettingOutlined /> 设置常用关键词
                          </a>
                        </div>
                      </div>
                    )}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="industryKeywords" label="行业关键词">
                  <Select
                    options={state.industryOptions}
                    mode="tags"
                    style={{ width: '100%' }}
                    placeholder="输入后按回车可直接创建(可多个)"
                    allowClear
                    notFoundContent={<div>历史数据为空</div>}
                    dropdownRender={(menu) => (
                      <div>
                        {menu}
                        <Divider style={{ margin: 0 }} />
                        <div style={{ height: 28, paddingTop: 8, paddingLeft: 12 }}>
                          <a
                            onClick={() =>
                              setState({ settingVisible: true, settingType: 'industryKeywords' })
                            }
                          >
                            <SettingOutlined /> 设置常用关键词
                          </a>
                        </div>
                        <Divider style={{ margin: 0 }} />
                        <div style={{ height: 28, paddingTop: 8, paddingLeft: 12 }}>
                          <a onClick={() => setState({ industrySelectVisible: true })}>
                            <InfoCircleOutlined /> 常用行业分类
                          </a>
                        </div>
                      </div>
                    )}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="importTypes"
                  label={
                    <span style={{ marginRight: 4 }}>
                      <Checkbox checked style={{ marginRight: 4 }} /> 进口商
                    </span>
                  }
                >
                  <Select
                    mode="multiple"
                    options={importOptions}
                    style={{ width: '100%' }}
                    placeholder="进口商类型(可选)"
                    allowClear
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <div style={{ textAlign: 'right' }}>
                  {state.platform === 'google' ? (
                    <span>
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
                    type="primary"
                    loading={searchLoading}
                    style={{ marginLeft: 64 }}
                    onClick={onSearchAction}
                  >
                    开始搜索
                  </Button>
                </div>
              </Col>
            </Row>
          </Form>
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
                在全球网络中约找到 <a>{state.dataTotal}</a> 精准买家数据
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
          <Introduce title="将全球网络中为您搜索精准买家数据" />
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
      <CompanyDetails
        domain={state.domain}
        visible={state.companyVisible}
        onCancel={() => setState({ companyVisible: false })}
      />
      <KeywordsSetting
        visible={state.settingVisible}
        type={state.settingType}
        onCancel={() => setState({ settingVisible: false })}
        actionReload={getKeywordOptions}
      />
      <IndustrySelectModal
        visible={state.industrySelectVisible}
        onCancel={() => setState({ industrySelectVisible: false })}
        actionReload={(value) => onClickUseIndustry(value)}
      />
    </RightContainer>
  );
};

export default PreciseBuyer;
