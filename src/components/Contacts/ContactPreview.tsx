import React, { useEffect } from 'react';
import { Button, Form, Drawer, Alert, message } from 'antd';
import { useRequest } from '@umijs/max';
import { apiContactCraeteFields } from '@/services/field';
import { apiContactSave } from '@/services/contacts';
import { useSetState } from 'ahooks';
import FormItem from './FormItem';
import FieldSetting from '@/components/FieldSetting';

interface CreateFormProps {
  visible: boolean;
  onCancel: () => void;
  actionReload: () => void;
  current: any;
}
const layout = { labelCol: { span: 4 }, wrapperCol: { span: 20 } };
const ContactPreview: React.FC<CreateFormProps> = (props) => {
  const { visible, onCancel, actionReload, current } = props;
  const [form] = Form.useForm();
  const [state, setState] = useSetState({
    notice: '',
    createDisable: false,
    fieldSettingVisible: false,
    hasChange: false,
  });

  const { data: fieldsData, run: createFieldsRun } = useRequest(apiContactCraeteFields, {
    manual: true,
  });

  const { run: saveRun, loading: saveLoading } = useRequest(apiContactSave, {
    manual: true,
    onSuccess: () => {
      message.success('更新联系人成功');
      actionReload();
      onCancel();
    },
  });

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const { cid } = current;
      saveRun({ ...values, cid });
    } catch (errorInfo) {
      console.log('Failed:', errorInfo);
    }
  };

  const onClickReset = () => {
    form.resetFields();
    form.setFieldsValue(current);
  };

  useEffect(() => {
    if (visible) {
      createFieldsRun();
      form.resetFields();
      form.setFieldsValue(current);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const footer = () => {
    return (
      <div style={{ textAlign: 'center' }}>
        <Button style={{ marginRight: 16 }} onClick={() => onCancel()}>
          关闭
        </Button>
        <Button
          style={{ marginRight: 16 }}
          onClick={() => onClickReset()}
          disabled={!state.hasChange}
        >
          重置
        </Button>
        <Button
          type="primary"
          onClick={() => handleSubmit()}
          loading={saveLoading}
          disabled={!state.hasChange}
        >
          保存
        </Button>
      </div>
    );
  };

  const onFormValuesChange = () => {
    setState({ hasChange: true });
  };

  return (
    <Drawer
      destroyOnClose
      width={480}
      title="联系人预览"
      placement="right"
      open={visible}
      onClose={() => onCancel()}
      footer={footer()}
    >
      {state.notice ? (
        <Alert message={state.notice} type="warning" showIcon closable banner />
      ) : null}
      <Form {...layout} form={form} onValuesChange={onFormValuesChange}>
        {fieldsData?.map((item: any) => {
          const { dataIndex } = item;
          if (dataIndex === 'name') {
            return null;
          } else {
            return <FormItem key={dataIndex} item={item} />;
          }
        })}
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

export default ContactPreview;
