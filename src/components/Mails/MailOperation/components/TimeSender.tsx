import React, { useEffect } from 'react';
import { Modal, Form, DatePicker } from 'antd';
import { useSetState } from 'ahooks';
import moment from 'moment';

interface OperationModalProps {
  visible: boolean;
  onCancel: () => void;
  sendAction: (value: number) => void;
}

const TimeSender: React.FC<OperationModalProps> = (props) => {
  const [form] = Form.useForm();
  const { visible, onCancel, sendAction } = props;
  const [state, setState] = useSetState({
    submitLoading: false,
    showTime: '',
  });

  const handleSubmit = async () => {
    if (!form) return;
    try {
      form.submit();
      const values = await form.validateFields();
      const { timeStart } = values;
      setState({ submitLoading: true });
      sendAction(moment(timeStart).valueOf());
    } catch (errorInfo) {
      console.log('Failed:', errorInfo);
    }
  };

  const formChange = (changedValues: any) => {
    const { timeStart } = changedValues;
    const showTime = moment(timeStart).format('YYYY年MM月DD日 HH:mm:ss');
    setState({ showTime });
  };

  useEffect(() => {
    if (form && visible) {
      const t = moment();
      const showTime = t.format('YYYY年MM月DD日 HH:mm:ss');
      form.setFieldsValue({ timeStart: t });
      setState({ showTime, submitLoading: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const getModalContent = () => {
    return (
      <>
        <Form layout="vertical" form={form} onValuesChange={formChange} size="large">
          <Form.Item
            name="timeStart"
            label="选择定时发送的时间"
            rules={[{ required: true, message: '请选择定时时间' }]}
          >
            <DatePicker
              format="YYYY-MM-DD HH:mm:ss"
              showTime={{ defaultValue: moment('00:00:00', 'HH:mm:ss') }}
              style={{ width: '100%' }}
              placeholder="请设置定时时间"
            />
          </Form.Item>
          <div style={{ color: '#798699' }}>
            本邮件将在 <span style={{ color: '#000', fontWeight: 'bold' }}>{state.showTime}</span>{' '}
            开始发送
          </div>
        </Form>
      </>
    );
  };

  const modalFooter = { okText: '发送', onOk: handleSubmit, onCancel };

  return (
    <Modal
      title="定时发送"
      width={420}
      bodyStyle={{ padding: '20px 28px' }}
      destroyOnClose
      open={visible}
      confirmLoading={state.submitLoading}
      {...modalFooter}
    >
      {getModalContent()}
    </Modal>
  );
};

export default TimeSender;
