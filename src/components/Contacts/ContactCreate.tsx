import React, { useEffect } from 'react';
import { Button, Form, Drawer, Alert, message } from 'antd';
import { useRequest } from '@umijs/max';
import { apiContactCraeteFields } from '@/services/field';
import { apiContactAdd } from '@/services/contacts';
import { useSetState } from 'ahooks';
import FormItem from './FormItem';
import FieldSetting from '@/components/FieldSetting';

interface CreateFormProps {
  visible: boolean;
  onCancel: () => void;
  actionReload: () => void;
}
const layout = { labelCol: { span: 5 }, wrapperCol: { span: 19 } };
const ContactCreate: React.FC<CreateFormProps> = (props) => {
  const { visible, onCancel, actionReload } = props;
  const [form] = Form.useForm();
  const [state, setState] = useSetState({
    notice: '',
    createDisable: false,
    fieldSettingVisible: false,
  });

  const { data: fieldsData, run: createFieldsRun } = useRequest(apiContactCraeteFields, {
    manual: true,
  });

  const { run: addRun, loading: addLoading } = useRequest(apiContactAdd, {
    manual: true,
    onSuccess: () => {
      message.success('新增联系人成功');
    },
  });

  const handleSubmit = async (another: boolean) => {
    try {
      const values = await form.validateFields();
      await addRun(values);
      if (!another) {
        onCancel();
      }
      actionReload();
      form.resetFields();
    } catch (errorInfo) {
      console.log('Failed:', errorInfo);
    }
  };

  useEffect(() => {
    if (visible) {
      createFieldsRun();
      form.resetFields();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const footer = () => {
    return (
      <div style={{ textAlign: 'center' }}>
        <Button style={{ marginRight: 16 }} onClick={() => onCancel()}>
          取消
        </Button>
        <Button
          type="primary"
          style={{ marginRight: 16 }}
          onClick={() => handleSubmit(true)}
          disabled={state.createDisable}
          loading={addLoading}
        >
          创建并继续下一个
        </Button>
        <Button
          type="primary"
          onClick={() => handleSubmit(false)}
          disabled={state.createDisable}
          loading={addLoading}
        >
          创建
        </Button>
      </div>
    );
  };

  const onFormValuesChange = (changedValues: any, allValues: any) => {
    const { email } = allValues;
    console.log(email);
  };

  return (
    <Drawer
      destroyOnClose
      width={480}
      title="新建联系人"
      placement="right"
      open={visible}
      onClose={() => onCancel()}
      footer={footer()}
    >
      {state.notice ? (
        <Alert message={state.notice} type="warning" showIcon closable banner />
      ) : null}
      <Form {...layout} form={form} onValuesChange={onFormValuesChange}>
        {fieldsData?.map((item: any, index: number) => (
          // eslint-disable-next-line react/no-array-index-key
          <FormItem key={`key_${index}`} item={item} />
        ))}
      </Form>
      <div style={{ textAlign: 'right' }}>
        <a style={{ marginRight: 16 }} onClick={() => setState({ fieldSettingVisible: true })}>
          自定义显示字段
        </a>
      </div>
      <FieldSetting
        visible={state.fieldSettingVisible}
        onCancel={() => setState({ fieldSettingVisible: false })}
        belongTo="contact"
        saveType="create"
        actionReload={() => createFieldsRun()}
      />
    </Drawer>
  );
};

export default ContactCreate;
