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
import { apiDomainSaveContacts, apiPositionList, apiSaveConfigShow } from '@/services/search';
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

const DomainSaveToContatcs: React.FC<FormProps> = (props) => {
  const { visible, onCancel, initValues, actionReload } = props;
  const { domain } = initValues;
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

  const { run: positionRun } = useRequest(apiPositionList, {
    manual: true,
    onSuccess: (data: any) => {
      if (!data) return;
      const { positionList } = data;
      setState({ positionList });
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

  const onFinish = () => {};

  const { run: saveRun, loading: saveLoading } = useRequest(apiDomainSaveContacts, {
    manual: true,
    onSuccess: (data: any) => {
      if (!data) return;
      const { personalCost, personalSave, genericCost, genericSave } = data;
      message.success(
        `????????????????????????${personalSave}????????????${personalCost}; ????????????????????????${genericSave}????????????${genericCost}`,
      );
      onCancel();
      actionReload();
    },
  });

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const { types, maxCount, tags, positions, emailExist } = values;
      saveRun({
        domain,
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
          ??????
        </Button>
        <Button type="primary" onClick={() => handleSubmit()} loading={saveLoading}>
          ??????
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
        ?????????????????? ??????????????????<a>{domain}</a>
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
            <div>???????????????????????????????????????2??????????????????????????????1???</div>
            <div style={{ fontSize: 12 }}>
              <a>?????????????????????????????????????????????????????????????????????????????????</a>
            </div>
          </>
        }
        showIcon
        banner
        action={
          <Button type="primary" onClick={() => window.open('/expenses/purchase?type=searchMonth')}>
            <ShoppingCartOutlined />
            ??????
          </Button>
        }
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
              <span style={{ fontWeight: 'bold' }}>?????????????????????</span>
              <span style={{ color: '#999', fontSize: 12 }}>
                {' '}
                ????????????(<a>??????</a>)???????????????????????????????????????????????????????????????
              </span>
            </div>
          }
          name="types"
          rules={[{ required: true, message: '???????????????????????????' }]}
        >
          <Checkbox.Group style={{ width: '100%', marginLeft: 12 }} onChange={onEmailTypesChange}>
            <Row style={{ width: '100%' }}>
              <Col span={12}>
                <Tooltip title="??????????????????????????????????????????">
                  <Checkbox value="personal">
                    <LikeOutlined style={{ color: '#52c41a' }} /> ????????????
                  </Checkbox>
                </Tooltip>
              </Col>
              <Col span={12}>
                <Tooltip title="????????????????????????????????????">
                  <Checkbox value="generic">????????????</Checkbox>
                </Tooltip>
              </Col>
            </Row>
          </Checkbox.Group>
        </Form.Item>
        {state.hasPersonal ? (
          <Form.Item
            label={
              <div>
                <span style={{ fontWeight: 'bold' }}>???????????????????????? </span>
                <span style={{ color: '#999', fontSize: 12 }}> ????????????????????????(??????;?????????)</span>
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
              placeholder="????????????????????????????????????????????????"
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
              <span style={{ fontWeight: 'bold' }}>????????????/??????????????????????????????</span>
            </div>
          }
          name="maxCount"
          rules={[{ required: true, message: '???????????????' }]}
        >
          <InputNumber
            placeholder="????????????????????????????????????"
            style={{ width: '25%', marginLeft: 12 }}
            step={10}
            min={10}
            max={10000}
          />
        </Form.Item>
        <Form.Item
          label={
            <div>
              <span style={{ fontWeight: 'bold' }}>?????????????????????</span>
              <span style={{ color: '#999', fontSize: 12 }}>
                {' '}
                ?????????????????????????????????????????????(?????? ; ????????????)
              </span>
            </div>
          }
          name="tags"
          rules={[{ required: true, message: '???????????????' }]}
        >
          <Select
            showArrow
            showSearch
            allowClear
            mode="tags"
            style={{ width: '100%', marginLeft: 12 }}
            placeholder="?????????????????????????????????????????????"
            options={state.tagsOptions}
            optionFilterProp="label"
            tokenSeparators={[';']}
          />
        </Form.Item>
        <Form.Item
          name="emailExist"
          label={
            <div>
              <span style={{ fontWeight: 'bold' }}>?????????????????????????????????</span>
            </div>
          }
          rules={[{ required: true, message: '?????????????????????' }]}
        >
          <Radio.Group buttonStyle="solid" style={{ width: '100%', marginLeft: 12 }}>
            <Radio.Button value="null"> ????????? </Radio.Button>
            <Radio.Button value="add">????????????</Radio.Button>
            <Radio.Button value="replace">????????????</Radio.Button>
          </Radio.Group>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default DomainSaveToContatcs;
