import React, { useState, useCallback, useEffect } from 'react';
import { Drawer, Form, Input, Button, Radio, Select, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { Card } from './OptionCard';
import { useSetState } from 'ahooks';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { apiFieldUpdate } from '@/services/field';
import { useRequest } from '@umijs/max';

interface FormProps {
  visible: boolean;
  onCancel: () => void;
  actionReload: () => void;
  current: any;
}

export interface Item {
  id: number;
  text: string;
}

export interface ContainerState {
  cards: Item[];
}

const EditForm: React.FC<FormProps> = (props) => {
  const [form] = Form.useForm();
  const { visible, onCancel, actionReload, current } = props;
  const [options, setOptions] = useState([{ label: '', value: '' }]);
  const [state, setState] = useSetState({
    valueType: '',
    submitLoading: false,
    title: '',
  });

  const moveCard = useCallback(
    (dragIndex: number, hoverIndex: number) => {
      const opts = [...options];
      const dragCard = options[dragIndex];
      opts.splice(dragIndex, 1);
      opts.splice(hoverIndex, 0, dragCard);
      setOptions(opts);
    },
    [options],
  );

  const removeCard = useCallback(
    (index) => {
      const opts = [...options];
      opts.splice(index, 1);
      setOptions(opts);
    },
    [options],
  );

  const changeCard = useCallback(
    (index, value) => {
      const opts = [...options];
      opts[index] = { label: value, value: value };
      setOptions(opts);
    },
    [options],
  );

  const renderCard = (item: { label: string }, index: number) => {
    return (
      <Card
        key={index}
        index={index}
        label={item.label}
        moveCard={moveCard}
        removeCard={removeCard}
        changeCard={changeCard}
      />
    );
  };

  const addOptions = () => {
    const ops = [...options];
    ops.push({ value: '', label: '' });
    setOptions(ops);
  };

  const { run: updateRun } = useRequest(apiFieldUpdate, {
    manual: true,
    onSuccess: () => {
      message.success('??????????????????');
      onCancel();
      actionReload();
    },
  });

  const handleSubmit = async () => {
    setState({ submitLoading: true });
    try {
      const values = await form.validateFields();
      const { dataIndex } = current;
      updateRun({ ...values, options, dataIndex });
    } catch (errorInfo) {
      console.log('Failed:', errorInfo);
    }
    setState({ submitLoading: false });
  };

  const formChange = (changedValues: any) => {
    const { valueType } = changedValues;
    if (valueType) {
      setState({ valueType });
    }
  };

  useEffect(() => {
    setState({ submitLoading: false });
    if (form && visible) {
      form.resetFields();
      if (current) {
        const { options: fieldOptions, valueType } = current;
        form.setFieldsValue(current);
        setOptions(fieldOptions);
        setState({ valueType, title: '????????????' });
      } else {
        form.setFieldsValue({});
        setState({ title: '????????????' });
      }
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
          ??????
        </Button>
        <Button type="primary" onClick={() => handleSubmit()} loading={state.submitLoading}>
          ??????
        </Button>
      </div>
    );
  };

  return (
    <Drawer
      destroyOnClose
      title="????????????"
      open={visible}
      onClose={() => onCancel()}
      width={480}
      footer={footer()}
    >
      <Form name="basic" form={form} onValuesChange={formChange} size="large" layout="vertical">
        <Form.Item
          label="????????????"
          name="title"
          rules={[{ required: true, message: '?????????????????????!' }]}
        >
          <Input placeholder="?????????????????????" />
        </Form.Item>
        <Form.Item
          label="????????????"
          name="belongTo"
          rules={[{ required: true, message: '?????????????????????!' }]}
        >
          <Radio.Group disabled={current ? true : false}>
            <Radio value="contact">?????????</Radio>
            <Radio value="company" disabled>
              ??????
            </Radio>
          </Radio.Group>
        </Form.Item>

        <Form.Item
          label="????????????"
          name="valueType"
          rules={[{ required: true, message: '?????????????????????!' }]}
        >
          <Select placeholder="?????????????????????">
            <Select.Option value="text">????????????</Select.Option>
            <Select.Option value="textarea">????????????</Select.Option>
            <Select.Option value="digit">??????</Select.Option>
            <Select.Option value="date">??????</Select.Option>
            <Select.Option value="dateTime">????????????</Select.Option>
            <Select.Option value="select">??????</Select.Option>
          </Select>
        </Form.Item>
        {state.valueType === 'select' ? (
          <Form.Item
            label="????????????"
            name="multi"
            rules={[{ required: true, message: '?????????????????????!' }]}
          >
            <Radio.Group>
              <Radio value="0">???</Radio>
              <Radio value="1">???</Radio>
            </Radio.Group>
          </Form.Item>
        ) : null}
        {state.valueType === 'select' ? (
          <Form.Item label="?????????" name="options">
            <div>
              <DndProvider backend={HTML5Backend}>
                <div style={{ width: '100%', maxHeight: 480, overflow: 'auto' }}>
                  {options.map((item, i) => renderCard(item, i))}
                </div>
              </DndProvider>
              <a onClick={() => addOptions()}>
                <PlusOutlined />
                ??????
              </a>
            </div>
          </Form.Item>
        ) : null}
      </Form>
    </Drawer>
  );
};

export default EditForm;
