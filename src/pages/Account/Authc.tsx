import React, { useEffect } from 'react';
import {
  Col,
  Row,
  Upload,
  Card,
  Button,
  Descriptions,
  Form,
  Input,
  Radio,
  message,
  Checkbox,
  Alert,
} from 'antd';
import { CheckCircleFilled, PictureOutlined } from '@ant-design/icons';
import { useSetState } from 'ahooks';
import { apiUserIdInfo, apiUserIdSave } from '@/services/user';
import { uploadFile } from '@/utils/oss';
import { GridContent } from '@ant-design/pro-layout';
import { useRequest } from '@umijs/max';

const { Dragger } = Upload;

const disStyle = { xs: 24, sm: 24, md: 24, lg: 12, xl: 12 };
const formLayout = {
  labelCol: { lg: { span: 8 }, xl: { span: 4, offset: 4 } },
  wrapperCol: { lg: { span: 12 }, xl: { span: 8 } },
};

const submitFormLayout = {
  wrapperCol: {
    lg: { span: 12, offset: 0 },
    xl: { span: 8, offset: 8 },
  },
};

const uid = window.localStorage.getItem('uid') || '';
const accesstoken = window.localStorage.getItem('accesstoken') || '';
const headers = { uid, accesstoken };

const ExpensesBalance: React.FC = () => {
  const [form] = Form.useForm();
  const [state, setState] = useSetState<Record<string, any>>({
    realName: '',
    idNum: '',
    authTime: 0,
    type: 'personal',
    fileList: [],
    agree: false,
    imageUrl: '',
  });

  const { run: infoRun } = useRequest(apiUserIdInfo, {
    manual: true,
    onSuccess: (data) => {
      setState({ ...data });
    },
  });

  const getData = async () => {
    infoRun();
  };

  const hasAuthc = () => {
    return (
      <Row gutter={24}>
        <Col {...disStyle}>
          <Card
            headStyle={{ color: '#85C974', backgroundColor: '#EFF8EC', fontSize: '18px' }}
            title={
              <span>
                <CheckCircleFilled /> 个人实名认证完成！
              </span>
            }
          >
            <Descriptions column={2} style={{ width: '100%' }}>
              <Descriptions.Item label="真实姓名">{state.realName}</Descriptions.Item>
              <Descriptions.Item label="证件号码">{state.idNum}</Descriptions.Item>
              <Descriptions.Item label="认证类型">个人</Descriptions.Item>
              <Descriptions.Item label="认证时间">{state.authTime}</Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>
      </Row>
    );
  };

  const uploadAction = async (localFile: any) => {
    const { file } = localFile;
    if (file.size >= 5 * 1024 * 1024) {
      message.warning('文件过大！只支持5MB以内的图片！');
    }
    setState({ fileList: [{ name: file.name, uid: file.uid, status: 'uploading' }] });
    const { success, data } = await uploadFile(file, 'id', true);
    if (success) {
      const { url } = data;
      setState({ fileList: [{ name: file.name, uid: file.uid, status: 'done' }], imageUrl: url });
    }
  };

  const onAgreeChange = (e: any) => {
    const { checked } = e.target;
    setState({ agree: checked });
    form.setFieldsValue({ agreement: checked });
  };

  const checkIdNumber = (_: any, value: string) => {
    const promise = Promise;
    const reg =
      /^[1-9]\d{5}(18|19|([23]\d))\d{2}((0[1-9])|(10|11|12))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/;
    if (value && !reg.test(value)) {
      return promise.reject('非法身份证格式(18位)');
    }
    return promise.resolve();
  };

  const { run: saveRun, loading: saveLoading } = useRequest(apiUserIdSave, {
    manual: true,
    onSuccess: (data) => {
      setState({ ...data });
    },
  });

  const onFinish = async (values: any) => {
    const { imageUrl } = state;
    const { realName, idNum } = values;
    saveRun({ realName, idNum, imageUrl });
  };

  const notAuthc = () => {
    return (
      <Card>
        <Form {...formLayout} form={form} onFinish={onFinish}>
          <Form.Item
            name="type"
            label="身份注册"
            rules={[{ required: true, message: '请选择注册类型' }]}
          >
            <Radio.Group>
              <Radio value="personal">个人</Radio>
              <Radio value="enterprise" disabled>
                企业
              </Radio>
            </Radio.Group>
          </Form.Item>
          <Form.Item name="tips" {...submitFormLayout}>
            <Alert message="真实姓名需跟提现银行卡名字一致，否则将无法提现" type="info" showIcon />
          </Form.Item>
          <Form.Item
            name="realName"
            label="真实姓名"
            rules={[{ required: true, message: '请输入真实姓名' }]}
          >
            <Input size="large" placeholder="如：张三" />
          </Form.Item>
          <Form.Item
            name="idNum"
            label="身份证号码"
            rules={[{ required: true, message: '请输入身份证号' }, { validator: checkIdNumber }]}
          >
            <Input placeholder="如：110xxx" />
          </Form.Item>
          <Form.Item
            name="image"
            label="证件照片"
            rules={[{ required: true, message: '请上传身份证正面照片' }]}
          >
            <Dragger headers={headers} customRequest={uploadAction} fileList={state.fileList}>
              <p className="ant-upload-drag-icon">
                <PictureOutlined />
              </p>
              <p className="ant-upload-text">点击或拖拽上传身份证正面</p>
              <p className="ant-upload-hint">文件格式：JPG 或 PNG (最大不超过5M)</p>
            </Dragger>
          </Form.Item>
          <Form.Item
            name="agreement"
            {...submitFormLayout}
            rules={[{ required: true, message: '请同意后确认提交' }]}
          >
            <Checkbox checked={state.agree} onChange={onAgreeChange}>
              我确认上述提供的信息完全真实及同意上传到来发信
            </Checkbox>
          </Form.Item>
          <Form.Item {...submitFormLayout} style={{ marginTop: 32 }}>
            <Button type="primary" htmlType="submit" loading={saveLoading}>
              提交
            </Button>
          </Form.Item>
        </Form>
      </Card>
    );
  };

  useEffect(() => {
    getData();
    form.setFieldsValue({ type: 'personal' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <GridContent>{state.idNum ? hasAuthc() : notAuthc()}</GridContent>;
};

export default ExpensesBalance;
