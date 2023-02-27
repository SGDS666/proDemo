import React, { useEffect } from 'react';
import {
  Modal,
  Button,
  Form,
  message,
  Row,
  Col,
  Checkbox,
  InputNumber,
  Alert,
  Select,
  Tooltip,
  Radio,
} from 'antd';
import { apiPositionList, apiSaveConfigShow, apiSearchTasksContacts } from '@/services/search';
import { useRequest } from '@umijs/max';
import { apiTagsList } from '@/services/contacts';
import { useSetState } from 'ahooks';
import { LikeOutlined, ShoppingCartOutlined } from '@ant-design/icons';

interface FormProps {
  visible: boolean;
  onCancel: () => void;
  initValues: any;
  actionReload: () => void;
}

const DEFAULT_VALUES = { maxCount: 10, emailExist: 'null', types: ['personal', 'generic'] };

const TaskSaveToContatcs: React.FC<FormProps> = (props) => {
  const { visible, onCancel, initValues, actionReload } = props;
  const { task_id, selectNum, selectAll, selectOrgs, keyword, filter, filters, logic } = initValues;
  const [form] = Form.useForm();
  const [state, setState] = useSetState<Record<string, any>>({
    tagsOptions: [],
    hasPersonal: true,
    positionList: [],
  });

  const { run: configRun } = useRequest(apiSaveConfigShow, {
    manual: true,
    onSuccess: (data: any) => {
      if (data) {
        const { positions, types } = data;
        if (!positions) {
          delete data.positions;
        }
        form.setFieldsValue(data);
        if (types.indexOf('personal') >= 0) {
          setState({ hasPersonal: true });
        } else {
          setState({ hasPersonal: false });
        }
      } else {
        form.setFieldsValue(DEFAULT_VALUES);
      }
    },
  });

  const { run: tagsListRun } = useRequest(apiTagsList, {
    manual: true,
    onSuccess: (data: any) => {
      if (!data) return;
      const tagsOptions = [];
      // eslint-disable-next-line guard-for-in
      for (const idx in data) {
        const { id, name, folder } = data[idx];
        if (!folder) {
          tagsOptions.push({ label: name, value: id });
        }
      }
      setState({ tagsOptions });
    },
  });

  const { run: positionRun } = useRequest(apiPositionList, {
    manual: true,
    onSuccess: (data: any) => {
      if (!data) return;
      const { positionList } = data;
      setState({ positionList });
    },
  });

  const onFinish = () => {};

  const { run: saveRun, loading: createLoading } = useRequest(apiSearchTasksContacts, {
    manual: true,
    onSuccess: () => {
      message.success('任务正在保存中，请到保存列表中查看进度');
      actionReload();
      onCancel();
    },
  });

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const { types, maxCount, tags, positions, emailExist } = values;
      saveRun({
        task_id,
        selectNum,
        selectAll,
        selectOrgs,
        keyword,
        filter,
        filters,
        logic,
        types,
        maxCount,
        tags,
        positions,
        emailExist,
      });
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

  const onEmailTypesChange = (values: any) => {
    if (values && values.indexOf('personal') >= 0) {
      setState({ hasPersonal: true });
    } else {
      setState({ hasPersonal: false });
    }
  };

  useEffect(() => {
    if (form && visible) {
      tagsListRun();
      positionRun();
      configRun();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const renderTitle = () => {
    return (
      <div>
        数据保存到联系人 已选中企业/域名数量：<a>{selectNum}</a>
      </div>
    );
  };

  return (
    <Modal
      destroyOnClose
      width={600}
      title={renderTitle()}
      open={visible}
      onCancel={() => onCancel()}
      footer={footer()}
      bodyStyle={{ paddingTop: 0, paddingBottom: 0 }}
    >
      <Alert
        message={
          <>
            <div>邮箱价格：每个精准邮箱消耗2点，每个普通邮箱消耗1点</div>
            <div style={{ fontSize: 12 }}>
              <a>相同邮箱地址只在第一次保存时扣除点数，再次保存不计点数</a>
            </div>
          </>
        }
        action={
          <Button type="primary" onClick={() => window.open('/expenses/purchase?type=searchMonth')}>
            <ShoppingCartOutlined />
            购买
          </Button>
        }
        showIcon
        banner
        style={{ marginBottom: 12 }}
      />
      <Form
        name="basic"
        onFinish={onFinish}
        form={form}
        layout="vertical"
        initialValues={DEFAULT_VALUES}
      >
        <Form.Item
          label={
            <div>
              <span style={{ fontWeight: 'bold' }}>保存的邮箱类型</span>
              <span style={{ color: '#999', fontSize: 12 }}>
                {' '}
                精准邮箱(<a>推荐</a>)包含姓名、职位及领英个人主页，推广效果更佳
              </span>
            </div>
          }
          name="types"
          rules={[{ required: true, message: '请邮箱类型' }]}
        >
          <Checkbox.Group style={{ width: '100%', marginLeft: 12 }} onChange={onEmailTypesChange}>
            <Row style={{ width: '100%' }}>
              <Col span={12}>
                <Tooltip title="包含姓名、职位及领英个人主页">
                  <Checkbox value="personal">
                    <LikeOutlined style={{ color: '#52c41a' }} /> 精准邮箱
                  </Checkbox>
                </Tooltip>
              </Col>
              <Col span={12}>
                <Tooltip title="只包含邮箱地址及相关网址">
                  <Checkbox value="generic">普通邮箱</Checkbox>
                </Tooltip>
              </Col>
            </Row>
          </Checkbox.Group>
        </Form.Item>
        {state.hasPersonal ? (
          <Form.Item
            label={
              <div>
                <span style={{ fontWeight: 'bold' }}>精准邮箱职位选择 </span>
                <span style={{ color: '#999', fontSize: 12 }}> 默认选择所有职位(分号;自动词)</span>
              </div>
            }
            name="positions"
          >
            <Select
              showArrow
              showSearch
              allowClear
              mode="tags"
              style={{ width: '100%', marginLeft: 12 }}
              placeholder="输入内容回车可以直接创建新职位"
              optionFilterProp="label"
              tokenSeparators={[';']}
            >
              {state.positionList.map((name: string) => (
                <Select.Option key={name} value={name}>
                  {name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        ) : null}
        <Form.Item
          label={
            <div>
              <span style={{ fontWeight: 'bold' }}>单个公司/域名邮箱最大保存数量</span>
            </div>
          }
          name="maxCount"
          rules={[{ required: true, message: '请设置数量' }]}
        >
          <InputNumber
            placeholder="单个域名最大保存邮箱数量"
            style={{ width: '25%', marginLeft: 12 }}
            step={10}
            min={10}
            max={10000}
          />
        </Form.Item>
        <Form.Item
          label={
            <div>
              <span style={{ fontWeight: 'bold' }}>联系人标签设置</span>
              <span style={{ color: '#999', fontSize: 12 }}>
                {' '}
                自动保存到联系人并贴上相应标签(分号 ; 自动分词)
              </span>
            </div>
          }
          name="tags"
          rules={[{ required: true, message: '请设置标签' }]}
        >
          <Select
            showArrow
            showSearch
            allowClear
            mode="tags"
            style={{ width: '100%', marginLeft: 12 }}
            placeholder="输入内容回车可以直接创建新标签"
            options={state.tagsOptions}
            optionFilterProp="label"
            tokenSeparators={[';']}
          />
        </Form.Item>
        <Form.Item
          name="emailExist"
          label={
            <div>
              <span style={{ fontWeight: 'bold' }}>联系人已存在时标签选项</span>
            </div>
          }
          rules={[{ required: true, message: '请选择操作选项' }]}
        >
          <Radio.Group
            buttonStyle="solid"
            defaultValue="null"
            style={{ width: '100%', marginLeft: 12 }}
          >
            <Radio.Button value="null"> 无操作 </Radio.Button>
            <Radio.Button value="add">追加标签</Radio.Button>
            <Radio.Button value="replace">替换标签</Radio.Button>
          </Radio.Group>
        </Form.Item>
      </Form>
      {selectNum >= 2000 ? (
        <Alert message="当前保存企业数量过多，建议筛选后再进行保存操作" type="warning" showIcon />
      ) : null}
    </Modal>
  );
};

export default TaskSaveToContatcs;
