import React, { useEffect } from 'react';
import { Modal, Form, Select } from 'antd';
import { apiOrganizeUsers } from '@/services/enterprise';
import { useRequest } from '@umijs/max';

interface OperationModalProps {
  visible: boolean;
  onCancel: () => void;
  multiUpdate: (params: any) => void;
  rowCount: number;
  loading: boolean;
}

const ContactsAssign: React.FC<OperationModalProps> = (props) => {
  const { visible, onCancel, multiUpdate, rowCount, loading } = props;
  const [form] = Form.useForm();

  const { data: usersData, run: usersRun } = useRequest(apiOrganizeUsers, { manual: true });

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      let { userid } = values;
      if (userid === 'null') {
        userid = null;
      }
      multiUpdate({ changeField: 'userid', changeType: 'renew', changeValue: userid });
      onCancel();
    } catch (errorInfo) {
      console.log('Failed:', errorInfo);
    }
  };

  const renderTitle = () => {
    return (
      <div>
        分配归属 (已选择<a>{rowCount}</a>个联系人)
      </div>
    );
  };

  useEffect(() => {
    if (visible) {
      usersRun();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  return (
    <Modal
      title={renderTitle()}
      width={450}
      bodyStyle={{ padding: '28px 28px' }}
      destroyOnClose
      open={visible}
      onCancel={onCancel}
      okText="提交"
      onOk={handleSubmit}
      confirmLoading={loading}
    >
      <div>
        <Form layout="vertical" form={form} size="large" initialValues={{ userid: 'null' }}>
          <Form.Item
            label="联系人归属"
            name="userid"
            rules={[{ required: true, message: '请选择联系人归属' }]}
          >
            <Select
              style={{ width: '100%' }}
              optionLabelProp="label"
              showSearch={true}
              optionFilterProp="label"
            >
              <Select.Option value="null" label="不设置归属" key="null">
                <div>不设置归属</div>
              </Select.Option>
              {usersData?.map((user: any) => {
                const { nickname, userid, email } = user;
                return (
                  <Select.Option value={userid} label={`${nickname} (${email})`} key={userid}>
                    <div>
                      {nickname} ({email})
                    </div>
                  </Select.Option>
                );
              })}
            </Select>
          </Form.Item>
        </Form>
      </div>
    </Modal>
  );
};

export default ContactsAssign;
