import React, { useEffect } from 'react';
import {
  Modal,
  Button,
  Input,
  Form,
  Select,
  message,
  Radio,
  Row,
  Col,
  Space,
  Checkbox,
  Typography,
  Tag,
  Popover,
  Alert,
  Tooltip,
  Switch,
} from 'antd';
import { CountriesData } from '@/config/countries';
import {
  FilterOutlined,
  GoogleOutlined,
  LinkedinOutlined,
  SyncOutlined,
  LoadingOutlined,
  ShoppingCartOutlined,
  QuestionCircleOutlined,
} from '@ant-design/icons';
import {
  apiSearchTasksCreate,
  apiPreviewTotayCount,
  apiTaskConfigShow,
  apiCountryCityCount,
} from '@/services/search';
import { useModel, useRequest } from '@umijs/max';
import { useSetState } from 'ahooks';
import { getDomainsFromString, getNamesFromString } from '@/utils/common';
import PaySearch from '@/components/Payment/PaySearch';
import PayQrocde from '@/components/Payment/PayQrcode';
import TaskCreateHistory from './TaskCreateHistory';
import GoogleInputModal from '@/components/Search/GoogleInputModal';
import { getSearchGrammar, optimizeGrammar } from '@/utils/search';
interface FormProps {
  visible: boolean;
  onCancel: () => void;
  initValues: any;
  actionReload: () => void;
}

const CreateTask: React.FC<FormProps> = (props) => {
  const { visible, onCancel, initValues, actionReload } = props;
  const [state, setState] = useSetState<Record<string, any>>({
    taskType: 'keyword',
    domainCount: 0,
    nameCount: 0,
    countLoading: false,
    searchCount: 0,
    searchTotal: 0,
    citySelect: false,
    country: '',
    cityCount: 0,
    cityList: [],
    keyword: '',
    app: 'wechat',
    codeUrl: 'https://laifaxin.com',
    id: '',
    paySearchVisible: false,
    qrcodeVisible: false,
    hisId: '',
    hisVisible: false,
    optimize: true,
    platform: 'google',
  });
  const [form] = Form.useForm();

  const { initialState } = useModel('@@initialState');

  const openQrcode = (id: string, app: string, codeUrl: string) => {
    setState({ id, app, codeUrl, qrcodeVisible: true });
  };

  const {
    run: packageRun,
    refresh: countRefresh,
    loading: countLoading,
  } = useRequest(apiPreviewTotayCount, {
    manual: true,
    onSuccess: (data: any) => {
      if (!data) return;
      const { searchCount, searchTotal } = data;
      if (searchTotal >= 100) {
        setState({ citySelect: true });
        form.setFieldsValue({ cities: ['all'] });
      } else {
        form.setFieldsValue({ cities: [] });
        setState({ citySelect: false });
      }
      setState({ searchCount, searchTotal });
    },
  });

  const { run: countryCountRun } = useRequest(apiCountryCityCount, {
    manual: true,
    onSuccess: (data: any) => {
      if (!data) return;
      const { count, list } = data;
      setState({ cityCount: count, cityList: list });
    },
  });

  const { run: configRun } = useRequest(apiTaskConfigShow, {
    manual: true,
    onSuccess: (data: any) => {
      if (!data) return;
      if (data) {
        const { _id, config } = data;
        if (_id) {
          form.setFieldsValue(config);
          const { country, type } = config;
          setState({ taskType: type });
          countryCountRun({ country });
        }
      }
    },
  });

  const onCountryChange = (value: string) => {
    setState({ country: value });
    countryCountRun({ country: value });
  };

  const onFinish = () => {};

  useEffect(() => {
    if (form && visible) {
      setState({ taskType: 'keyword' });
      packageRun();
      form.resetFields();
      if (initValues && Object.keys(initValues).length) {
        const { type, keyword, optimize, platform } = initValues;
        if (type) {
          setState({ taskType: type, optimize, platform });
          if (keyword && type !== 'keyword') {
            const domainCount = keyword.split('/n').length;
            const nameCount = keyword.split('/n').length;
            setState({ nameCount, domainCount });
          }
        }
        form.setFieldsValue({ ...initValues });
      } else {
        configRun();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const { run: createRun, loading: createLoading } = useRequest(apiSearchTasksCreate, {
    manual: true,
    onSuccess: () => {
      message.success('创建任务成功');
      actionReload();
      onCancel();
    },
  });

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const { name, type, platform, country, cities, notCountryCodes, keyword } = values;
      if (type === 'keyword') {
        if (!keyword.trim() || keyword.trim().length < 2) {
          message.error('关键词至少需要2个字符');
          return;
        }
        const { optimize } = state;
        const realGrammar = optimizeGrammar(platform, keyword.trim(), optimize);
        createRun({
          name,
          type,
          language: 'EN',
          platform,
          country,
          cities,
          notCountryCodes,
          keyword: realGrammar,
        });
      } else if (type === 'domain') {
        createRun({ name, type, language: 'EN', keyword });
      } else if (type === 'name') {
        createRun({ name, type, language: 'EN', keyword });
      }
    } catch (errorInfo) {
      console.log('Failed:', errorInfo);
    }
  };

  const footer = () => {
    return (
      <div
        style={{
          textAlign: 'center',
        }}
      >
        <Button style={{ marginRight: 16 }} onClick={() => onCancel()}>
          取消
        </Button>
        <Button type="primary" onClick={() => handleSubmit()} loading={createLoading}>
          提交
        </Button>
      </div>
    );
  };

  const onFormValuesChange = (changedValues: any, allValues: any) => {
    const { type, keyword } = changedValues;
    if (type) {
      setState({ taskType: type });
    }
    if (keyword) {
      const { type: currentType } = allValues;
      if (currentType === 'keyword') {
        setState({ keyword });
      }
    }
  };

  const onDomainTextBlur = (value: string) => {
    setState({ countLoading: true, domainCount: 0 });
    const domains = getDomainsFromString(value);
    form.setFieldsValue({ keyword: domains.join('\n') });
    setState({ domainCount: domains.length, countLoading: false });
  };

  const onNamesTextBlur = (value: string) => {
    setState({ countLoading: true, nameCount: 0 });
    const names = getNamesFromString(value);
    form.setFieldsValue({ keyword: names.join('\n') });
    setState({ nameCount: names.length, countLoading: false });
  };

  const countDomains = () => {
    const value = form.getFieldValue('domainText');
    if (!value) {
      message.error('请输入域名相关内容');
      return;
    }
    setState({ countLoading: true, domainCount: 0 });
    const domains = getDomainsFromString(value);
    form.setFieldsValue({ keyword: domains.join('\n') });
    setState({ domainCount: domains.length, countLoading: false });
  };

  const countNames = () => {
    const value = form.getFieldValue('nameText');
    if (!value) {
      message.error('请输入公司名称相关内容');
      return;
    }
    setState({ countLoading: true, nameCount: 0 });
    const names = getNamesFromString(value);
    form.setFieldsValue({ keyword: names.join('\n') });
    setState({ nameCount: names.length, countLoading: false });
  };

  const renderCityTitle = () => {
    const { cityList } = state;
    if (cityList && cityList.length) {
      return cityList?.map((item: any) => <Tag key={item.city}>{item.city}</Tag>);
    }
    return <span>更多城市正在收集中，详情请联系客服</span>;
  };

  const renderSearchSuffix = () => {
    return (
      <a onClick={() => setState({ seniorVisible: true })}>
        <FilterOutlined
          style={{
            fontSize: 16,
            color: '#1890ff',
          }}
        />
        高级
      </a>
    );
  };

  const onApplyKeywords = (values: any) => {
    const { searchValues } = values;
    const { grammar } = getSearchGrammar(searchValues);
    form.setFieldsValue({ keyword: grammar });
  };

  const renderKeywordFormItem = () => {
    const { taskType } = state;
    if (taskType === 'domain') {
      return (
        <Row>
          <Col span={12}>
            <Form.Item
              label={
                <Space>
                  <span style={{ fontWeight: 'bold' }}>文本内容</span>
                  <Button
                    size="small"
                    type="link"
                    onClick={() => countDomains()}
                    loading={state.countLoading}
                  >
                    域名识别
                  </Button>
                </Space>
              }
              name="domainText"
              rules={[{ message: '请输入域名文本内容，自动识别' }]}
            >
              <Input.TextArea
                placeholder="请输入域名文本内容，自动识别"
                rows={10}
                onBlur={(e) => onDomainTextBlur(e.target.value)}
                style={{ width: '100%' }}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label={
                <div>
                  <Space>
                    <span style={{ fontWeight: 'bold' }}>域名列表</span>
                    <span>
                      有效域名总数：<a>{state.domainCount}</a>
                    </span>
                  </Space>
                </div>
              }
              name="keyword"
              rules={[{ required: true, message: '请输入有效域名' }]}
            >
              <Input.TextArea
                placeholder="请输入域名"
                disabled
                rows={10}
                style={{ width: '100%' }}
              />
            </Form.Item>
          </Col>
        </Row>
      );
    }
    if (taskType === 'name') {
      return (
        <Row>
          <Col span={12}>
            <Form.Item
              label={
                <Space>
                  <span style={{ fontWeight: 'bold' }}>文本内容</span>
                  <Button
                    size="small"
                    type="link"
                    onClick={() => countNames()}
                    loading={state.countLoading}
                  >
                    名称识别
                  </Button>
                </Space>
              }
              name="nameText"
              rules={[{ message: '请输入名称文本内容，自动识别' }]}
            >
              <Input.TextArea
                placeholder="请输入公司名文本内容，自动识别，每行一个"
                rows={10}
                onBlur={(e) => onNamesTextBlur(e.target.value)}
                style={{ width: '100%' }}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label={
                <div>
                  <Space size="large">
                    <span style={{ fontWeight: 'bold' }}>公司名称列表</span>
                    <span>
                      有效名称总数：<a>{state.nameCount}</a>
                    </span>
                  </Space>
                </div>
              }
              name="keyword"
              rules={[{ required: true, message: '请输入有效公司名' }]}
            >
              <Input.TextArea
                placeholder="请输入公司名"
                disabled
                rows={10}
                style={{ width: '100%' }}
              />
            </Form.Item>
          </Col>
        </Row>
      );
    }
    return (
      <Form.Item
        label={
          <div>
            <span style={{ fontWeight: 'bold' }}>关键词</span>
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
          </div>
        }
        name="keyword"
        rules={[{ required: true, message: '请输入关键词' }]}
      >
        <Input
          placeholder="请输入客户特征词（客户提供的产品/服务相关词）"
          suffix={renderSearchSuffix()}
        />
      </Form.Item>
    );
  };

  return (
    <Modal
      destroyOnClose
      width={720}
      title={
        <div>
          搜索任务创建{' '}
          {/* <a
            style={{ marginLeft: 12, fontSize: 12 }}
            onClick={() => setState({ hisVisible: true })}
          >
            历史纪录
          </a> */}
        </div>
      }
      open={visible}
      onCancel={() => onCancel()}
      footer={footer()}
      bodyStyle={{ paddingTop: 0, paddingBottom: 0 }}
    >
      <Alert
        message={
          <div>
            每个任务消耗 <a>1</a> 点，剩余点数:{' '}
            <a> {countLoading ? <LoadingOutlined /> : state.searchCount} </a>{' '}
            {countLoading ? null : <SyncOutlined onClick={() => countRefresh()} />}
          </div>
        }
        action={
          <a href="/expenses/purchase?type=searchMonth" target="blank" style={{ marginRight: 12 }}>
            <ShoppingCartOutlined /> 购买
          </a>
        }
        type="warning"
        showIcon
        style={{ marginBottom: 12 }}
      />
      <Form
        name="basic"
        onFinish={onFinish}
        form={form}
        layout="vertical"
        onValuesChange={onFormValuesChange}
      >
        <Form.Item
          label={
            <div>
              <span style={{ fontWeight: 'bold' }}>搜索方式</span>
            </div>
          }
          name="type"
          rules={[{ required: true, message: '请选择搜索方式' }]}
        >
          <Radio.Group style={{ width: '100%' }}>
            <Row>
              <Col span={6}>
                <Radio value="keyword">关键词</Radio>
              </Col>
              <Col span={6}>
                <Radio value="domain">域名</Radio>
              </Col>
              <Col span={6}>
                <Radio value="name">公司名</Radio>
              </Col>
            </Row>
          </Radio.Group>
        </Form.Item>
        {/* <Form.Item
          label="搜索语言"
          name="language"
          rules={[{ required: true, message: '请选择语言' }]}
        >
          <Select optionLabelProp="label" placeholder="选择语言">
            {LanguagesData?.map((item: any) => (
              <Select.Option
                value={item.value}
                key={item.value}
                disabled={item.disable}
                label={`${item.name} (${item.value})`}
              >
                {item.name} ({item.value})
              </Select.Option>
            ))}
          </Select>
        </Form.Item> */}
        {state.taskType === 'keyword' ? (
          <Form.Item
            label={
              <div>
                <span style={{ fontWeight: 'bold' }}>搜索来源</span>
                <span style={{ color: '#999', fontSize: 12 }}> 更多数据来源正在开发中</span>
              </div>
            }
            name="platform"
            rules={[{ required: true, message: '请选择搜索来源' }]}
          >
            <Radio.Group
              style={{ width: '100%' }}
              onChange={(e) => setState({ platform: e.target.value })}
            >
              <Row>
                <Col span={6}>
                  <Radio value="google">
                    <GoogleOutlined /> Google
                  </Radio>
                </Col>
                <Col span={6}>
                  <Radio value="linkedin">
                    <LinkedinOutlined /> LinkedIn
                  </Radio>
                </Col>
                <Col span={6}>
                  <Radio value="zoominfo">
                    <span style={{ fontSize: 16, fontWeight: 500 }}>🅉</span> Zoominfo
                  </Radio>
                </Col>
              </Row>
            </Radio.Group>
          </Form.Item>
        ) : null}
        {state.taskType === 'keyword' ? (
          <Form.Item
            label={
              <div>
                <span style={{ fontWeight: 'bold' }}>搜索国家</span>
                {initialState?.currentUser?.isOrg ? (
                  <span style={{ color: '#999', fontSize: 12 }}>
                    {' '}
                    企业版专属功能：可多选，支持中英文，多个使用分号 ; 分隔符
                  </span>
                ) : null}
              </div>
            }
            name="country"
            rules={[{ required: true, message: '请选择国家' }]}
          >
            <Select
              mode={initialState?.currentUser?.isOrg ? 'tags' : undefined}
              showSearch
              optionLabelProp="label"
              optionFilterProp="label"
              placeholder="选择国家"
              onChange={(val) => onCountryChange(val)}
              tokenSeparators={[';']}
              allowClear
            >
              <Select.Option value="Global" key="Global" label={`不限国家`}>
                不限国家 (Global)
              </Select.Option>
              {CountriesData?.map((item: any) => (
                <Select.Option value={item.en} key={item.en} label={`${item.cn} (${item.en})`}>
                  {item.cn} ({item.en})
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        ) : null}
        {state.taskType === 'keyword' && state.country !== 'Global' ? (
          <Form.Item
            label={
              <div>
                <span style={{ fontWeight: 'bold' }}>搜索城市</span>
                <span style={{ color: '#999', fontSize: 12 }}>
                  {' '}
                  获客入门版可勾选所有城市，可获得更多数据
                </span>
              </div>
            }
          >
            <Space>
              <Form.Item name="cities" noStyle>
                <Checkbox.Group style={{ width: 160, marginLeft: 12 }}>
                  <Checkbox value="all" disabled={!state.citySelect}>
                    所有城市
                  </Checkbox>
                  {!state.citySelect ? (
                    <a onClick={() => setState({ paySearchVisible: true })}>立即升级</a>
                  ) : null}
                </Checkbox.Group>
              </Form.Item>
              <Popover content={renderCityTitle()} title={false}>
                <Typography.Link>已发现城市数：{state.cityCount}</Typography.Link>
              </Popover>
            </Space>
          </Form.Item>
        ) : null}
        {state.taskType === 'keyword' ? (
          <Form.Item
            label={
              <div>
                <span style={{ fontWeight: 'bold' }}>排除国家</span>
                <span style={{ color: '#999', fontSize: 12 }}> 排除的国家结果不会保存,可多选</span>
              </div>
            }
            name="notCountryCodes"
          >
            <Select
              showSearch
              optionLabelProp="label"
              optionFilterProp="label"
              placeholder="选择国家"
              mode="multiple"
              allowClear
            >
              {CountriesData?.map((item: any) => (
                <Select.Option value={item.abb2} key={item.en} label={`${item.cn}`}>
                  {item.cn} ({item.en})
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        ) : null}
        {renderKeywordFormItem()}
        <Form.Item
          label={
            <div>
              <span style={{ fontWeight: 'bold' }}>任务名称</span>
              <span style={{ color: '#999', fontSize: 12 }}> 选填选项</span>
            </div>
          }
          name="name"
        >
          <Input placeholder="请输入任务名称或备注" />
        </Form.Item>
      </Form>
      {state.searchCount > 0 ? null : (
        <Alert
          style={{ marginBottom: 12 }}
          message={
            <div>
              您的获客点数不足，
              <a onClick={() => setState({ paySearchVisible: true })}>立即购买</a>
            </div>
          }
          type="error"
          showIcon
          closable
        />
      )}
      {/* <GoogleInput
        visible={state.seniorVisible}
        onCancel={() => setState({ seniorVisible: false })}
        keyword={state.keyword}
        actionReload={(value) => onApplyKeywords(value)}
      /> */}
      <GoogleInputModal
        visible={state.seniorVisible}
        onCancel={() => setState({ seniorVisible: false })}
        keyword={state.keyword}
        actionReload={(values) => onApplyKeywords(values)}
        from="task"
      />
      <PaySearch
        visible={state.paySearchVisible}
        onCancel={() => setState({ paySearchVisible: false })}
        openQrcode={(id, app, url) => openQrcode(id, app, url)}
        actionReload={() => countRefresh()}
      />
      <PayQrocde
        visible={state.qrcodeVisible}
        codeUrl={state.codeUrl}
        app={state.app}
        id={state.id}
        onCancel={() => setState({ qrcodeVisible: false })}
        actionReload={() => countRefresh()}
      />
      <TaskCreateHistory
        visible={state.hisVisible}
        onCancel={() => setState({ hisVisible: false })}
        hisId={state.hisId}
        actionReload={() => {}}
      />
    </Modal>
  );
};

export default CreateTask;
