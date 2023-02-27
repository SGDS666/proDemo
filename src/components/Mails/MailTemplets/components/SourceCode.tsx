import React, { FC } from 'react';
import { Modal } from 'antd';

const SourceCode: FC<any> = (props) => {
  const { visible, onCancel, html } = props;

  return (
    <Modal
      title={'邮件内容源码'}
      width={1000}
      bodyStyle={{ minHeight: 400 }}
      destroyOnClose
      open={visible}
      onCancel={onCancel}
      onOk={onCancel}
    >
      {html}
    </Modal>
  );
};

export default SourceCode;
