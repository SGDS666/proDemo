import React, { FC, useEffect } from 'react';
import { Modal, Form, Input, message } from 'antd';
import { apiFolderAdd, apiFolderSave } from '@/services/mails';

interface OperationModalProps {
  visible: boolean;
  folder: any | undefined;
  onCancel: () => void;
  actionReload: () => void;
  type: string;
}

const formLayout = {
  labelCol: { span: 7 },
  wrapperCol: { span: 13 },
};

const MailFolderOperation: FC<OperationModalProps> = (props) => {
  const [form] = Form.useForm();
  const { visible, folder, onCancel, actionReload, type } = props;

  useEffect(() => {
    if (visible) {
      if (folder) {
        form.setFieldsValue(folder);
      } else {
        form.resetFields();
      }
    }
  }, [props.visible, props.folder]);

  const handleSubmit = async () => {
    if (!form) return;
    form.submit();
    try {
      const values = await form.validateFields();
      let success;
      if (!folder) {
        success = await apiFolderAdd({ ...values, type });
      } else {
        success = await apiFolderSave({ ...values, type });
      }
      if (success) {
        message.success(`${folder ? '保存' : '新增'}分组成功!`);
        onCancel();
        actionReload();
      }
    } catch (errorInfo) {
      console.log('Failed:', errorInfo);
    }
  };

  const modalFooter = { okText: '保存', onOk: handleSubmit, onCancel };

  const getModalContent = () => {
    return (
      <Form {...formLayout} form={form}>
        <Form.Item hidden name="foid" label="保存id">
          <Input />
        </Form.Item>
        <Form.Item
          name="name"
          label="分组名称"
          rules={[{ required: true, message: '请输入分组名称' }]}
        >
          <Input placeholder="请输入分组名称" />
        </Form.Item>
      </Form>
    );
  };

  return (
    <Modal
      title={`${folder ? '编辑' : '新增'}分组`}
      width={480}
      bodyStyle={{ padding: '28px 0 0' }}
      destroyOnClose
      open={visible}
      maskClosable={false}
      {...modalFooter}
    >
      {getModalContent()}
    </Modal>
  );
};

export default MailFolderOperation;
