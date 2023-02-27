import React, { useEffect } from 'react';
import { Modal, Button, Form, Input, message, Radio, Select, Tag } from 'antd';
import { apiTagsSave, apiTagsDirs } from '@/services/contacts';
import { useRequest } from '@umijs/max';
import { useSetState } from 'ahooks';

interface CreateFormProps {
  visible: boolean;
  onCancel: () => void;
  actionReload: () => void;
  initValues: any;
}

const formLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 16 },
};

const COLORS = [
  '#ff7043',
  '#ffca28',
  '#ffa726',
  '#f2da04',
  '#26a69a',
  '#66bb6a',
  '#9ccc65',
  '#c4d330',
  '#5c6bc0',
  '#42a5f5',
  '#29b6f6',
  '#26c6d9',
  '#ab47bb',
  '#ec407a',
  '#ef5350',
  '#afaeb0',
  '#000000',
  '#FF00FF',
  '#000080',
];

const TagsUpdate: React.FC<CreateFormProps> = (props) => {
  const { visible, onCancel, actionReload, initValues } = props;
  const [form] = Form.useForm();
  const [state, setState] = useSetState<Record<string, any>>({
    dirsOptions: [],
    color: '',
    name: '',
  });

  const { run: dirsRun } = useRequest(apiTagsDirs, {
    manual: true,
    onSuccess: (data: any) => {
      if (!data) return;
      const options = [{ label: '顶级目录', value: '0' }];
      // eslint-disable-next-line guard-for-in
      for (const idx in data) {
        const { id, name } = data[idx];
        options.push({ label: name, value: id });
      }
      setState({ dirsOptions: options });
    },
  });

  const { run: saveRun, loading: addLoading } = useRequest(apiTagsSave, {
    manual: true,
    onSuccess: () => {
      message.success('修改标签成功');
      onCancel();
      actionReload();
    },
  });

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const { id } = initValues;
      saveRun({ ...values, id });
    } catch (errorInfo) {
      console.log('Failed:', errorInfo);
    }
  };

  useEffect(() => {
    if (visible) {
      dirsRun();
      form.resetFields();
      form.setFieldsValue(initValues);
      setState({ ...initValues });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const footer = () => {
    return (
      <div
        style={{
          textAlign: 'center',
        }}
      >
        <Button style={{ marginRight: 16 }} onClick={() => onCancel()}>
          取消
        </Button>
        <Button type="primary" onClick={() => handleSubmit()} loading={addLoading}>
          提交
        </Button>
      </div>
    );
  };

  const onValuesChange = (changedValues: any) => {
    setState({ ...changedValues });
  };

  return (
    <Modal
      destroyOnClose
      title="修改标签"
      open={visible}
      onCancel={() => onCancel()}
      footer={footer()}
      maskClosable={false}
    >
      <Form {...formLayout} form={form} onValuesChange={onValuesChange}>
        <Form.Item
          label="标签名称"
          name="name"
          rules={[{ required: true, message: '请输入标签名称' }]}
        >
          <Input placeholder="请输入标签名称" />
        </Form.Item>
        <Form.Item
          label="所属文件夹"
          name="parent"
          rules={[{ required: true, message: '请选择文件夹' }]}
        >
          <Select
            showArrow
            showSearch
            style={{ width: '100%' }}
            optionFilterProp="label"
            placeholder="请选择文件夹"
            options={state.dirsOptions}
          />
        </Form.Item>
        <Form.Item label="标签颜色" name="color">
          <Radio.Group>
            <Radio key="null" value="">
              <Tag color="">&nbsp;</Tag>
            </Radio>
            {COLORS.map((color) => (
              <Radio key={color} value={color}>
                <Tag color={color}>&nbsp;</Tag>
              </Radio>
            ))}
          </Radio.Group>
        </Form.Item>
        <Form.Item label="预览效果" name="preview">
          <div>{state.name ? <Tag color={state.color}>{state.name}</Tag> : null}</div>
        </Form.Item>
        <Form.Item label="备注" name="description">
          <Input />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default TagsUpdate;
