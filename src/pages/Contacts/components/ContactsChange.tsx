import React, { useEffect } from 'react';
import { Modal, Form, Radio, Select } from 'antd';
import { useSetState } from 'ahooks';
import { useRequest } from '@umijs/max';
import { apiContactUpdateFields } from '@/services/field';
import ContactField from '@/components/Contacts/ContactField';

interface OperationModalProps {
  visible: boolean;
  onCancel: () => void;
  multiUpdate: (prams: any) => void;
  changeRows: number;
  loading: boolean;
}

const formLayout = {
  labelCol: { span: 7 },
  wrapperCol: { span: 13 },
};

const ContactsChange: React.FC<OperationModalProps> = (props) => {
  const { visible, onCancel, multiUpdate, changeRows, loading } = props;
  const [form] = Form.useForm();
  const [state, setState] = useSetState<Record<string, any>>({
    changeField: null,
    changeType: 'renew',
    changeValue: null,
    fieldsOptions: [],
    filedItem: {},
  });

  const { data: fieldsData, run: fieldsRun } = useRequest(apiContactUpdateFields, {
    manual: true,
    onSuccess: (data: any) => {
      if (!data) return;
      const options = [];
      // eslint-disable-next-line guard-for-in
      for (const idx in data) {
        const { dataIndex, title } = data[idx];
        if (dataIndex !== 'email') {
          options.push({ label: title, value: dataIndex });
        }
      }
      setState({ fieldsOptions: options });
    },
  });

  useEffect(() => {
    if (visible) {
      fieldsRun();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      multiUpdate(values);
    } catch (errorInfo) {
      console.log('Failed:', errorInfo);
    }
  };

  const onValuesChange = (changedValues: any) => {
    const { changeField } = changedValues;
    if (changeField) {
      const idx = fieldsData.findIndex((o: any) => o.dataIndex === changeField);
      if (idx >= 0) {
        setState({ filedItem: fieldsData[idx] });
      } else {
        setState({ filedItem: {} });
      }
    }
    setState({ ...changedValues });
  };

  return (
    <Modal
      title={
        <span>
          批量修改纪录数 <a>{changeRows}</a>
        </span>
      }
      width={480}
      bodyStyle={{ padding: '28px 0 0' }}
      destroyOnClose
      open={visible}
      onCancel={onCancel}
      okText="提交"
      onOk={handleSubmit}
      confirmLoading={loading}
    >
      <div>
        <Form {...formLayout} form={form} onValuesChange={onValuesChange}>
          <Form.Item
            label="修改字段"
            name="changeField"
            rules={[{ required: true, message: '请选择字段' }]}
          >
            <Select
              showArrow
              allowClear
              showSearch
              style={{ width: '100%' }}
              optionFilterProp="label"
              placeholder="请选择字段"
              options={state.fieldsOptions}
            />
          </Form.Item>
          <Form.Item
            label="修改为"
            name="changeType"
            rules={[{ required: true, message: '请选择' }]}
          >
            <Radio.Group>
              <Radio value="renew" key="renew">
                新值
              </Radio>
              <Radio value="renull" key="renull">
                空值
              </Radio>
            </Radio.Group>
          </Form.Item>
          {state.changeType === 'renew' ? (
            <Form.Item label="新值" name="changeValue">
              <ContactField field={state.filedItem} />
            </Form.Item>
          ) : null}
        </Form>
      </div>
    </Modal>
  );
};

export default ContactsChange;
