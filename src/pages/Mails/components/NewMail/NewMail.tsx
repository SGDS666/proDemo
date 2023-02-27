import '@wangeditor/editor/dist/css/style.css'; // 引入 css

import React, { useState, useEffect } from 'react';
//@ts-ignore
import { Editor, Toolbar } from '@wangeditor/editor-for-react';
//@ts-ignore
import type { IToolbarConfig, IDomEditor, IEditorConfig } from '@wangeditor/editor';
import { Modal, Row, Col, Form, Input, Select, Menu, Dropdown, MenuProps } from 'antd';
import { useSetState } from 'ahooks';
// import { RichEditor } from 'ppfish';
import { PaperClipOutlined, SaveOutlined, SendOutlined, CheckOutlined } from '@ant-design/icons';
import { menuArr } from '../../mailData';
import styles from './index.less';
import './index.less';
import Namemenu from './Namemenu';
//@ts-ignore
import { DomEditor, Boot } from '@wangeditor/editor';
const { Option } = Select;
// 定义菜单 class
// 定义菜单配置
export const NamemenuConf = {
  key: 'Namemenu', // menu key ，唯一。注册之后，可配置到工具栏
  factory() {
    return new Namemenu();
  },
};
// 注册到 wangEditor
Boot.registerMenu(NamemenuConf);

const childrens: any = [];
for (let i = 10; i < 36; i++) {
  childrens.push(<Option key={i.toString(36) + i}>{i.toString(36) + i}</Option>);
}

interface CreateFormProps {
  visible: boolean;
  onCancel: () => void;
  actionReload: () => void;
}
interface Istate {
  layId: string[];
  [key: string]: any;
}

const RoleCreateForm: React.FC<CreateFormProps> = (props) => {
  const { visible, onCancel } = props;
  const [state, setState] = useSetState<Istate>({
    secretShow: true,
    sendShow: true,
    add: '',
    form: { username: '', send: '', sendSecret: '', object: '' },
    layId: [],
  });
  const [editor, setEditor] = useState<IDomEditor | null>(null); // 存储 editor 实例
  const [html, setHtml] = useState('<p>hello</p>'); // 编辑器内容

  // 模拟 ajax 请求，异步设置 html
  useEffect(() => {
    setTimeout(() => {
      setHtml('<p>hello&nbsp;world</p>');
    }, 1500);
  }, []);

  const toolbarConfig: Partial<IToolbarConfig> = {
    /* 工具栏配置 */
    insertKeys: {
      index: 30,
      keys: ['Namemenu'],
    },
    excludeKeys: ['fullScreen'],
  };
  const editorConfig: Partial<IEditorConfig> = {
    placeholder: '请输入内容...',
  };

  editorConfig.onCreated = (editors: any) => {
    // 记录 editor 实例，重要 ！
    // 有了 editor 实例，就可以执行 editor API
    // console.log(editors);
    setEditor(editors);

    setTimeout(() => {
      const toolbar = DomEditor.getToolbar(editors);
      //  const aa= DomEditor.getConfig(editors).toolbarKeys
      console.log('toolbar', toolbar);
    }, 500);
  };

  useEffect(() => {
    setTimeout(() => {
      setHtml('<p>hello&nbsp;world</p>');
    }, 1500);
  }, []);

  const editorChange = (editors: any) => {
    console.log(editors);
    setHtml(editors.getHtml());
  };

  // 及时销毁 editor ，重要！
  useEffect(() => {
    return () => {
      if (editor == null) return;
      editor.destroy();
      setEditor(null);
    };
  }, [editor]);
  // const onChange = () => {
  //   console.log('富文本内容部分1111');
  // };
  // const toolbar = [
  //   ['link', 'bold', 'italic', 'underline'],
  //   ['size'],
  //   ['color', 'background'],
  //   [{ align: '' }, { align: 'center' }, { align: 'right' }, { align: 'justify' }],
  //   [{ list: 'ordered' }, { list: 'bullet' }],
  //   ['emoji'],
  //   ['image', 'attachment'],
  //   ['clean', 'formatPainter'],
  // ];
  const changeInput = () => {
    // console.log(changedValues, allValues);
  };
  const sendScret = () => {
    setState({ secretShow: !state.secretShow });
  };
  const sendPerson = () => {
    setState({ sendShow: !state.sendShow });
  };
  function handleChange() {
    // console.log(`selected ${value}`);
  }
  const ellipseItem = (value: any) => {
    const id: string[] = state.layId;
    let arr = [];
    if (id.includes(value.key)) {
      arr = id.filter((item) => item != value.key);
      setState({ layId: arr });
    } else {
      setState({ layId: [...state.layId, value.key] });
    }
  };
  const menuProp: MenuProps = {
    onClick: ellipseItem,
    items: menuArr.map(item => ({
      key: item.key,
      label: (
        <div className={styles.layMenu}>
          <span>{item.value}</span>
          {state.layId.includes(item.key) ? (
            <span className={styles.chose}>
              <CheckOutlined />
            </span>
          ) : null}
        </div>
      ),
    }))
  }


  return (
    <Modal
      destroyOnClose
      title={false}
      open={visible}
      onCancel={() => onCancel()}
      footer={null}
      width="820px"
    >
      <Row>
        <Col span={2}>
          <a className={styles.focusSty}>
            <SendOutlined />
            发送
          </a>
        </Col>
        <Col span={2}>
          <span className={styles.focusSty}>
            <SaveOutlined />
            保存
          </span>
        </Col>
        <Col span={2}>
          <span className={styles.focusSty}>
            <PaperClipOutlined />
            附件
          </span>
        </Col>
        <Col span={14}>
          {/* <span className={styles.focusSty}>...</span> */}
          <Dropdown overlayStyle={{ width: '200px' }} menu={menuProp}>
            <span className={styles.focusSty}>...</span>
          </Dropdown>
        </Col>
        <Col>sender.com</Col>
      </Row>
      <div className={styles.boxBorder}>
        <Form
          className={styles.scope}
          name="wrap"
          labelCol={{ span: 2 }}
          labelAlign="left"
          wrapperCol={{ span: 22 }}
          colon={false}
          onValuesChange={changeInput}
        >
          <Form.Item label="收件人:" className={styles.borderd}>
            <Form.Item name="username" noStyle>
              <Select
                mode="tags"
                style={{ width: 'calc(100% - 70px)' }}
                bordered={false}
                onChange={handleChange}
                tokenSeparators={[',']}
              >
                {childrens}
              </Select>
            </Form.Item>
            <label onClick={sendPerson}>{state.sendShow ? '抄送' : null}</label>
            <label onClick={sendScret}>{state.secretShow ? '密送' : null}</label>
          </Form.Item>
          {!state.sendShow ? (
            <Form.Item label="抄送：" className={styles.borderd}>
              <Form.Item name="send" noStyle>
                <Select
                  mode="tags"
                  style={{ width: 'calc(100% - 30px)' }}
                  bordered={false}
                  onChange={handleChange}
                  tokenSeparators={[',']}
                >
                  {childrens}
                </Select>
              </Form.Item>
              <span onClick={sendPerson} className={styles.span}>
                -
              </span>
            </Form.Item>
          ) : null}

          {!state.secretShow ? (
            <Form.Item label="密送：" className={styles.borderd}>
              <Form.Item name="sendSecret" noStyle>
                <Select
                  mode="tags"
                  style={{ width: 'calc(100% - 30px)' }}
                  bordered={false}
                  onChange={handleChange}
                  tokenSeparators={[',']}
                >
                  {childrens}
                </Select>
              </Form.Item>
              <span onClick={sendScret} className={styles.span}>
                -
              </span>
            </Form.Item>
          ) : null}
          <Form.Item label="主题：" name="object" className={styles.borderd}>
            <Input style={{ width: 'calc(100% - 30px)' }} bordered={false} />
          </Form.Item>
        </Form>
        <div style={{ border: '1px solid #ccc', zIndex: 100 }}>
          <Toolbar
            editor={editor}
            defaultConfig={toolbarConfig}
            mode="default"
            style={{ borderBottom: '1px solid #ccc' }}
          />
          <Editor
            defaultConfig={editorConfig}
            value={html}
            onCreated={setEditor}
            onChange={(editors: any) => editorChange(editors)}
            mode="default"
            style={{ height: '300px', overflowY: 'hidden' }}
          />
        </div>
        <div style={{ marginTop: '15px' }}>{html}</div>
      </div>
    </Modal>
  );
};

export default RoleCreateForm;
