import React, { useEffect } from 'react';
import { Modal, Form, Input, message, Select, Row, Col } from 'antd';
import { useSetState } from 'ahooks';
import { Editor } from '@tinymce/tinymce-react';
import { uploadFile } from '@/utils/oss';
import InsertVeriableModal from './components/InsertVeriableModal';
import { checkVeriables } from '@/utils/common';
import { apiFolderItems, apiContentSave } from '@/services/mails';
import { useRequest } from '@umijs/max';

interface OperationModalProps {
  visible: boolean;
  action: string; // add, update, copy
  current: any | undefined;
  onCancel: () => void;
  actionReload: () => void;
  folderItems: any;
}

const MailContent: React.FC<OperationModalProps> = (props) => {
  const [form] = Form.useForm();
  const { visible, action, current, onCancel, actionReload, folderItems } = props;
  const [state, setState] = useSetState<Record<string, any>>({
    _id: null,
    html: '',
    insertVisible: false,
    subjectInsertVisible: false,
    filedOptions: [],
    editor: null,
    veriables: {},
    subjectVeriables: {},
    ver: false,
    folderOptions: [],
  });

  const getFolderOptions = async (dirItems: any) => {
    let items;
    if (dirItems && dirItems.length) {
      items = [...dirItems];
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
      if (action === 'add') {
        setState({ html: '', veriables: {} });
        form.setFieldsValue({ foid: '0' });
      }
      if (action === 'update') {
        const { _id, name, subject, html, veriables, foid } = current;
        form.setFieldsValue({ _id, name, subject, foid });
        if (veriables) {
          setState({ html, veriables });
        } else {
          setState({ html, veriables: {} });
        }
      }
      if (action === 'copy') {
        const { name, subject, html, veriables, foid } = current;
        form.setFieldsValue({ name: `${name}.??????`, subject, foid });
        if (veriables) {
          setState({ html, veriables });
        } else {
          setState({ html, veriables: {} });
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const { run: saveRun, loading: saveLoading } = useRequest(apiContentSave, {
    manual: true,
    onSuccess: () => {
      message.success(`${current ? '??????' : '??????'}?????????????????????`);
      onCancel();
      actionReload();
    },
  });

  const handleSubmit = async () => {
    if (!form) return;
    form.submit();
    try {
      const values = await form.validateFields();
      const { html, veriables, subjectVeriables } = state;
      console.log(subjectVeriables);
      if (!html || !html.length) {
        message.error('???????????????????????????');
        return;
      }
      const { subject } = values;
      const [Ver, Veriables] = checkVeriables(html, veriables);
      const [, SubjectVeriables] = checkVeriables(subject, subjectVeriables);
      saveRun({
        ...values,
        html,
        ver: Ver,
        veriables: Veriables,
        subjectVeriables: SubjectVeriables,
      });
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
    veriables[`${fieldTbl}:${dataIndex}`] = { code, fieldType, fieldTbl, dataIndex, title };
    editor.insertContent(code);
    setState({ insertVisible: false, veriables, ver: true });
  };

  const subjectInsertVeriable = (item: any) => {
    const { fieldType, dataIndex, title } = item;
    let fieldTbl = '?????????';
    if (fieldType === 'company') {
      fieldTbl = '??????';
    }
    const value = `{${fieldTbl}:${title}}`;
    const { subjectVeriables } = state;
    subjectVeriables[`${fieldTbl}:${dataIndex}`] = {
      code: value,
      fieldType,
      fieldTbl,
      dataIndex,
      title,
    };
    const subject = form.getFieldValue('subject');
    const newValue = subject ? `${subject}${value}` : value;
    form.setFieldsValue({ subject: newValue });
    setState({ subjectVeriables, subjectInsertVisible: false });
  };

  const handleEditorChange = (content: any) => {
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
      onAction: function () {
        setState({ insertVisible: true, editor });
      },
    });
  };

  const checkContent = () => {
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

        <Row>
          <Col span={12} style={{ paddingRight: 24 }}>
            <Form.Item
              name="name"
              label="????????????"
              rules={[{ required: true, message: '?????????????????????' }]}
            >
              <Input placeholder="????????????????????????????????????????????????" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="foid"
              label="????????????"
              rules={[{ required: true, message: '?????????????????????' }]}
            >
              <Select options={state.folderOptions} />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="subject"
          label="????????????"
          rules={[{ required: true, message: '?????????????????????' }]}
          tooltip="????????????"
        >
          <Input
            placeholder="????????????"
            addonAfter={<a onClick={() => setState({ subjectInsertVisible: true })}>????????????</a>}
          />
        </Form.Item>
        <Form.Item
          name="content"
          label="????????????"
          rules={[{ required: true, validator: checkContent }]}
          tooltip="????????????????????????????????????"
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
      </Form>
    );
  };

  return (
    <Modal
      title={`${current ? '??????' : '??????'}????????????`}
      width="1230px"
      bodyStyle={{ padding: '24px 24px 24px' }}
      destroyOnClose
      open={visible}
      maskClosable={false}
      confirmLoading={saveLoading}
      {...modalFooter}
    >
      {getModalContent()}
      <InsertVeriableModal
        visible={state.insertVisible}
        onCancel={() => setState({ insertVisible: false })}
        insertAction={insertVeriable}
      />
      <InsertVeriableModal
        visible={state.subjectInsertVisible}
        onCancel={() => setState({ subjectInsertVisible: false })}
        insertAction={subjectInsertVeriable}
      />
    </Modal>
  );
};

export default MailContent;
