import React from 'react';
import { Modal, Button, message } from 'antd';
import copy from 'copy-to-clipboard';

interface FormProps {
  visible: boolean;
  onCancel: () => void;
  inviteCode: string;
  inviteLink: string;
  inviteCount: number;
}

const CopyModal: React.FC<FormProps> = (props) => {
  const { visible, onCancel, inviteCode, inviteCount, inviteLink } = props;

  const onCopy = () => {
    const msg = `填写我的邀请码：${inviteCode}，免费领取 不限量 邮箱验证/邮件群发/邮件追踪（特权），非常好用！${inviteLink}`;
    copy(msg);
    message.success('复制成功');
  };

  return (
    <Modal
      destroyOnClose
      width={420}
      title={null}
      open={visible}
      onCancel={() => onCancel()}
      footer={null}
    >
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 16, fontWeight: 550 }}>邀请码</div>
        <div style={{ fontSize: 48, color: '#558cff', fontWeight: 600 }}>{inviteCode}</div>
        <div>已邀请 {inviteCount}/3</div>
        <div style={{ marginTop: 24, marginBottom: 24, color: '#999999' }}>
          邀请3名好友，可获得不限量邮箱验证特权
        </div>
        <Button type="primary" onClick={onCopy}>
          复制
        </Button>
      </div>
    </Modal>
  );
};

export default CopyModal;
