import React, { useEffect } from 'react';
import { Modal, Form, Input, message, Upload, Button } from 'antd';
import styles from './style.less';
import { apiAttachmentSave } from '@/services/mails';
import { UploadOutlined } from '@ant-design/icons';
import { useSetState } from 'ahooks';
import { uploadFile } from '@/utils/oss';
import type { RcFile } from 'antd/lib/upload/interface';

interface OperationModalProps {
  visible: boolean;
  current: any | undefined;
  onCancel: () => void;
  actionReload: () => void;
}

const formLayout = {
  labelCol: { span: 4 },
  wrapperCol: { span: 18 },
};

const MailAttachmentOperation: React.FC<OperationModalProps> = (props) => {
  const [form] = Form.useForm();
  const { visible, current, onCancel, actionReload } = props;
  const [state, setState] = useSetState<Record<string, any>>({
    submitLoading: false,
    _id: null,
    uploading: false,
    fileList: [],
    id: null,
  });

  useEffect(() => {
    if (form && visible) {
      if (current) {
        form.resetFields();
        form.setFieldsValue(current);
        setState({ ...current });
      } else {
        setState({ id: null, fileList: [] });
        form.resetFields();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const handleSubmit = async () => {
    if (!form) return;
    form.submit();
    try {
      const values = await form.validateFields();
      setState({ submitLoading: true });
      const { id } = state;
      const { _id } = current;
      const success = await apiAttachmentSave({ ...values, id, _id });
      if (success) {
        message.success(`${current ? '保存' : '新增'}附件成功！`);
        onCancel();
        actionReload();
      }
      setState({ submitLoading: false });
    } catch (errorInfo) {
      console.log('Failed:', errorInfo);
    }
  };

  const modalFooter = { okText: '保存', onOk: handleSubmit, onCancel };

  const beforeUpload = async (localFile: RcFile) => {
    const { name: fileName, size } = localFile;
    if (size >= 10 * 1024 * 1024) {
      message.warning('文件过大！只支持10MB以内的文件！');
      return false;
    }
    const lowerName = fileName.toLowerCase();
    if (lowerName.indexOf('.exe') > 0) {
      message.warning('文件类型不支持！');
      return false;
    }
    setState({
      uploading: true,
      fileList: [{ name: fileName, uid: fileName, status: 'uploading' }],
    });
    const { success, data, error } = await uploadFile(localFile, 'att', true);
    if (success) {
      const { name, id } = data;
      setState({ id });
      form.setFieldsValue({ name, showname: name });
      setState({ uploading: false, fileList: [{ name, uid: name, status: 'done' }] });
    } else {
      message.error(error);
      setState({
        uploading: false,
        fileList: [{ name: fileName, uid: fileName, status: 'error', response: error }],
      });
    }
    return false;
  };

  const customUploadRequest = async () => {
    console.log('文件上传成功');
  };

  const getModalContent = () => {
    return (
      <Form {...formLayout} form={form} size="large">
        <Form.Item name="upload" label="上传附件">
          <Upload
            fileList={state.fileList}
            name="file"
            beforeUpload={beforeUpload}
            customRequest={customUploadRequest}
          >
            <Button icon={<UploadOutlined />}>上传</Button>
          </Upload>
        </Form.Item>
        <Form.Item
          name="showname"
          label="显示名称"
          rules={[{ required: true, message: '请输入显示名称' }]}
        >
          <Input placeholder="请输入该显示名称，将在邮件中展示" />
        </Form.Item>
        <Form.Item
          name="name"
          label="附件备注"
          rules={[{ required: true, message: '请输入附件备注' }]}
        >
          <Input placeholder="请输入该附件的备注" />
        </Form.Item>
      </Form>
    );
  };

  return (
    <Modal
      title={`${current ? '编辑' : '新增'}附件`}
      className={styles.standardListForm}
      width={720}
      bodyStyle={{ padding: '24px 24px 24px' }}
      destroyOnClose
      open={visible}
      maskClosable={false}
      {...modalFooter}
    >
      {getModalContent()}
    </Modal>
  );
};

export default MailAttachmentOperation;
