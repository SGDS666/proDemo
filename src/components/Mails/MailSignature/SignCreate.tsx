import React, { useEffect } from 'react';
import { Modal, Form, Input, message, Row, Col, Checkbox } from 'antd';
import { useSetState } from 'ahooks';
import { apiSignAdd, apiSignCount } from '@/services/mails';
import Editor from '@/components/RichEditor/Editor';
import { useRequest } from '@umijs/max';

interface OperationModalProps {
  visible: boolean;
  onCancel: () => void;
  actionReload: () => void;
}

const MailSignatureCreate: React.FC<OperationModalProps> = (props) => {
  const [form] = Form.useForm();
  const { visible, onCancel, actionReload } = props;
  const [state, setState] = useSetState({
    _id: null,
    forNew: false,
    forReply: false,
  });

  const { run: countRun } = useRequest(apiSignCount, {
    manual: true,
    onSuccess: (data: any) => {
      if (!data) return;
      const { count } = data;
      const name = `签名${count + 1}`;
      form.setFieldsValue({ name });
    },
  });

  useEffect(() => {
    if (visible) {
      form.resetFields();
      countRun();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const { run: addRun, loading: submitLoading } = useRequest(apiSignAdd, {
    manual: true,
    onSuccess: () => {
      message.success('新增邮件签名成功！');
      onCancel();
      actionReload();
    },
  });

  const handleSubmit = async () => {
    if (!form) return;
    form.submit();
    try {
      const values = await form.validateFields();
      const { forNew, forReply } = state;
      addRun({ ...values, forNew, forReply });
    } catch (errorInfo) {
      console.log('Failed:', errorInfo);
    }
  };

  const modalFooter = { okText: '保存', onOk: handleSubmit, onCancel };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  // const handleEditorChange = (content: any, _editor: any) => {
  //   setState({ html: content });
  // };

  // const imageUploadHandler = async (blobInfo: any, succFun: any, failFun: any) => {
  //   const file = blobInfo.blob();
  //   const result = await uploadFile(file, 'img', true);
  //   const { success, data, error } = result;
  //   if (success) {
  //     const { url } = data;
  //     succFun(url);
  //   } else {
  //     failFun(error);
  //   }
  // };

  // const checkContent = () => {
  //   const promise = Promise;
  //   const { html } = state;
  //   if (!html) {
  //     return promise.reject('签名内容不能为空');
  //   }
  //   return promise.resolve();
  // };

  const getModalContent = () => {
    return (
      <Form form={form}>
        <Row>
          <Col span={12}>
            <Form.Item name="forNew" label={false} style={{ marginBottom: 16 }}>
              <Checkbox
                checked={state.forNew}
                onChange={(e) => setState({ forNew: e.target.checked })}
              >
                应用于新邮件签名
              </Checkbox>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="forReply" label={false} style={{ marginBottom: 16 }}>
              <Checkbox
                checked={state.forReply}
                onChange={(e) => setState({ forReply: e.target.checked })}
              >
                应用于转发/回复
              </Checkbox>
            </Form.Item>
          </Col>
        </Row>
        <Form.Item
          name="name"
          label={false}
          rules={[{ required: true, message: '请输入签名名称' }]}
        >
          <Input placeholder="请输入签名名称" />
        </Form.Item>
        <Form.Item
          name="content"
          label={false}
          rules={[{ required: true, message: '签名内容不能为空' }]}
        >
          <Editor isMobile={true} />
          {/* <div>
            <Editor
              value={state.html}
              tinymceScriptSrc="/lstatic/libs/tinymce/5.5.1/tinymce.min.js"
              init={{
                auto_focus: true,
                height: 500,
                menubar: true,
                language: 'zh_CN',
                plugins:
                  'print preview searchreplace autolink directionality visualblocks visualchars fullscreen image link media template code codesample table charmap hr pagebreak nonbreaking anchor insertdatetime advlist lists wordcount imagetools textpattern help paste emoticons autosave',
                toolbar:
                  // eslint-disable-next-line no-multi-str
                  'undo redo | formatselect fontselect fontsizeselect | \
                  forecolor backcolor bold italic underline strikethrough | \
                  alignleft aligncenter alignright alignjustify outdent indent | bullist numlist | \
                  customInsertButton',
                fontsize_formats: '8px 9px 10px 11px 12px 14px 16px 18px 24px 36px 48px 56px 72px',
                images_upload_handler: imageUploadHandler,
              }}
              onEditorChange={handleEditorChange}
            />
          </div> */}
        </Form.Item>
      </Form>
    );
  };

  return (
    <Modal
      title="新建个性签名"
      width={680}
      destroyOnClose
      open={visible}
      maskClosable={false}
      confirmLoading={submitLoading}
      {...modalFooter}
    >
      {getModalContent()}
    </Modal>
  );
};

export default MailSignatureCreate;
