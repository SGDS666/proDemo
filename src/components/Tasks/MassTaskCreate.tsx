import React, { useEffect } from 'react';
import {
  Button,
  Form,
  Drawer,
  message,
  Input,
  Radio,
  Select,
  Divider,
  TreeSelect,
  Space,
  Row,
  Col,
  Switch,
  InputNumber,
  Tooltip,
  Steps,
  Tag,
  Result,
  Alert,
} from 'antd';
import { apiViewsTree, apiTagsTree } from '@/services/contacts';
import {
  apiSaveMassConfig,
  apiGetMassConfig,
  apiTaskSendCount,
  apiMassTaskAdd,
} from '@/services/tasks';
import { useSetState } from 'ahooks';
import { useRequest, history, useModel } from '@umijs/max';
import {
  ClockCircleOutlined,
  LoadingOutlined,
  PlusOutlined,
  SendOutlined,
  StepBackwardOutlined,
  StepForwardOutlined,
  ToolOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import { todayDate } from '@/utils/common';
import {
  apiAccountItems,
  apiAttachmentOptions,
  apiContentTree,
  apiSenderItems,
} from '@/services/mails';
import MailAccountCreate from '../Mails/AccountCreate';
import MailSenderSystem from '../Mails/MailSenderSystem';
import TimeSender from './components/TimeSender';
import MailContent from '../Mails/MailContent';
import MailAttachment from '../Mails/MailAttachment';
import MailPreview from './components/MailPreview';

interface CreateFormProps {
  visible: boolean;
  onCancel: () => void;
  initValues: any;
}

const MassTaskCreate: React.FC<CreateFormProps> = (props) => {
  const { visible, onCancel, initValues } = props;
  const { selectAll, selectKeys, filters, logic, keyword, selectOption, selectSort, selectTotal } =
    initValues;
  const { initialState } = useModel('@@initialState');
  let vip: any = 0;
  if (initialState?.currentUser) {
    vip = initialState.currentUser.vip;
  }
  const [form] = Form.useForm();
  const [state, setState] = useSetState<Record<string, any>>({
    mode: 'filter', // view 视图
    settingType: 'send', // 设置类型
    channel: 2, // 渠道 1自有，2系统
    sendAtOnce: true, // 立即发送
    // systemViews: [], // 系统视图
    // mineViews: [], // 我的视图
    // othersViews: [], // 其他视图
    timeStart: 0,
    memberOptions: [],
    senderOptions: [], // 系统账号
    senderVisible: false, // 新建系统账号
    accountOptions: [], // 用户自有账号
    accountVisible: false, // 新增自有邮箱
    subjectTreeData: [],
    contentTreeData: [],
    includeTreeData: [],
    excludeTreeData: [],
    attachmentOptions: [],
    replyOptions: [],
    replyVisible: false,
    subjectVisible: false,
    contentVisible: false, // 模板增加界面
    timeVisible: false, // 定时界面
    previewVisible: false, // 预览界面
    attachmentVisible: false, // 增加附件界面
    preview: false,
    change: false,
    status: 'unkown',
    saveLoading: false,
    costStatus: 0,
    payBalanceVisible: false,
    payPackageVisible: false,
    qrcodeVisible: false,
    id: '',
    app: '',
    codeUrl: '',
    otherEditStatus: false, // 其他设置是否有修改
    track: { status: true },
    timeSleep: { status: true, value: 60 },
    replyTo: { status: false, value: '' },
    fromName: { status: false, value: '' },
    attNormal: { status: false },
    proxy: { status: false }, // 代发模式
    cids: [], // 选中的客户前10位
    subjectsIds: [],
    contentsIds: [],
    step: 0,
    customers: [],
    choiceNum: 0,
    sendCount: 0,
    limitSetting: false,
    skipNum: 0,
    limitNum: 10,
  });

  const { data: viewsTreeData } = useRequest(apiViewsTree);
  const { data: tagsTreeData } = useRequest(apiTagsTree);

  // 获得任务提交前的其他设置
  const getOtherValues = () => {
    const { channel, track, timeSleep, replyTo, fromName, proxy, attNormal } = state;
    const values: any = { track: false };
    if (track.status) {
      values.track = true;
    }
    if (fromName.status) {
      values.fromName = fromName.value;
    }
    if (channel === 1) {
      values.timeSleep = timeSleep.value;
    }
    if (replyTo.status && replyTo.value) {
      values.replyTo = replyTo.value;
    }
    if (proxy.status) {
      values.proxy = true;
    }
    if (attNormal.status) {
      values.attNormal = true;
    }
    return values;
  };

  const { run: accountsItemRun } = useRequest(apiAccountItems, {
    manual: true,
    onSuccess: (data) => {
      const options = data.map((item: any) => {
        if (item.mail_name) {
          return { label: `${item.mail_addr}(${item.mail_name})`, value: item.maid };
        }
        return { label: `${item.mail_addr}`, value: item.maid };
      });
      setState({ accountOptions: options });
    },
  });

  const { run: senderItemRun } = useRequest(apiSenderItems, {
    manual: true,
    onSuccess: (data) => {
      if (data) {
        const options = data.map((item: any) => {
          return { label: `${item.name}(${item.fromName})`, value: item._id };
        });
        setState({ senderOptions: options });
        if (data.length) {
          form.setFieldsValue({ senders: [data[0]._id] });
        }
      }
    },
  });

  const { run: contentTreeRun, refresh: contentTreeRefresh } = useRequest(apiContentTree, {
    manual: true,
    onSuccess: (data) => {
      setState({ contentTreeData: data });
    },
  });

  const { run: attOptionsRun, refresh: attOptionsRefresh } = useRequest(apiAttachmentOptions, {
    manual: true,
    onSuccess: (data) => {
      setState({ attachmentOptions: data });
    },
  });

  const { run: countRun, loading: countLoading } = useRequest(apiTaskSendCount, {
    manual: true,
    onSuccess: (data) => {
      const { count, customers, sendCount } = data;
      setState({ choiceNum: count, customers, skipNum: 0, limitNum: count, sendCount });
    },
  });

  const { run: taskRun, loading: taskLoading } = useRequest(apiMassTaskAdd, {
    manual: true,
    onSuccess: () => {
      setState({ step: 3 });
      message.success('任务创建成功!');
    },
  });

  // 发送
  const handleSubmit = async (values: any) => {
    const { choiceNum, sendAtOnce, timeStart, mode, skipNum, limitNum, replyTo } = state;
    if (!choiceNum) {
      message.warning('请选择收件人!');
      return;
    }
    if (replyTo.status) {
      const reg = /\w[-\w.+]*@([-A-Za-z0-9]+\.)+[A-Za-z]{1,14}/;
      if (!reg.test(replyTo.value)) {
        message.error('回信邮箱格式不正确!');
        return;
      }
    }
    if (replyTo.status && !replyTo.value) {
      message.error('请输入回信邮箱!');
      return;
    }
    const others = getOtherValues();
    taskRun({
      ...values,
      ...others,
      mode,
      sendAtOnce,
      timeStart,
      filters,
      logic,
      keyword,
      selectAll,
      selectKeys,
      selectOption,
      selectSort,
      selectTotal,
      skipNum,
      limitNum,
    });
  };

  // 定时
  const handleTime = async () => {
    try {
      await form.validateFields();
    } catch (errorInfo) {
      console.log('Failed:', errorInfo);
      return;
    }
    const { choiceNum } = state;
    if (!choiceNum) {
      message.warning('请选择收件人!');
      return;
    }
    setState({ timeVisible: true });
  };

  // const { run: viewListRun } = useRequest(apiViewsList, {
  //   manual: true,
  //   onSuccess: (data: any) => {
  //     if (data) {
  //       const { systemViews, mineViews, othersViews } = data;
  //       setState({ systemViews, mineViews, othersViews });
  //     }
  //   },
  // });

  const { run: saveConfigRun } = useRequest(apiSaveMassConfig, {
    manual: true,
    onSuccess: () => {
      message.success('保存成功.');
      setState({ otherEditStatus: false });
    },
  });

  const saveOtherConfigs = async () => {
    const { track, timeSleep, replyTo, fromName, proxy, attNormal } = state;
    if (fromName.status && !fromName.value) {
      message.error('请输入发信呢称!');
      return;
    }
    if (fromName.status && fromName.value.length > 32) {
      message.error('发信呢称长度超过限制');
      return;
    }
    if (replyTo.status) {
      const reg = /\w[-\w.+]*@([-A-Za-z0-9]+\.)+[A-Za-z]{1,14}/;
      if (!reg.test(replyTo.value)) {
        message.error('回信邮箱格式不正确!');
        return;
      }
    }
    if (replyTo.status && !replyTo.value) {
      message.error('请输入回信邮箱!');
      return;
    }
    saveConfigRun({
      track,
      timeSleep,
      replyTo,
      fromName,
      proxy,
      attNormal,
    });
  };

  const onOtherConfigChange = (key: string, value: any) => {
    setState({ [key]: value });
    setState({ otherEditStatus: true });
  };

  const onReplytoStatusChange = (val: boolean) => {
    const { replyTo } = state;
    if (!val) {
      setState({ proxy: { status: val } });
    }
    setState({ replyTo: { ...replyTo, status: val } });
    setState({ otherEditStatus: true });
  };

  const onProxyStatusChange = (val: boolean) => {
    const { replyTo } = state;
    if (val) {
      setState({ replyTo: { ...replyTo, status: val } });
    }
    setState({ proxy: { status: val } });
    setState({ otherEditStatus: true });
  };

  const countAttSize = (attIds: any) => {
    const { attachmentOptions } = state;
    let totalSize = 0;
    if (!attIds) {
      return 0;
    }
    // eslint-disable-next-line guard-for-in
    for (const idx in attIds) {
      const id = attIds[idx];
      const i = attachmentOptions.findIndex((o: any) => o.value === id);
      const { size } = attachmentOptions[i];
      totalSize += size;
    }
    return totalSize;
  };

  const getTaskData = () => {
    const { mode } = state;
    const values = form.getFieldsValue();
    const { exclude } = values;
    countRun({
      mode,
      exclude,
      keyword,
      filters,
      selectAll,
      selectKeys,
      selectOption,
      selectSort,
      selectTotal,
    });
  };

  // 发送人数统计
  const onSelectFinished = async () => {
    const { mode } = state;
    const values = form.getFieldsValue();
    const { exclude } = values;
    countRun({
      mode,
      exclude,
      keyword,
      filters,
      selectAll,
      selectKeys,
      selectOption,
      selectSort,
      selectTotal,
    });
  };

  const formChange = async (changedValues: any) => {
    const { channel, attIds } = changedValues;
    if (channel) {
      setState({ channel });
      form.setFieldsValue({ senders: [] });
    }
    if (attIds) {
      if (attIds && attIds.length > 5) {
        form.setFieldsValue({ attIds: attIds.slice(0, 5) });
        message.error('附件最多为5个');
      } else if (state.attNormal.status) {
        // 普通附件计算大小
        const totalSize = countAttSize(attIds);
        if (totalSize > 200 * 1024) {
          form.setFieldsValue({ attIds: attIds.slice(0, attIds.length - 1) });
          message.error('普通附件总大小不能超过200KB');
        }
      }
    }
  };

  const renderHidden = (key: number) => {
    const { step } = state;
    if (step === key) {
      return false;
    }
    return true;
  };

  const { run: massConfigRun } = useRequest(apiGetMassConfig, {
    manual: true,
    onSuccess: (data) => {
      if (data) {
        setState({ ...data });
      }
    },
  });

  const setTaskName = () => {
    const name = `群发任务.${todayDate()}`;
    form.setFieldsValue({ name, channel: 2 });
  };

  useEffect(() => {
    if (visible) {
      setState({ step: 0 });
      form.resetFields();
      setTaskName();
      getTaskData();
      massConfigRun();
      accountsItemRun();
      senderItemRun();
      contentTreeRun();
      attOptionsRun();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const getOtherConfigs = () => {
    const { channel, track, timeSleep, replyTo, fromName, proxy, attNormal } = state;
    const colStyle = {
      xs: 24,
      sm: 24,
      md: 24,
      lg: 24,
      xl: 24,
      style: { marginBottom: 12, marginTop: 12, paddingLeft: 12 },
    };
    if (channel === 1) {
      return (
        <>
          <Row>
            <Col {...colStyle}>
              <Space>
                <Switch
                  checked={track.status}
                  onChange={(val: any) => onOtherConfigChange('track', { track: { status: val } })}
                />
                <label style={{ fontWeight: 500 }}>邮件追踪(阅读、链接、附件)</label>
              </Space>
              <div style={{ fontSize: 12, color: '#999999', marginTop: 6 }}>
                追踪阅读邮件、点击邮件正文链接、以及下载附件的客户
              </div>
            </Col>
            <Col {...colStyle}>
              <Space>
                <Switch checked={true} disabled />
                <label style={{ fontWeight: 500 }}>发信速度：</label>
                <InputNumber
                  min={vip ? 6 : 60}
                  max={9999}
                  value={timeSleep.value}
                  onChange={(val: any) =>
                    onOtherConfigChange('timeSleep', { ...timeSleep, value: val })
                  }
                />
              </Space>
              <div style={{ fontSize: 12, color: '#999999', marginTop: 6 }}>
                该任务将以你设置的速度进行发送，单位：秒/封
              </div>
            </Col>
          </Row>
          <Row style={{ marginTop: 12 }}>
            <Col {...colStyle}>
              <Space>
                <Switch
                  checked={replyTo.status}
                  onChange={(val: any) => onReplytoStatusChange(val)}
                />
                <label style={{ fontWeight: 500 }}>回信邮箱：</label>
                <Input
                  value={replyTo.value}
                  onChange={(e) =>
                    onOtherConfigChange('replyTo', {
                      ...replyTo,
                      value: e.target.value,
                      status: true,
                    })
                  }
                  hidden={!replyTo.status}
                />
              </Space>
              <div style={{ fontSize: 12, color: '#999999', marginTop: 6 }}>
                客户邮件将回复到这个邮箱，请务必确保正确.
              </div>
            </Col>
            <Col {...colStyle}>
              <Space>
                <Switch
                  checked={fromName.status}
                  onChange={(val: any) =>
                    onOtherConfigChange('fromName', { ...fromName, status: val })
                  }
                />
                <label style={{ fontWeight: 500 }}>发信呢称：</label>
                <Input
                  value={fromName.value}
                  onChange={(e) =>
                    onOtherConfigChange('fromName', {
                      ...fromName,
                      value: e.target.value,
                      status: true,
                    })
                  }
                  hidden={!fromName.status}
                />
              </Space>
              <div style={{ fontSize: 12, color: '#999999', marginTop: 6 }}>
                客户收到邮件后，在发信人处看到的呢称
              </div>
            </Col>
          </Row>
          <Row style={{ marginTop: 12 }}>
            <Col {...colStyle}>
              <Space>
                <label style={{ fontWeight: 500 }}>附件类型</label>
                <Radio.Group
                  onChange={(e) => onOtherConfigChange('attNormal', { status: e.target.value })}
                  value={attNormal.status}
                >
                  <Radio value={false}>正文附件</Radio>
                  <Radio value={true}>普通附件</Radio>
                </Radio.Group>
              </Space>
              <div style={{ fontSize: 12, color: '#999999', marginTop: 6 }}>
                正文附件带在邮件正文末尾，可统计附件下载数据，普通附件不可统计
              </div>
            </Col>
          </Row>
          <Tooltip title="保存后下次会自动加载设置">
            <Button
              type="primary"
              size="small"
              onClick={() => saveOtherConfigs()}
              disabled={!state.otherEditStatus}
              style={{ marginTop: 24, marginLeft: 12 }}
            >
              设为默认
            </Button>
          </Tooltip>
        </>
      );
    }
    if (channel === 2) {
      return (
        <>
          <Row>
            <Col {...colStyle}>
              <Space>
                <Switch
                  checked={track.status}
                  onChange={(val: any) => onOtherConfigChange('track', { status: val })}
                />
                <label style={{ fontWeight: 500 }}>邮件追踪(阅读、链接、附件)</label>
              </Space>
              <div style={{ fontSize: 12, color: '#999999', marginTop: 6 }}>
                追踪阅读邮件、点击邮件正文链接、以及下载附件的客户
              </div>
            </Col>
            <Col {...colStyle}>
              <Space>
                <Switch
                  checked={fromName.status}
                  onChange={(val: any) =>
                    onOtherConfigChange('fromName', { ...fromName, status: val })
                  }
                />
                <label style={{ fontWeight: 500 }}>发信呢称：</label>
                <Input
                  value={fromName.value}
                  onChange={(e) =>
                    onOtherConfigChange('fromName', {
                      ...fromName,
                      value: e.target.value,
                      status: true,
                    })
                  }
                  hidden={!fromName.status}
                />
              </Space>
              <div style={{ fontSize: 12, color: '#999999', marginTop: 6 }}>
                客户收到邮件后，在发信人处看到的呢称
              </div>
            </Col>
          </Row>
          <Row style={{ marginTop: 12 }}>
            <Col {...colStyle}>
              <Space>
                <Switch
                  checked={replyTo.status}
                  onChange={(val: any) => onReplytoStatusChange(val)}
                />
                <label style={{ fontWeight: 500 }}>回信邮箱：</label>
                <Input
                  value={replyTo.value}
                  onChange={(e) =>
                    onOtherConfigChange('replyTo', {
                      ...replyTo,
                      value: e.target.value,
                      status: true,
                    })
                  }
                  hidden={!replyTo.status}
                />
              </Space>
              <div style={{ fontSize: 12, color: '#999999', marginTop: 6 }}>
                客户邮件将回复到这个邮箱，请务必确保正确.
              </div>
            </Col>
            <Col {...colStyle}>
              <Space>
                <Switch checked={proxy.status} onChange={(val: any) => onProxyStatusChange(val)} />
                <label style={{ fontWeight: 500 }}>代发模式</label>
              </Space>
              <div style={{ fontSize: 12, color: '#999999', marginTop: 6 }}>
                发件人显示回信邮箱地址
              </div>
            </Col>
          </Row>
          <Row style={{ marginTop: 12 }}>
            <Col {...colStyle}>
              <Space>
                <label style={{ fontWeight: 500 }}>附件类型</label>
                <Radio.Group
                  onChange={(e) => onOtherConfigChange('attNormal', { status: e.target.value })}
                  value={attNormal.status}
                >
                  <Radio value={false}>正文附件</Radio>
                  <Radio value={true}>普通附件</Radio>
                </Radio.Group>
              </Space>
              <div style={{ fontSize: 12, color: '#999999', marginTop: 6 }}>
                正文附件带在邮件正文末尾，可统计附件下载数据，普通附件不可统计
              </div>
            </Col>
          </Row>
          <Tooltip title="保存后下次会自动加载设置">
            <Button
              type="primary"
              size="small"
              onClick={() => saveOtherConfigs()}
              disabled={!state.otherEditStatus}
              style={{ marginTop: 24, marginLeft: 12 }}
            >
              设为默认
            </Button>
          </Tooltip>
        </>
      );
    }
    return <></>;
  };

  const renderForm = () => {
    return (
      <Form
        layout="vertical"
        size="large"
        form={form}
        onValuesChange={formChange}
        onFinish={handleSubmit}
      >
        <Form.Item
          hidden={renderHidden(0)}
          label={
            <span>
              已选中联系人数量: {countLoading ? <LoadingOutlined /> : <a>{state.choiceNum}</a>}{' '}
              {state.limitSetting ? null : (
                <a
                  onClick={() => setState({ limitSetting: true })}
                  style={{ marginLeft: 24, fontSize: 16 }}
                >
                  数量自定义
                </a>
              )}
            </span>
          }
        >
          {state.customers.map((customer: any) => (
            <Tag key={customer.cid}>{customer.email}</Tag>
          ))}
          {state.choiceNum > 10 ? <span>......</span> : null}
          {state.limitSetting ? (
            <div style={{ marginTop: 24 }}>
              <Space size="small">
                <span>
                  <label style={{ fontWeight: 500, fontSize: 16 }}>跳过数量：</label>
                  <InputNumber
                    min={0}
                    max={state.choiceNum}
                    value={state.skipNum}
                    onChange={(v) => setState({ skipNum: v })}
                    style={{ width: 120 }}
                  />
                </span>
                <span style={{ marginLeft: 24 }}>
                  <label style={{ fontWeight: 500, fontSize: 16 }}>最大发送数量：</label>
                  <InputNumber
                    min={1}
                    max={state.choiceNum}
                    value={state.limitNum}
                    onChange={(v) => setState({ limitNum: v })}
                    style={{ width: 120 }}
                  />
                </span>
              </Space>
            </div>
          ) : null}
        </Form.Item>
        <Form.Item
          name="name"
          label="任务名称"
          rules={[{ required: true, message: '请设置任务名称' }]}
          hidden={renderHidden(0)}
        >
          <Input placeholder="如：任务1.0" />
        </Form.Item>
        <Form.Item
          name="channel"
          label="发信渠道"
          rules={[{ required: true, message: '请选择发送渠道' }]}
          hidden={renderHidden(1)}
          tooltip="选择邮件发送的方式，优质发送通道为来发信平台代发方式，我的邮箱则用户需要添加自己的邮箱"
        >
          <Radio.Group>
            <Radio value={2}>优质发送通道</Radio>
            <Radio value={1}>我的邮箱</Radio>
          </Radio.Group>
        </Form.Item>
        {state.channel === 1 ? (
          <Form.Item
            name="senders"
            label="发件邮箱(可多选)"
            rules={[{ required: true, message: '请选择发件邮箱' }]}
            hidden={renderHidden(1)}
            tooltip="多选时发送邮件都会随机选择"
          >
            <Select
              mode="multiple"
              placeholder="请选择发件邮箱，选中多个则每次发送邮件都会随机选择"
              disabled={state.preview}
              optionFilterProp="label"
              options={state.accountOptions}
              showArrow={true}
              dropdownRender={(menu) => (
                <div>
                  {menu}
                  <Divider style={{ margin: '4px 0' }} />
                  <div style={{ display: 'flex', flexWrap: 'nowrap', padding: 0 }}>
                    <a
                      style={{ flex: 'none', padding: '8px', display: 'block', cursor: 'pointer' }}
                      onClick={() => setState({ accountVisible: true })}
                    >
                      <PlusOutlined /> 添加我的邮箱
                    </a>
                  </div>
                </div>
              )}
            />
          </Form.Item>
        ) : (
          <Form.Item
            name="senders"
            label="发件账号(可多选)"
            rules={[{ required: true, message: '请选择发件账号' }]}
            hidden={renderHidden(1)}
            tooltip="多选时发送邮件都会随机选择"
          >
            <Select
              mode="multiple"
              placeholder="请选择发件账号，选中多个则每次发送邮件都会随机选择"
              optionFilterProp="label"
              options={state.senderOptions}
              showArrow={true}
              dropdownRender={(menu) => (
                <div>
                  {menu}
                  <Divider style={{ margin: '4px 0' }} />
                  <div style={{ display: 'flex', flexWrap: 'nowrap', padding: 0 }}>
                    <a
                      style={{ flex: 'none', padding: '8px', display: 'block', cursor: 'pointer' }}
                      onClick={() => setState({ senderVisible: true })}
                    >
                      <PlusOutlined /> 添加系统账号
                    </a>
                  </div>
                </div>
              )}
            />
          </Form.Item>
        )}
        <Form.Item
          name="exclude"
          label="排除对象"
          hidden={renderHidden(0)}
          tooltip="排除的对象将不再发送"
        >
          <TreeSelect
            treeCheckable
            showSearch
            placeholder="选中的对象不发送"
            onBlur={onSelectFinished}
            onClear={onSelectFinished}
            onDeselect={onSelectFinished}
            treeNodeFilterProp="title"
            treeDefaultExpandAll
            filterTreeNode={(input, node) =>
              (node!.title as unknown as string)?.toLowerCase().includes(input?.toLowerCase())
            }
            treeData={[
              {
                value: 'view',
                key: 'view',
                title: '联系人视图',
                disabled: true,
                children: viewsTreeData,
              },
              {
                value: 'tags',
                key: 'tags',
                title: '联系人标签',
                disabled: true,
                children: tagsTreeData,
              },
            ]}
          />
        </Form.Item>
        <Form.Item
          name="contentsIds"
          label="邮件模板(可多选)"
          rules={[{ required: true, message: '请选择邮件模板' }]}
          tooltip="多选时每个联系人随机选择模板"
          hidden={renderHidden(0)}
        >
          <TreeSelect
            treeData={state.contentTreeData}
            placeholder="请选择邮件模板，选中多个模板则每次发送邮件随机选取"
            treeCheckable={true}
            showCheckedStrategy={TreeSelect.SHOW_CHILD}
            treeDefaultExpandedKeys={['mine', 'team']}
            treeNodeFilterProp="title"
            showArrow={true}
            allowClear
            dropdownRender={(menu) => (
              <div>
                {menu}
                <Divider style={{ margin: '4px 0' }} />
                <div style={{ display: 'flex', flexWrap: 'nowrap', padding: 0 }}>
                  <a
                    style={{
                      flex: 'none',
                      padding: '8px',
                      display: 'block',
                      cursor: 'pointer',
                      marginRight: 192,
                    }}
                    onClick={() => setState({ contentVisible: true })}
                  >
                    <PlusOutlined /> 添加邮件模板
                  </a>
                  <a
                    style={{
                      flex: 'none',
                      padding: '8px',
                      display: 'block',
                      cursor: 'pointer',
                      textAlign: 'right',
                    }}
                    onClick={() => history.push('/settings/templets')}
                  >
                    <ToolOutlined /> 管理邮件模板
                  </a>
                </div>
              </div>
            )}
          />
        </Form.Item>
        <Form.Item name="attIds" label="附件" hidden={renderHidden(0)}>
          <Select
            mode="multiple"
            placeholder="请选择附件(可选)"
            optionFilterProp="label"
            options={state.attachmentOptions}
            showArrow={true}
            allowClear={true}
            dropdownRender={(menu) => (
              <div>
                {menu}
                <Divider style={{ margin: '4px 0' }} />
                <div style={{ display: 'flex', flexWrap: 'nowrap', padding: '8px' }}>
                  <a
                    style={{ flex: 'none', display: 'block', cursor: 'pointer' }}
                    onClick={() => setState({ attachmentVisible: true })}
                  >
                    <PlusOutlined /> 添加附件
                  </a>
                </div>
              </div>
            )}
          />
        </Form.Item>
        <Form.Item hidden={renderHidden(2)}>{getOtherConfigs()}</Form.Item>
      </Form>
    );
  };

  const handleNow = async () => {
    setState({ sendAtOnce: true });
    form.submit();
  };

  const handleSendAction = (timeStart: number) => {
    setState({ timeStart, sendAtOnce: false, timeVisible: false });
    form.submit();
  };

  const onClickNextStep = async (currentStep: number) => {
    if (!form) return;
    form.submit();
    try {
      await form.validateFields();
      setState({ step: currentStep + 1 });
    } catch (errorInfo) {
      console.log('Failed:', errorInfo);
    }
  };

  const onClickBackStep = async (currentStep: number) => {
    if (currentStep === 0) {
      return;
    }
    if (!form) return;
    form.submit();
    try {
      await form.validateFields();
      setState({ step: currentStep - 1 });
    } catch (errorInfo) {
      console.log('Failed:', errorInfo);
    }
  };

  const onClickPreviewButton = () => {
    const { customers } = state;
    const cids = customers.map((customer: any) => {
      return customer.cid;
    });
    if (!cids.length) {
      message.warning('请选择发送对象!!!');
      return;
    }
    const contentsIds = form.getFieldValue('contentsIds');
    if (!contentsIds || !contentsIds.length) {
      message.warning('请选择发送模板!!!');
      return;
    }
    setState({ previewVisible: true, cids, contentsIds });
  };

  const previewButtom = () => {
    return (
      <Button size="large" onClick={onClickPreviewButton}>
        <EyeOutlined />
        邮件预览
      </Button>
    );
  };

  const footer = () => {
    const { step } = state;
    if (step === 0) {
      return (
        <div style={{ textAlign: 'center' }}>
          <Space size="large">
            <Button size="large" disabled>
              <StepBackwardOutlined /> 上一步
            </Button>
            {previewButtom()}
            <Button type="primary" size="large" onClick={() => onClickNextStep(0)}>
              下一步 <StepForwardOutlined />
            </Button>
          </Space>
        </div>
      );
    }
    if (step === 1) {
      return (
        <div style={{ textAlign: 'center' }}>
          <Space size="large">
            <Button size="large" onClick={() => onClickBackStep(1)}>
              <StepBackwardOutlined /> 上一步
            </Button>
            {previewButtom()}
            <Button type="primary" size="large" onClick={() => onClickNextStep(1)}>
              下一步 <StepForwardOutlined />
            </Button>
          </Space>
        </div>
      );
    }
    if (step === 2) {
      return (
        <div style={{ textAlign: 'center' }}>
          <Space size="large">
            <Button size="large" onClick={() => onClickBackStep(2)}>
              <StepBackwardOutlined /> 上一步
            </Button>
            <Button type="primary" size="large" onClick={handleNow} loading={taskLoading}>
              <SendOutlined rotate={-45} />
              发送
            </Button>
            <Button size="large" onClick={handleTime} loading={taskLoading}>
              <ClockCircleOutlined />
              定时
            </Button>
          </Space>
        </div>
      );
    }
    return null;
  };

  const onStepChange = (value: number) => {
    const { step } = state;
    if (value >= step) {
      return;
    }
    setState({ step: value });
  };

  return (
    <Drawer
      destroyOnClose
      width={720}
      title="批量发送邮件"
      placement="right"
      open={visible}
      onClose={() => onCancel()}
      footer={footer()}
      maskClosable={false}
    >
      <Steps current={state.step} onChange={onStepChange} items={[
        {title:"发送设置"},{title:"账号选择"},{title:"其他设置"},{title:"完成"}
      ]}>
      
      </Steps>
      <Divider />
      {state.step < 3 ? (
        renderForm()
      ) : (
        <Result
          status="success"
          title="发送邮件任务提交成功"
          subTitle="任务审核成功后将在后台自动发送。"
          extra={[
            <Button type="primary" key="send" onClick={() => setState({ step: 0 })}>
              继续发送
            </Button>,
            <Button key="showTask" onClick={() => history.push('/marketing/tasks')}>
              查看任务
            </Button>,
          ]}
        />
      )}
      {state.sendCount < state.choiceNum ? (
        <Alert
          message="群发额度不足"
          showIcon
          description="群发额度不足，请购买后再操作"
          type="error"
          action={<a onClick={() => history.push('/expenses/purchase?type=sendCount')}>购买</a>}
        />
      ) : null}
      <MailAccountCreate
        visible={state.accountVisible}
        actionReload={accountsItemRun}
        onCancel={() => setState({ accountVisible: false })}
      />
      <MailSenderSystem
        visible={state.senderVisible}
        actionReload={senderItemRun}
        onCancel={() => setState({ senderVisible: false })}
        current={false}
      />
      <TimeSender
        visible={state.timeVisible}
        onCancel={() => setState({ timeVisible: false })}
        sendAction={(value) => handleSendAction(value)}
      />
      <MailContent
        visible={state.contentVisible}
        actionReload={() => contentTreeRefresh()}
        onCancel={() => setState({ contentVisible: false })}
        current={false}
        folderItems={null}
        action="add"
      />
      <MailAttachment
        visible={state.attachmentVisible}
        onCancel={() => setState({ attachmentVisible: false })}
        current={false}
        actionReload={() => attOptionsRefresh()}
      />
      <MailPreview
        visible={state.previewVisible}
        onCancel={() => setState({ previewVisible: false })}
        taskValues={{ cids: state.cids, contentsIds: state.contentsIds }}
      />
    </Drawer>
  );
};

export default MassTaskCreate;
