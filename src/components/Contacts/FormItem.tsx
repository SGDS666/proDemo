import React from 'react';
import { Form } from 'antd';
import ContactField from './ContactField';

const FormItem: React.FC<any> = (props) => {
  const { item } = props;
  const { dataIndex, title, formItemProps, tip } = item;

  if (!dataIndex) return null;

  if (dataIndex === 'email') {
    return (
      <Form.Item
        {...formItemProps}
        label={title}
        name={dataIndex}
        tooltip={tip}
        rules={[
          {
            required: true,
            message: '请输入邮箱地址!',
          },
          {
            type: 'email',
            message: '邮箱地址格式错误!',
          },
        ]}
      >
        <ContactField field={item} />
      </Form.Item>
    );
  }

  return (
    <Form.Item {...formItemProps} label={title} name={dataIndex} tooltip={tip}>
      <ContactField field={item} />
    </Form.Item>
  );
};

export default FormItem;
