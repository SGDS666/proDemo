import React from 'react';
import { Modal } from 'antd';

const Preview: React.FC<any> = (props) => {
  const { visible, onCancel, html } = props;

  return (
    <Modal
      title={'邮件内容预览'}
      width={1000}
      bodyStyle={{ minHeight: 400 }}
      destroyOnClose
      open={visible}
      onCancel={onCancel}
      onOk={onCancel}
    >
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </Modal>
  );
};

export default Preview;
