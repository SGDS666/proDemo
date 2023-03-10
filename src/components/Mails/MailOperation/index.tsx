import React, { useEffect } from 'react';
import {
  Modal,
  Form,
  Input,
  message,
  Select,
  Divider,
  Space,
  Button,
  Row,
  Col,
  Tag,
  Checkbox,
  Tooltip,
} from 'antd';
import {
  PlusOutlined,
  SendOutlined,
  ClockCircleOutlined,
  QuestionCircleOutlined,
} from '@ant-design/icons';
import { useSetState } from 'ahooks';
import {
  apiMailSave,
  apiMailsSend,
  apiSignDefault,
  apiAccountItems,
  apiSenderItems,
  apiAttachmentItems,
} from '@/services/mails';
import { apiMailToOptions } from '@/services/contacts';
import { Editor } from '@tinymce/tinymce-react';
import { uploadFile } from '@/utils/oss';
import InsertSignatureModal from './components/InsertSignatureModal';
import TimeSender from './components/TimeSender';
import MailAccountCreate from '../AccountCreate';
// import MailAttachmentOperation from '@/components/MailAttachmentOperation';
import MailSenderSystem from '@/components/Mails/MailSenderSystem';
import MailAttachment from '@/components/Mails/MailAttachment';
import styles from './components/index.less';
import {
  exCustomerSelectOptions,
  exHtmlToText,
  exEmailAddressList,
  exMailAddressList,
  mailAddressInfo,
  exMailFinalList,
} from '@/utils/common';
import moment from 'moment';
import { useRequest } from '@umijs/max';

interface OperationModalProps {
  visible: boolean;
  onCancel: () => void;
  current: any | undefined;
  actionReload: () => void;
  action: string;
}

const formLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 24 },
    md: { span: 24 },
    lg: { span: 24 },
    xl: { span: 2 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 24 },
    mg: { span: 24 },
    lg: { span: 24 },
    xl: { span: 21 },
  },
};

const rightItemLayout = {
  wrapperCol: {
    xs: { offset: 0, span: 24 },
    sm: { offset: 0, span: 24 },
    md: { offset: 0, span: 24 },
    lg: { offset: 2, span: 19 },
  },
};

const MailOperation: React.FC<OperationModalProps> = (props) => {
  const [form] = Form.useForm();
  const { visible, onCancel, current, action } = props;
  const [state, setState] = useSetState<Record<string, any>>({
    submitLoading: false,
    insertVisible: false,
    accountItems: [], // ????????????
    accountVisible: false, // ???????????????????????????
    senderItems: [], // ????????????
    senderVisible: false, // ??????????????????????????????
    toOptions: [],
    saveLoading: false,
    ccVisiable: false,
    ccOptions: [],
    bccVisiable: false,
    bccOptions: [],
    attamentOptions: [],
    attachmentVisible: false,
    timeVisible: false,
    track: true,
    costNum: 0,
    html: '',
    maid: 'system',
    single: false,
    replyId: undefined, // ??????ID
    forwardId: undefined, // ??????ID
    sendAtOnce: true, // ????????????
    timeStart: 0,
    attNormal: false,
  });

  const { run: accountsItemRun } = useRequest(apiAccountItems, {
    manual: true,
    onSuccess: (data) => {
      setState({ accountItems: data });
    },
  });

  // ????????????
  const getAccountOptions = async (maid: string) => {
    let sender;
    const data = await accountsItemRun();
    if (data) {
      if (maid !== 'system') {
        data.forEach((item: any) => {
          if (item.maid === maid) {
            sender = item.mail_addr;
          }
        });
      }
    }
    return sender;
  };

  const { run: senderItemRun } = useRequest(apiSenderItems, {
    manual: true,
    onSuccess: (data) => {
      setState({ senderItems: data });
    },
  });

  // ????????????
  const getSenderOptions = async (maid: string) => {
    const data = await senderItemRun();
    if (data) {
      if (maid === 'system' && data.length) {
        form.setFieldsValue({ sender: data[0].name });
      }
    }
  };

  const { run: attchRun, refresh: attOptionsRefresh } = useRequest(apiAttachmentItems, {
    manual: true,
    onSuccess: (data: any) => {
      if (!data) return;
      const options = [];
      // eslint-disable-next-line guard-for-in
      for (const idx in data) {
        const { name, showname, _id, size, fileSize } = data[idx];
        options.push({ label: `${name}(${showname}  ${fileSize})`, value: _id, size });
      }
      setState({ attamentOptions: options });
    },
  });

  const accountReload = async () => {
    const { maid } = state;
    getAccountOptions(maid);
  };

  const senderReload = async () => {
    const { maid } = state;
    getSenderOptions(maid);
  };

  // ????????????
  const getMailContent = async () => {
    if (action === 'new' || !current) {
      return '';
    }
    if (action === 'forward' || action === 'reply') {
      return '<div><br></div><div><br></div><div><br></div>';
    }
    return '';
  };

  const getMailSign = async () => {
    const data = await apiSignDefault({ type: action });
    if (data) {
      const { content } = data;
      if (content) {
        return `<div>--</div><div>${content}</div>`;
      }
    }
    return '';
  };

  const getMailOrigin = async () => {
    if (action === 'new') {
      return '';
    }
    const { html, from, timestamp } = current;
    const { name, email } = mailAddressInfo(from);
    return `<div dir="ltr">
    <div dir="ltr"> <br>  </div>
    <div class="lfx_quote">
        <div dir="ltr" class="lfx_attr"> 
          <a href="mailto:${email}">${name}</a>
          &lt;
          <a href="mailto:${email}">${email}</a>
          &gt; wrote on ${moment(timestamp)}:
          <br>
        </div>
        <blockquote class="lfx_quote" style="margin:0px 0px 0px 0.8ex;border-left:1px solid rgb(204,204,204);padding-left:1ex">${html} </blockquote>
    </div>
</div>`;
  };

  const getDefaultValues = async (sender: any) => {
    form.resetFields();
    const { from, to, subject, html, _id: id, replyTo, cc } = current;
    if (action === 'edit') {
      const toArr = to ? to.split(',') : undefined;
      form.setFieldsValue({ toArr, subject, _id: id });
      setState({
        submitLoading: false,
        html,
        replyId: undefined,
        costNum: toArr ? toArr.length : 0,
      });
      if (sender && sender.indexOf('@') > 0) {
        setState({ costNum: 0 });
      }
      return;
    }
    const mailContent = await getMailContent();
    const mailSign = await getMailSign();
    const mailOrigin = await getMailOrigin();
    if (action === 'new') {
      setState({
        submitLoading: false,
        replyId: undefined,
        forwardId: undefined,
        costNum: 0,
        html: `<div><br></div>${mailSign}`,
      });
    }
    if (action === 'forward') {
      const toArr: any = undefined;
      form.setFieldsValue({ toArr, subject: `Fw: ${subject}` });
      setState({
        submitLoading: false,
        forwardId: id,
        costNum: toArr ? toArr?.length : 0,
        html: `${mailContent}<div></div>${mailSign}${mailOrigin}`,
      });
    }
    if (action === 'reply') {
      const toArr = exMailAddressList(replyTo);
      form.setFieldsValue({ toArr, subject: `Re: ${subject}` });
      setState({
        submitLoading: false,
        replyId: id,
        costNum: toArr ? toArr.length : 0,
        html: `${mailContent}<div></div>${mailSign}${mailOrigin}`,
      });
    }
    if (action === 'replyAll') {
      const fromArr = exMailAddressList(from);
      const toArr = exMailAddressList(to);
      const replyArr = exMailAddressList(replyTo);
      const ccArr = exMailAddressList(cc);
      const addrArr = exMailFinalList(fromArr.concat(toArr, replyArr, ccArr), sender);
      form.setFieldsValue({ toArr: addrArr, subject: `Re: ${subject}` });
      setState({
        submitLoading: false,
        replyId: id,
        costNum: addrArr ? addrArr.length : 0,
        html: `${mailContent}<div></div>${mailSign}${mailOrigin}`,
      });
    }
    if (action === 'sendReply') {
      const toArr = exMailAddressList(to);
      form.setFieldsValue({ toArr, subject: `Re: ${subject}` });
      setState({
        submitLoading: false,
        replyId: id,
        costNum: toArr ? toArr.length : 0,
        html: `${mailContent}<div></div>${mailSign}${mailOrigin}`,
      });
    }
    if (action === 'sendReplyAll') {
      const toArr = exMailAddressList(to);
      const replyArr = exMailAddressList(replyTo);
      const ccArr = exMailAddressList(cc);
      const addrArr = exMailFinalList(toArr.concat(replyArr, ccArr), sender);
      form.setFieldsValue({ toArr: addrArr, subject: `Re: ${subject}` });
      setState({
        submitLoading: false,
        replyId: id,
        costNum: addrArr ? addrArr.length : 0,
        html: `${mailContent}<div></div>${mailSign}${mailOrigin}`,
      });
    }
    if (sender) {
      form.setFieldsValue({ sender });
    }
    if (sender && sender.indexOf('@') > 0) {
      setState({ costNum: 0 });
    }
  };

  const countCostNum = () => {
    let num = 0;
    const values = form.getFieldsValue();
    const { sender, toArr, ccArr, bccArr } = values;
    if (sender && sender.indexOf('@') > 0) {
      setState({ costNum: 0 });
      return;
    }
    if (toArr && toArr.length) {
      num += toArr.length;
    }
    if (ccArr && ccArr.length) {
      num += ccArr.length;
    }
    if (bccArr && bccArr.length) {
      num += bccArr.length;
    }
    setState({ costNum: num });
  };

  const initValues = async () => {
    const { maid } = current;
    setState({ maid, sendAtOnce: true });
    const sender = await getAccountOptions(maid);
    getDefaultValues(sender);
    getSenderOptions(maid);
    attchRun();
  };

  useEffect(() => {
    if (visible) {
      initValues();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const checkMailAdrress = (addrList: any) => {
    if (!addrList) {
      return true;
    }
    const reg = /<\w[-\w.+]*@([-A-Za-z0-9]+\.)+[A-Za-z]{2,14}>/;
    // eslint-disable-next-line guard-for-in
    for (const idx in addrList) {
      const addr = addrList[idx];
      if (!reg.test(addr)) {
        return false;
      }
    }
    return true;
  };

  const checkSendValues = (values: any) => {
    const { toArr, ccArr, bccArr } = values;
    if (toArr && toArr.length > 200) {
      message.error('??????????????????????????? 200');
      return false;
    }
    if (ccArr && ccArr.length > 10) {
      message.error('???????????????????????? 10');
      return false;
    }
    if (bccArr && bccArr.length > 10) {
      message.error('???????????????????????? 10');
      return false;
    }
    let check = checkMailAdrress(toArr);
    if (!check) {
      message.error('??????????????????????????????');
      return false;
    }
    check = checkMailAdrress(ccArr);
    if (!check) {
      message.error('???????????????????????????');
      return false;
    }
    check = checkMailAdrress(bccArr);
    if (!check) {
      message.error('???????????????????????????');
      return false;
    }
    return true;
  };

  const countAttSize = (attIds: any) => {
    const { attamentOptions } = state;
    let totalSize = 0;
    if (!attIds) {
      return 0;
    }
    // eslint-disable-next-line guard-for-in
    for (const idx in attIds) {
      const id = attIds[idx];
      const i = attamentOptions.findIndex((o: any) => o.value === id);
      const { size } = attamentOptions[i];
      totalSize += size;
    }
    return totalSize;
  };

  const checkAttTotalSize = async (attIds: any) => {
    const { attNormal } = state;
    if (!attNormal) {
      return false;
    }
    if (!attIds || !attIds.length) {
      return false;
    }
    const totalSize = countAttSize(attIds);
    if (totalSize > 10 * 1024 * 1024) {
      // form.setFieldsValue({ attIds: attIds.slice(0, attIds.length - 1) });
      message.error('?????????????????????????????????10MB');
      return true;
    }
    return false;
  };

  const formChange = async (changedValues: any) => {
    const { toArr, ccArr, bccArr, attIds } = changedValues;
    if (toArr && toArr.length) {
      const addrList = exEmailAddressList(toArr);
      form.setFieldsValue({ toArr: addrList });
      setState({ toOptions: [] });
    }
    if (ccArr && ccArr.length) {
      const addrList = exEmailAddressList(ccArr);
      form.setFieldsValue({ ccArr: addrList });
      setState({ ccOptions: [] });
    }
    if (bccArr && bccArr.length) {
      const addrList = exEmailAddressList(bccArr);
      form.setFieldsValue({ bccArr: addrList });
      setState({ bccOptions: [] });
    }
    countCostNum();
    checkAttTotalSize(attIds);
  };

  const { run: mailsSendRun, loading: sendLoading } = useRequest(apiMailsSend, {
    manual: true,
  });

  const handleSubmit = async () => {
    if (!form) return;
    form.submit();
    try {
      setState({ submitLoading: true });
      const values = await form.validateFields();
      const { html, track, maid, replyId, single, timeStart, sendAtOnce, attNormal } = state;
      if (!html || !html.length) {
        message.error('???????????????????????????');
        setState({ submitLoading: false });
        return;
      }
      const check = checkSendValues(values);
      if (!check) {
        setState({ submitLoading: false });
        return;
      }
      const text = exHtmlToText(html);
      const { toArr, ccArr, bccArr, sender, attIds, subject } = values;
      const overSize = await checkAttTotalSize(attIds);
      if (overSize) {
        setState({ submitLoading: false });
        return;
      }
      const to = toArr ? toArr.toString() : null;
      const cc = ccArr ? ccArr.toString() : undefined;
      const bcc = bccArr ? bccArr.toString() : undefined;
      const data = await mailsSendRun({
        single,
        track,
        html,
        to,
        cc,
        bcc,
        subject,
        sender,
        maid,
        attIds,
        replyId,
        text,
        timeStart,
        sendAtOnce,
        attNormal,
      });
      if (data) {
        let log;
        if (sendAtOnce) {
          if (data.fail && data.fail >= data.success) {
            message.error('??????????????????');
            setState({ submitLoading: false });
            return;
          }
          log = `????????????????????????????????????${data.total}, ?????????${data.success}, ?????????${data.fail}`;
        } else {
          log = '??????????????????????????????.?????????????????????????????????????????????????????????????????????????????????';
        }
        message.success(log);
        onCancel();
      }
      setState({ submitLoading: false });
    } catch (errorInfo) {
      setState({ submitLoading: false });
      console.log('Failed:', errorInfo);
    }
  };

  // ??????
  const handleTime = async () => {
    try {
      const values = await form.validateFields();
      const { html } = state;
      if (!html || !html.length) {
        message.error('???????????????????????????');
        setState({ submitLoading: false });
        return;
      }
      const check = checkSendValues(values);
      if (!check) {
        setState({ submitLoading: false });
        return;
      }
    } catch (errorInfo) {
      console.log('Failed:', errorInfo);
      return;
    }
    setState({ timeVisible: true });
  };

  const handleSendAction = (timeStart: number) => {
    setState({ timeStart, sendAtOnce: false, timeVisible: false });
    form.submit();
  };

  const { run: saveRun, loading: saveLoading } = useRequest(apiMailSave, {
    manual: true,
    onSuccess: (data: any) => {
      if (!data) return;
      message.success('??????????????????');
      const { _id } = data;
      form.setFieldsValue({ _id });
    },
  });

  const handleSave = async () => {
    setState({ saveLoading: true });
    const values = await form.getFieldsValue();
    const { toArr, ccArr, bccArr, sender } = values;
    const mailSubject = values.subject;
    const to = toArr ? toArr.toString() : null;
    const cc = ccArr ? ccArr.toString() : undefined;
    const bcc = bccArr ? bccArr.toString() : undefined;
    const { html, track, maid } = state;
    const text = exHtmlToText(html);
    await saveRun({
      html,
      to,
      cc,
      bcc,
      subject: mailSubject,
      sender,
      maid,
      track,
      text,
    });
  };

  const handleNow = async () => {
    form.submit();
  };

  const insertSignature = (item: any) => {
    const { content } = item;
    const { editor } = state;
    editor.insertContent(content);
    setState({ insertVisible: false });
  };

  const handleEditorChange = (content: any) => {
    setState({ html: content });
  };

  const imageUploadHandler = async (blobInfo: any, succFun: any, failFun: any) => {
    const file = blobInfo.blob();
    if (!file) {
      return false;
    }
    const { name } = file;
    if (!name) {
      return false;
    }
    const result = await uploadFile(file, 'img', true);
    const { success, data, error } = result;
    if (success) {
      const { url } = data;
      succFun(url);
      return true;
    } else {
      failFun(error);
    }
    return false;
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

  const { run: toOptionsRun } = useRequest(apiMailToOptions, { manual: true });

  const onToAddressSearch = async (keyword: string) => {
    const data = await toOptionsRun({ keyword });
    const options = exCustomerSelectOptions(data);
    setState({ toOptions: options });
  };

  const onCcAddressSearch = async (keyword: string) => {
    const data = await toOptionsRun({ keyword });
    const options = exCustomerSelectOptions(data);
    setState({ ccOptions: options });
  };

  const onBccAddressSearch = async (keyword: string) => {
    const data = await toOptionsRun({ keyword });
    const options = exCustomerSelectOptions(data);
    setState({ bccOptions: options });
  };

  const onRemoveCc = () => {
    setState({ ccVisiable: false });
    form.setFieldsValue({ ccArr: null });
    countCostNum();
  };

  const onRemoveBcc = () => {
    setState({ bccVisiable: false });
    form.setFieldsValue({ bccArr: null });
    countCostNum();
  };

  const tagRender = (tagProps: any) => {
    const { label, value, closable, onClose } = tagProps;
    const onPreventMouseDown = (event: any) => {
      event.preventDefault();
      event.stopPropagation();
    };
    const reg = /\w[-\w.+]*@([-A-Za-z0-9]+\.)+[A-Za-z]{2,14}/;
    const color = reg.test(value) ? 'processing' : 'error';
    return (
      <Tag
        color={color}
        onMouseDown={onPreventMouseDown}
        closable={closable}
        onClose={onClose}
        style={{ marginRight: 3 }}
      >
        {label}
      </Tag>
    );
  };
  const onSingleChange = (checked: boolean) => {
    setState({ single: checked });
    if (checked) {
      form.setFieldsValue({ ccArr: null, bccArr: null });
      setState({ ccVisiable: false, bccVisiable: false });
      formChange({});
    }
  };

  const getModalContent = () => {
    return (
      <Form
        {...formLayout}
        form={form}
        layout="horizontal"
        size="large"
        onValuesChange={formChange}
        onFinish={handleSubmit}
        colon={false}
      >
        <Form.Item hidden name="_id" label="??????id">
          <Input bordered={false} />
        </Form.Item>
        <Form.Item
          label="????????????"
          extra={
            state.costNum ? (
              <span>
                ?????????????????????<a>{state.costNum}</a>???????????????
              </span>
            ) : (
              '??????????????????'
            )
          }
        >
          <Row gutter={3} className={styles.borderd}>
            <Col span={17}>
              <Form.Item name="sender" rules={[{ required: true, message: '?????????????????????' }]}>
                <Select
                  placeholder="?????????????????????"
                  optionFilterProp="label"
                  showArrow={false}
                  bordered={false}
                  size="middle"
                  dropdownRender={(menu) => (
                    <div>
                      {menu}
                      <Divider style={{ margin: '4px 0' }} />
                      <div style={{ display: 'flex', flexWrap: 'nowrap', paddingLeft: 12 }}>
                        <a
                          style={{
                            flex: 'none',
                            padding: '8px',
                            display: 'block',
                            cursor: 'pointer',
                          }}
                          onClick={() => setState({ senderVisible: true })}
                        >
                          <PlusOutlined /> ??????????????????
                        </a>
                      </div>
                      <Divider style={{ margin: '4px 0' }} />
                      <div style={{ display: 'flex', flexWrap: 'nowrap', paddingLeft: 12 }}>
                        <a
                          style={{
                            flex: 'none',
                            padding: '8px',
                            display: 'block',
                            cursor: 'pointer',
                          }}
                          onClick={() => setState({ accountVisible: true })}
                        >
                          <PlusOutlined /> ??????????????????
                        </a>
                      </div>
                    </div>
                  )}
                >
                  <Select.OptGroup label="????????????">
                    {state.senderItems.map((item: any) => (
                      <Select.Option value={item.name} key={item.name}>
                        {`${item.name}(${item.fromName})`}
                      </Select.Option>
                    ))}
                  </Select.OptGroup>
                  <Select.OptGroup label="????????????">
                    {state.accountItems.map((item: any) => (
                      <Select.Option value={item.mail_addr} key={item.maid}>
                        {item.mail_name
                          ? `${item.mail_addr}(${item.mail_name})`
                          : `${item.mail_addr}`}
                      </Select.Option>
                    ))}
                  </Select.OptGroup>
                </Select>
              </Form.Item>
            </Col>
            <Col span={7}>
              <Space style={{ paddingTop: 8, paddingLeft: 12 }}>
                <Checkbox checked={state.single} onChange={(e) => onSingleChange(e.target.checked)}>
                  ????????????
                </Checkbox>
                {state.single ? null : (
                  <div>
                    {state.ccVisiable ? (
                      <Button type="link" size="small" onClick={onRemoveCc}>
                        ????????????
                      </Button>
                    ) : (
                      <Button
                        type="link"
                        size="small"
                        onClick={() => setState({ ccVisiable: true })}
                      >
                        ????????????
                      </Button>
                    )}
                    {state.bccVisiable ? (
                      <Button type="link" size="small" onClick={onRemoveBcc}>
                        ????????????
                      </Button>
                    ) : (
                      <Button
                        type="link"
                        size="small"
                        onClick={() => setState({ bccVisiable: true })}
                      >
                        ????????????
                      </Button>
                    )}
                  </div>
                )}
              </Space>
            </Col>
          </Row>
        </Form.Item>
        <Form.Item
          name="toArr"
          label="?????????"
          rules={[{ required: true, message: '????????????????????????' }]}
        >
          <Select
            className={styles.borderd}
            mode="tags"
            showArrow={false}
            bordered={false}
            options={state.toOptions}
            onSearch={onToAddressSearch}
            tagRender={tagRender}
            allowClear={true}
            size="middle"
          />
        </Form.Item>
        {state.ccVisiable ? (
          <Form.Item
            name="ccArr"
            label="??? ???"
            rules={[{ required: true, message: '?????????????????????' }]}
          >
            <Select
              mode="tags"
              className={styles.borderd}
              showArrow={false}
              bordered={false}
              options={state.ccOptions}
              onSearch={onCcAddressSearch}
              tagRender={tagRender}
              allowClear={true}
              size="middle"
            />
          </Form.Item>
        ) : null}
        {state.bccVisiable ? (
          <Form.Item
            name="bccArr"
            label="??? ???"
            rules={[{ required: true, message: '?????????????????????' }]}
          >
            <Select
              mode="tags"
              className={styles.borderd}
              showArrow={false}
              bordered={false}
              options={state.bccOptions}
              onSearch={onBccAddressSearch}
              tagRender={tagRender}
              allowClear={true}
              size="middle"
            />
          </Form.Item>
        ) : null}
        <Form.Item
          name="subject"
          label="????????????"
          rules={[{ required: true, message: '?????????????????????' }]}
        >
          <Input
            className={styles.borderd}
            placeholder="?????????????????????"
            size="middle"
            bordered={false}
          />
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
                height: 400,
                menubar: true,
                language: 'zh_CN',
                plugins:
                  'print preview searchreplace autolink directionality visualblocks visualchars fullscreen image link media template code codesample table charmap hr pagebreak nonbreaking anchor insertdatetime advlist lists wordcount imagetools textpattern help paste emoticons autosave',
                toolbar:
                  // eslint-disable-next-line no-multi-str
                  'customInsertButton | undo redo | formatselect fontselect fontsizeselect | \
                  forecolor backcolor bold italic underline strikethrough | \
                  alignleft aligncenter alignright alignjustify outdent indent | bullist numlist',
                fontsize_formats: '8px 9px 10px 11px 12px 14px 16px 18px 24px 36px 48px 56px 72px',
                //@ts-ignore
                images_upload_handler: imageUploadHandler,
                setup: editorSetup,
              }}
              onEditorChange={handleEditorChange}
            />
          </div>
        </Form.Item>
        <Form.Item label="??????" style={{ margin: '10px 0' }}>
          <Row gutter={3} className={styles.borderd}>
            <Col span={20}>
              <Form.Item name="attIds">
                <Select
                  size="middle"
                  mode="multiple"
                  placeholder="???????????????(??????)"
                  optionFilterProp="label"
                  options={state.attamentOptions}
                  showArrow={false}
                  bordered={false}
                  allowClear={true}
                  dropdownRender={(menu) => (
                    <div>
                      {menu}
                      <Divider style={{ margin: '4px 0' }} />
                      <div style={{ display: 'flex', flexWrap: 'nowrap', padding: '8px' }}>
                        <a
                          style={{ flex: 'none', display: 'block', cursor: 'pointer' }}
                          onClick={() => setState({ attachmentVisible: true })}
                        >
                          <PlusOutlined /> ????????????
                        </a>
                      </div>
                    </div>
                  )}
                />
              </Form.Item>
            </Col>
            <Col span={4}>
              <Space style={{ paddingTop: 8, paddingLeft: 12 }}>
                <Checkbox
                  checked={state.attNormal}
                  onChange={(e) => setState({ attNormal: e.target.checked })}
                >
                  ????????????{' '}
                  <Tooltip title="????????????????????????????????????????????????">
                    <QuestionCircleOutlined />
                  </Tooltip>
                </Checkbox>
              </Space>
            </Col>
          </Row>
        </Form.Item>
        <Form.Item {...rightItemLayout} style={{ margin: '10px 0' }}>
          <Space size="middle">
            <Button type="primary" size="middle" onClick={handleNow} loading={sendLoading}>
              <SendOutlined rotate={-45} />
              ??????
            </Button>
            <Button size="middle" onClick={handleTime}>
              <ClockCircleOutlined />
              ??????
            </Button>
            <Button size="middle" loading={saveLoading} onClick={handleSave}>
              ?????????
            </Button>
            <Checkbox checked={state.track} onChange={(e) => setState({ track: e.target.checked })}>
              ????????????
            </Checkbox>
          </Space>
        </Form.Item>
      </Form>
    );
  };

  return (
    <Modal
      title="?????????"
      width="60%"
      bodyStyle={{ padding: '24px 24px 24px' }}
      destroyOnClose
      open={visible}
      maskClosable={false}
      footer={false}
      onCancel={onCancel}
      className={styles.writeMail}
    >
      {getModalContent()}
      <InsertSignatureModal
        visible={state.insertVisible}
        onCancel={() => setState({ insertVisible: false })}
        insertAction={insertSignature}
      />
      <TimeSender
        visible={state.timeVisible}
        onCancel={() => setState({ timeVisible: false })}
        sendAction={(value) => handleSendAction(value)}
      />
      <MailAccountCreate
        visible={state.accountVisible}
        actionReload={accountReload}
        onCancel={() => setState({ accountVisible: false })}
      />
      <MailSenderSystem
        visible={state.senderVisible}
        actionReload={senderReload}
        onCancel={() => setState({ senderVisible: false })}
        current={false}
      />
      <MailAttachment
        visible={state.attachmentVisible}
        onCancel={() => setState({ attachmentVisible: false })}
        current={false}
        actionReload={() => attOptionsRefresh()}
      />
    </Modal>
  );
};

export default MailOperation;
