import React, { useEffect } from 'react';
import { Button, Form, Modal, Select, Menu, Divider, Checkbox, Radio } from 'antd';
import { ProCard } from '@ant-design/pro-components';
import { useSetState } from 'ahooks';
import { GlobalOutlined, SettingOutlined } from '@ant-design/icons';
import { exKeywordOptions } from '@/utils/search';
import { apiSearchOptionsList, apiSearchOptionsSave } from '@/services/option';
import { useRequest } from '@umijs/max';
import KeywordsSetting from './components/KeywordsSetting';

interface FormProps {
  visible: boolean;
  onCancel: () => void;
  keyword: string;
  actionReload: (values: any) => void;
  from?: 'task' | 'preview';
}

const defaultTitleOptions = ['about us', 'contact us', 'company profile'];

const GoogleInput: React.FC<FormProps> = (props) => {
  const [form] = Form.useForm();
  const { visible, onCancel, actionReload, from } = props;
  const [state, setState] = useSetState<Record<string, any>>({
    searchValue: '',
    includeOptions: [],
    otherOptions: [],
    titleOptions: [],
    excludeOptions: [],
    grammar: '',
    description: '',
    otherChecked: false,
    titleChecked: false,
    excludeChecked: false,
    settingVisible: false,
    settingType: false,
  });

  const { otherChecked, titleChecked, excludeChecked } = state;

  // const renderGrammar = () => {
  //   const allValues = form.getFieldsValue();
  //   const { grammar, description } = exSearchWords(allValues, {
  //     otherChecked,
  //     titleChecked,
  //     excludeChecked,
  //   });
  //   setState({ grammar, description });
  // };

  const onFormValuesChange = (changedValues: any) => {
    const { excludeKeywords, otherKeywords, titleKeywords } = changedValues;
    if (excludeKeywords) {
      if (excludeKeywords.length) {
        setState({ excludeChecked: true });
      } else {
        setState({ excludeChecked: false });
      }
    }
    if (otherKeywords) {
      if (otherKeywords.length) {
        setState({ otherChecked: true });
      } else {
        setState({ otherChecked: false });
      }
    }
    if (titleKeywords) {
      if (titleKeywords.length) {
        setState({ titleChecked: true });
      } else {
        setState({ titleChecked: false });
      }
    }
    // renderGrammar();
  };

  const { run: optionsRun } = useRequest(apiSearchOptionsList, {
    manual: true,
    onSuccess: (data: any) => {
      if (!data) return;
      const { excludeKeywords, includeKeywords, otherKeywords, titleKeywords } = data;
      const includeOptions = exKeywordOptions(includeKeywords);
      const otherOptions = exKeywordOptions(otherKeywords);
      // eslint-disable-next-line array-callback-return
      defaultTitleOptions.map((word: string) => {
        if (!titleKeywords.includes(word)) {
          titleKeywords.splice(0, 0, word);
        }
      });
      const titleOptions = exKeywordOptions(titleKeywords);
      const excludeOptions = exKeywordOptions(excludeKeywords);
      setState({ includeOptions, otherOptions, titleOptions, excludeOptions });
    },
  });

  const { run: optionSaveRun } = useRequest(apiSearchOptionsSave, { manual: true });

  const onApplyAction = async () => {
    try {
      const { grammar, description } = state;
      const values = await form.validateFields();
      if (!otherChecked) {
        delete values.otherKeywords;
      }
      if (!titleChecked) {
        delete values.titleKeywords;
      }
      if (!excludeChecked) {
        delete values.excludeKeywords;
      }
      optionSaveRun(values);
      actionReload({ grammar, description, searchValues: values });
      onCancel();
    } catch (errorInfo) {
      console.log('Failed:', errorInfo);
    }
  };

  useEffect(() => {
    if (visible) {
      optionsRun();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  useEffect(() => {
    // renderGrammar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [otherChecked, titleChecked, excludeChecked]);

  const footer = () => {
    return (
      <div style={{ textAlign: 'right' }}>
        <Button style={{ marginRight: 24 }} onClick={() => onCancel()}>
          取消
        </Button>
        {from === 'task' ? (
          <Button type="primary" onClick={() => onApplyAction()}>
            确定
          </Button>
        ) : (
          <Button type="primary" onClick={() => onApplyAction()}>
            搜索
          </Button>
        )}
      </div>
    );
  };

  return (
    <Modal
      destroyOnClose
      title="搜索关键词设置"
      open={visible}
      onCancel={() => onCancel()}
      footer={footer()}
      width={720}
      bodyStyle={{ padding: 0 }}
    >
      <ProCard split="vertical">
        <ProCard title={false} colSpan="0%" bodyStyle={{ padding: 0 }}>
          <Menu
            style={{ width: '100%' }}
            defaultOpenKeys={['system']}
            mode="inline"
            items={[
              {
                key: 'system',
                label: '官方例子',
                icon: <GlobalOutlined />,
                children: [
                  { key: 'example1', label: '例子1' },
                  { key: 'example2', label: '例子2' },
                ],
              },
            ]}
          />
        </ProCard>
        <ProCard title={false} headerBordered>
          <Form
            layout="horizontal"
            labelCol={{ span: 5 }}
            wrapperCol={{ span: 19 }}
            form={form}
            onValuesChange={onFormValuesChange}
          >
            <Form.Item
              label={<Radio checked={true}>关键词</Radio>}
              name="includeKeywords"
              rules={[{ required: true, message: '请输入关键词' }]}
              tooltip="可添加多个(或关系)"
            >
              <Select
                options={state.includeOptions}
                mode="tags"
                style={{ width: '100%' }}
                placeholder="输入关键词后按回车可直接创建"
                allowClear
                dropdownRender={(menu) => (
                  <div>
                    {menu} <Divider style={{ margin: 0 }} />
                    <div style={{ height: 28, paddingTop: 8, paddingLeft: 12 }}>
                      <a
                        onClick={() =>
                          setState({ settingVisible: true, settingType: 'includeKeywords' })
                        }
                      >
                        <SettingOutlined /> 设置常用关键词
                      </a>
                    </div>
                  </div>
                )}
              />
            </Form.Item>
            <Form.Item
              label={
                <Checkbox
                  checked={otherChecked}
                  onChange={(e) => setState({ otherChecked: e.target.checked })}
                >
                  同时包含
                </Checkbox>
              }
              name="otherKeywords"
              tooltip="可添加多个(或关系)"
            >
              <Select
                mode="tags"
                style={{ width: '100%' }}
                allowClear
                options={state.otherOptions}
                dropdownRender={(menu) => (
                  <div>
                    {menu} <Divider style={{ margin: 0 }} />
                    <div style={{ height: 28, paddingTop: 8, paddingLeft: 12 }}>
                      <a
                        onClick={() =>
                          setState({ settingVisible: true, settingType: 'otherKeywords' })
                        }
                      >
                        <SettingOutlined /> 设置常用关键词
                      </a>
                    </div>
                  </div>
                )}
              />
            </Form.Item>
            <Form.Item
              label={
                <Checkbox
                  checked={titleChecked}
                  onChange={(e) => setState({ titleChecked: e.target.checked })}
                >
                  标题包含
                </Checkbox>
              }
              name="titleKeywords"
              tooltip="搜索网页标题中的关键字"
            >
              <Select
                mode="tags"
                style={{ width: '100%' }}
                allowClear
                options={state.titleOptions}
                dropdownRender={(menu) => (
                  <div>
                    {menu} <Divider style={{ margin: 0 }} />
                    <div style={{ height: 28, paddingTop: 8, paddingLeft: 12 }}>
                      <a
                        onClick={() =>
                          setState({ settingVisible: true, settingType: 'titleKeywords' })
                        }
                      >
                        <SettingOutlined /> 设置常用关键词
                      </a>
                    </div>
                  </div>
                )}
              />
            </Form.Item>
            <Form.Item
              label={
                <Checkbox
                  checked={excludeChecked}
                  onChange={(e) => setState({ excludeChecked: e.target.checked })}
                >
                  同时排除
                </Checkbox>
              }
              name="excludeKeywords"
              tooltip="可添加多个(且关系)"
            >
              <Select
                options={state.excludeOptions}
                mode="tags"
                style={{ width: '100%' }}
                allowClear
                dropdownRender={(menu) => (
                  <div>
                    {menu} <Divider style={{ margin: 0 }} />
                    <div style={{ height: 28, paddingTop: 8, paddingLeft: 12 }}>
                      <a
                        onClick={() =>
                          setState({ settingVisible: true, settingType: 'excludeKeywords' })
                        }
                      >
                        <SettingOutlined /> 设置常用关键词
                      </a>
                    </div>
                  </div>
                )}
              />
            </Form.Item>
          </Form>
        </ProCard>
      </ProCard>
      <KeywordsSetting
        visible={state.settingVisible}
        type={state.settingType}
        onCancel={() => setState({ settingVisible: false })}
        actionReload={() => optionsRun()}
      />
    </Modal>
  );
};

export default GoogleInput;
