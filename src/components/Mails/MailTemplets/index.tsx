import React, { useEffect } from 'react';
import { Modal, Form, Input, message, Select } from 'antd';
import { useSetState } from 'ahooks';
import styles from './style.less';
import './style.less';
import { Editor } from '@tinymce/tinymce-react';
import { uploadFile } from '@/utils/oss';
import InsertVeriableModal from './components/InsertVeriableModal';
import { checkVeriables } from '@/utils/common';
import { apiFolderItems, apiContentSave } from '@/services/mails';

interface OperationModalProps {
  visible: boolean;
  current: any | undefined;
  onCancel: () => void;
  actionReload: () => void;
  folderItems: any;
}

const MailTemplets: React.FC<OperationModalProps> = (props) => {
  const [form] = Form.useForm();
  const { visible, current, onCancel, actionReload, folderItems } = props;
  const [state, setState] = useSetState({
    testLoading: false,
    submitLoading: false,
    _id: null,
    html: '',
    insertVisible: false,
    filedOptions: [],
    editor: null,
    veriables: {},
    ver: false,
    folderOptions: [],
  });

  const getFolderOptions = async (fItems: any) => {
    let items;
    if (fItems && fItems.length) {
      items = [...fItems];
    } else {
      items = await apiFolderItems({ type: 'content' });
    }
    if (items && items[0]) {
      const { foid } = items[0];
      if (foid === 'all') {
        items.splice(0, 1);
      }
    }
    const folderOptions = items.map((item: any) => ({ label: item.name, value: item.foid }));
    setState({ folderOptions });
  };

  useEffect(() => {
    if (visible) {
      getFolderOptions(folderItems);
      form.resetFields();
      if (current) {
        const { _id, name, html, veriables, foid } = current;
        form.setFieldsValue({ _id, name, foid });
        if (veriables) {
          setState({ html, veriables });
        } else {
          setState({ html, veriables: {} });
        }
      } else {
        setState({ html: '', veriables: {} });
        form.setFieldsValue({ foid: '0' });
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
      const { html, veriables } = state;
      if (!html || !html.length) {
        message.error('???????????????????????????');
        return;
      }
      const [Ver, Veriables] = checkVeriables(html, veriables);
      const success = await apiContentSave({ ...values, html, ver: Ver, veriables: Veriables });
      if (success) {
        message.success(`${current ? '??????' : '??????'}?????????????????????`);
        onCancel();
        actionReload();
      }
      setState({ submitLoading: false });
    } catch (errorInfo) {
      console.log('Failed:', errorInfo);
    }
  };

  const modalFooter = { okText: '??????', onOk: handleSubmit, onCancel };

  const insertVeriable = (item: any) => {
    const { fieldType, dataIndex, title } = item;
    let fieldTbl = '?????????';
    if (fieldType === 'company') {
      fieldTbl = '??????';
    }
    const { editor, veriables } = state;
    const code = `<code class="lfxFieldVeriable" contenteditable="false">{${fieldTbl}:${title}}</code>`;
    //@ts-ignore
    veriables[`${fieldTbl}:${dataIndex}`] = { code, fieldType, fieldTbl, dataIndex, title };
    //@ts-ignore
    editor.insertContent(code);
    setState({ insertVisible: false, veriables, ver: true });
  };

  const handleEditorChange = (content: any, editor: any) => {
    // const editBody = editor.getBody();
    // editor.selection.select(editBody);
    // const text = editor.selection.getContent( { format: 'text' } );
    // console.log(text);
    setState({ html: content });
  };

  const imageUploadHandler = async (blobInfo: any, succFun: any, failFun: any) => {
    const file = blobInfo.blob();
    const result = await uploadFile(file, 'img', true);
    const { success, data, error } = result;
    if (success) {
      const { url } = data;
      succFun(url);
    } else {
      failFun(error);
    }
  };

  const editorSetup = (editor: any) => {
    editor.ui.registry.addButton('customInsertButton', {
      text: '????????????',
      tooltip: '????????????',
      
      onAction: function (_) { 
        setState({ insertVisible: true, editor });
      },
    });
  };

  const checkContent = (_: any, value: string) => {
    const promise = Promise;
    const { html } = state;
    if (!html) {
      return promise.reject('????????????????????????');
    }
    return promise.resolve();
  };

  const getModalContent = () => {
    return (
      <Form form={form} layout="vertical">
        <Form.Item hidden name="_id" label="??????id">
          <Input />
        </Form.Item>
        <Form.Item
          name="content"
          label="????????????"
          rules={[{ required: true, validator: checkContent }]}
        >
          <div>
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
                //@ts-ignore
                images_upload_handler: imageUploadHandler,
                setup: editorSetup,
              }}
              onEditorChange={handleEditorChange}
            />
          </div>
        </Form.Item>
        <Form.Item
          name="name"
          label="????????????"
          rules={[{ required: true, message: '?????????????????????' }]}
        >
          <Input placeholder="????????????????????????????????????????????????" />
        </Form.Item>
        <Form.Item
          name="foid"
          label="????????????"
          rules={[{ required: true, message: '?????????????????????' }]}
        >
          <Select options={state.folderOptions} />
        </Form.Item>
      </Form>
    );
  };

  return (
    <Modal
      title={`${current ? '??????' : '??????'}????????????`}
      className={styles.standardListForm}
      width="75%"
      bodyStyle={{ padding: '24px 24px 24px' }}
      destroyOnClose
      open={visible}
      maskClosable={false}
      {...modalFooter}
    >
      {getModalContent()}
      <InsertVeriableModal
        visible={state.insertVisible}
        onCancel={() => setState({ insertVisible: false })}
        insertAction={insertVeriable}
      />
    </Modal>
  );
};

export default MailTemplets;
