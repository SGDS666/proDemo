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
          ??????
        </Button>
        {from === 'task' ? (
          <Button type="primary" onClick={() => onApplyAction()}>
            ??????
          </Button>
        ) : (
          <Button type="primary" onClick={() => onApplyAction()}>
            ??????
          </Button>
        )}
      </div>
    );
  };

  return (
    <Modal
      destroyOnClose
      title="?????????????????????"
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
                label: '????????????',
                icon: <GlobalOutlined />,
                children: [
                  { key: 'example1', label: '??????1' },
                  { key: 'example2', label: '??????2' },
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
              label={<Radio checked={true}>?????????</Radio>}
              name="includeKeywords"
              rules={[{ required: true, message: '??????????????????' }]}
              tooltip="???????????????(?????????)"
            >
              <Select
                options={state.includeOptions}
                mode="tags"
                style={{ width: '100%' }}
                placeholder="??????????????????????????????????????????"
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
                        <SettingOutlined /> ?????????????????????
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
                  ????????????
                </Checkbox>
              }
              name="otherKeywords"
              tooltip="???????????????(?????????)"
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
                        <SettingOutlined /> ?????????????????????
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
                  ????????????
                </Checkbox>
              }
              name="titleKeywords"
              tooltip="?????????????????????????????????"
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
                        <SettingOutlined /> ?????????????????????
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
                  ????????????
                </Checkbox>
              }
              name="excludeKeywords"
              tooltip="???????????????(?????????)"
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
                        <SettingOutlined /> ?????????????????????
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
