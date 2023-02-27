import type { FC } from 'react';
import { useState } from 'react';
import React, { useEffect } from 'react';
import { Modal } from 'antd';

const SignPreview: FC<any> = (props) => {
  const { visible, onCancel, current } = props;
  const [html, setHtml] = useState('');

  useEffect(() => {
    if (visible) {
      const { content } = current;
      setHtml(content);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  return (
    <Modal
      title={'签名预览'}
      width={400}
      bodyStyle={{ minHeight: 220 }}
      destroyOnClose
      open={visible}
      onCancel={onCancel}
      onOk={onCancel}
      footer={false}
    >
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </Modal>
  );
};

export default SignPreview;
