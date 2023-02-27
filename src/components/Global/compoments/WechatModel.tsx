import React from 'react';
import { Modal, Image } from 'antd';

interface CreateFormProps {
  visible: boolean;
  onCancel: () => void;
}

const WechatModel: React.FC<CreateFormProps> = (props) => {
  const { visible, onCancel } = props;
  return (
    <Modal
      destroyOnClose
      title="打开微信扫描添加客服"
      open={visible}
      onCancel={() => onCancel()}
      footer={null}
      bodyStyle={{ textAlign: 'center' }}
    >
      <Image width={400} src="https://www.laifaxin.com/assets/images/img/apan.png" />
    </Modal>
  );
};

export default WechatModel;
