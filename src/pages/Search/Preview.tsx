import React from 'react';
import {
  Button,
  Card,
  Col,
  Divider,
  Input,
  Pagination,
  Row,
  Select,
  Space,
  Spin,
  Switch,
  Tag,
  Tooltip,
} from 'antd';
import RightContainer from '@/components/Global/RightContainer';
import {
  GoogleOutlined,
  InfoCircleOutlined,
  LinkedinOutlined,
  QuestionCircleOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { useSetState } from 'ahooks';
import { apiPreviewCompanies } from '@/services/search';
import { useRequest, history } from '@umijs/max';
import { displayKeywordColor, isIncludeGoogleParams } from '@/utils/common';
import PreviewDomainDetails from '@/components/Search/PreviewDomainDetails';
import PreviewOrgDetails from '@/components/Search/PreviewOrgDetails';
import TaskCreate from './components/TaskCreate';
// import PaySearch from '@/components/Payment/PaySearch';
// import PayQrocde from '@/components/Payment/PayQrcode';
import GoogleInputModal from '@/components/Search/GoogleInputModal';
import { getSearchGrammar, optimizeGrammar } from '@/utils/search';

export const LanguagesData = [
  { name: '英文', value: 'EN' },
  { name: '中文', value: 'CN', disable: true },
  { name: '法文', value: 'FR', disable: true },
];

// const examples = [
//   { title: 'led lighting', description: '网页中包含led lighting(模糊匹配)', platform: 'google' },
//   {
//     title: '"led lighting"',
//     description: '网页中包含led lighting(严格匹配)',
//     platform: 'google',
//   },
//   {
//     title: 'led AND lighting',
//     description: '网页中包含led和lighting(可设置多个)',
//     platform: 'google',
//   },
//   {
//     title: 'led OR lighting',
//     description: '网页中包含led或lighting(可设置多个)',
//     platform: 'google',
//   },
//   {
//     title: 'intitle:led lighting',
//     description: '网页标题中包含led lighting(模糊匹配)',
//     platform: 'google',
//   },
//   {
//     title: 'intitle:"led lighting"',
//     description: '网页标题中包含led lighting(严格匹配)',
//     platform: 'google',
//   },
//   {
//     title: 'intext:led lighting',
//     description: '网页中包含led lighting(模糊匹配)',
//     platform: 'google',
//   },
//   {
//     title: 'intext:"led lighting"',
//     description: '网页中包含led lighting(严格匹配)',
//     platform: 'google',
//   },
//   {
//     title: 'intitle:led intext:lighting',
//     description: '网页标题中包含led且网页中包含lighting',
//     platform: 'google',
//   },
// ];

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
    infoId: '',
    infoPlatform: '',
    infoUrl: '',
    infoVisible: false,
    createVisible: false,
    app: 'wechat',
    codeUrl: 'https://laifaxin.com',
    id: '',
    paySearchVisible: false,
    qrcodeVisible: false,
    seniorVisible: false,
    domainPreviewVisible: false,
    keyword: '',
    description: '',
    searchValues: {},
    optimize: true,
    realGrammar: '',
    dataPage: 1,
    dataCount: 0,
  });

  const onClickGoogleUrl = () => {
    const { keyword, platform, language, optimize } = state;
    const realGrammar = optimizeGrammar(platform, keyword, optimize);
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
      setState({ dataList: list, dataTotal: total, dataPage: page, dataCount: count });
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
    await searchRun({ keyword: realGrammar, country, language, platform, page: 1 });
    setState({ hasSearch: true, dataKeyword: keyword, keyword });
  };

  const onPlatformChange = (value: string) => {
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

  // const onClickSearchShow = async (item: any) => {
  //   const { title: keyword, platform } = item;
  //   const { country, language } = state;
  //   await searchRun({ keyword, country, language, platform });
  //   setState({ hasSearch: true, dataKeyword: keyword, keyword, platform });
  // };

  const selectBefore = (
    <Select value={state.platform} onChange={(val) => onPlatformChange(val)}>
      <Select.Option value="google">
        <GoogleOutlined /> Google
      </Select.Option>
      <Select.Option value="linkedin">
        <LinkedinOutlined /> LinkedIn
      </Select.Option>
      <Select.Option value="zoominfo">
        <span style={{ fontSize: 16, fontWeight: 500 }}>🅉</span> Zoominfo
      </Select.Option>
    </Select>
  );

  const onTitleClick = (platform: string, id: string, item: any) => {
    const { link } = item;
    if (platform === 'google') {
      setState({ infoPlatform: platform, infoUrl: link, domainPreviewVisible: true });
    } else {
      setState({ infoPlatform: platform, infoId: id, infoVisible: true });
    }
    const { dataList } = state;
    const index = dataList.findIndex((o: any) => o.link === link);
    if (index >= 0) {
      dataList[index] = { ...dataList[index], hasClicked: true };
      setState({ dataList });
    }
  };

  const onClickCreateTask = () => {
    const { keyword, platform, optimize } = state;
    const realGrammar = optimizeGrammar(platform, keyword, optimize);
    setState({ createVisible: true, realGrammar });
  };

  const onTaskCreateSuccess = () => {
    history.push('/search/tasks');
  };

  // const renderSearchSuffix = () => {
  //   return (
  //     <a onClick={() => setState({ seniorVisible: true })}>
  //       <FilterOutlined
  //         style={{
  //           fontSize: 16,
  //           color: '#1890ff',
  //         }}
  //       />
  //       高级
  //     </a>
  //   );
  // };

  // const onApplyKeywords = (value: string) => {
  //   setState({ keyword: value });
  //   onSearch(true, value);
  // };

  const onSearchAction = (values: any) => {
    const { searchValues } = values;
    const { grammar, description } = getSearchGrammar(searchValues);
    setState({ keyword: grammar, description, searchValues });
    onSearch(true, grammar);
  };

  const renderSocial = (item: any) => {
    if (!item) return null;
    const { link } = item;
    if (!link) {
      return null;
    }

    if (link.indexOf('linkedin') >= 0) {
      return (
        <a target="_blank" rel="noopener noreferrer" href={link}>
          <h3>
            <LinkedinOutlined />
          </h3>
        </a>
      );
    }
    if (link.indexOf('zoominfo') >= 0) {
      return (
        <a target="_blank" rel="noopener noreferrer" href={link}>
          <h3>🅉</h3>
        </a>
      );
    }
    return (
      <a target="_blank" rel="noopener noreferrer" href={link}>
        <h3>
          <GoogleOutlined />
        </h3>
      </a>
    );
  };

  const renderInfoPlatform = (item: any) => {
    const { link } = item;
    let { platform } = state;
    if (link.indexOf('linkedin') >= 0) {
      platform = 'linkedin';
    }
    if (link.indexOf('zoominfo') >= 0) {
      platform = 'zoominfo';
    }
    return platform;
  };

  // const renderGoogleMessage = () => {
  //   const { platform, keyword } = state;
  //   if (platform === 'google') {
  //     return `${keyword}`;
  //   }
  //   if (platform === 'linkedin') {
  //     return `site:linkedin.com/company ${keyword}`;
  //   }
  //   if (platform === 'zoominfo') {
  //     return `site:zoominfo.com/c ${keyword}`;
  //   }
  //   return `无`;
  // };

  // const renderAvatar = (item: any) => {
  //   const { platform } = item;
  //   if (platform === 'google') {
  //     return <GoogleOutlined style={{ fontSize: 24 }} />;
  //   }
  //   return '';
  // };

  // const exampleContent = (
  //   <div style={{ minWidth: 476, maxHeight: 400, overflow: 'auto' }}>
  //     <List
  //       itemLayout="horizontal"
  //       dataSource={examples}
  //       renderItem={(item) => (
  //         <List.Item
  //           actions={[
  //             <Button
  //               type="link"
  //               key="searchTest"
  //               loading={searchLoading}
  //               onClick={() => onClickSearchShow(item)}
  //             >
  //               搜索看看
  //             </Button>,
  //           ]}
  //           key={item.title}
  //         >
  //           <List.Item.Meta
  //             avatar={renderAvatar(item)}
  //             title={item.title}
  //             description={item.description}
  //           />
  //         </List.Item>
  //       )}
  //     />
  //   </div>
  // );

  return (
    <RightContainer pageTitle={false} pageGroup="search" pageActive="preview">
      <Card style={{ minHeight: 600 }}>
        <Row>
          <Col
            xs={{ span: 24, offset: 0 }}
            sm={{ span: 24, offset: 0 }}
            md={{ span: 20, offset: 2 }}
            lg={{ span: 16, offset: 4 }}
            xl={{ span: 12, offset: 6 }}
          >
            <Input.Search
              addonBefore={selectBefore}
              placeholder="请输入客户特征词（客户提供的产品/服务相关词）"
              style={{ width: '100%', paddingTop: 12, borderRadius: '42px' }}
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
            {state.description ? (
              <>
                <Divider style={{ marginTop: 12, marginBottom: 12 }} />
                <div>
                  搜索条件：<Tag>{state.description}</Tag>
                </div>
              </>
            ) : null}
            <div style={{ maxWidth: 800, overflow: 'auto' }} hidden={!state.hasSearch}>
              <Divider style={{ marginTop: 12, marginBottom: 12 }} />
              <Spin spinning={searchLoading} tip="数据搜索中...">
                <div style={{ marginTop: 12 }}>
                  约找到 <b>{state.dataTotal}</b> 家企业{' '}
                  <span style={{ color: '#70757a' }}>
                    {' '}
                    最多显示前100条数据，更多数据请用任务方式
                  </span>{' '}
                  <a onClick={() => onClickCreateTask()}>立即创建</a>
                </div>
                {state.dataList?.map((item: any) => {
                  const { link, title, description, hasClicked } = item;
                  if (!link) {
                    return null;
                  }
                  const reg = new RegExp('/company/[^ /?]*');
                  const ids = link.match(reg);
                  let id: string;
                  if (ids && ids.length) {
                    id = ids[0].split('/')[2];
                  } else {
                    const links = link.split('/');
                    id = links[links.length - 1].split('?')[0];
                  }
                  const platform = renderInfoPlatform(item);
                  // const url = renderPlatformUrl(state.platform, id, link);
                  if (!title) {
                    return null;
                  }
                  return (
                    <div key={`${link}`} style={{ marginTop: 24 }}>
                      <div>
                        <Space>
                          {renderSocial(item)}
                          <a onClick={() => onTitleClick(platform, id, item)}>
                            <h3
                              style={
                                hasClicked
                                  ? { color: '#70757a', borderBottom: '1px solid grey' }
                                  : { color: '#1a0dab', borderBottom: '1px solid blue' }
                              }
                            >
                              {title}
                            </h3>
                          </a>
                        </Space>
                      </div>
                      <div
                        style={hasClicked ? { fontSize: 14, color: '#70757a' } : { fontSize: 14 }}
                        dangerouslySetInnerHTML={{
                          __html: displayKeywordColor(description, state.dataKeyword),
                        }}
                      />
                    </div>
                  );
                })}
              </Spin>
            </div>
            {state.dataCount ? (
              <div style={{ width: '100%', textAlign: 'center', marginTop: 24 }}>
                <Pagination
                  current={state.dataPage}
                  total={state.dataCount}
                  onChange={onPageChange}
                  showSizeChanger={false}
                />
              </div>
            ) : null}
          </Col>
        </Row>
      </Card>
      <PreviewOrgDetails
        visible={state.infoVisible}
        onCancel={() => setState({ infoVisible: false })}
        language={state.language}
        platform={state.infoPlatform}
        id={state.infoId}
      />
      <PreviewDomainDetails
        visible={state.domainPreviewVisible}
        onCancel={() => setState({ domainPreviewVisible: false })}
        url={state.infoUrl}
      />
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
    </RightContainer>
  );
};

export default Search;
