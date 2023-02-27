import React from 'react';
import { Modal, Button, Input, message } from 'antd';
import { useSetState } from 'ahooks';
import { apiPartnerInviteBind } from '@/services/partner';

interface FormProps {
  visible: boolean;
  onCancel: () => void;
}

const WriteModal: React.FC<FormProps> = (props) => {
  const { visible, onCancel } = props;
  const [state, setState] = useSetState({
    inviteCode: '',
  });

  const onBinding = async () => {
    const { inviteCode } = state;
    const success = await apiPartnerInviteBind({ inviteCode });
    if (success) {
      message.success('提交成功');
      onCancel();
    }
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
        <div style={{ fontSize: 16, fontWeight: 550 }}>请输入邀请码</div>
        <Input
          style={{ width: 160, marginTop: 24 }}
          size="large"
          placeholder="请输入邀请码"
          value={state.inviteCode}
          onChange={(e) => setState({ inviteCode: e.target.value })}
        />
        <div style={{ marginTop: 24, marginBottom: 24, color: '#999999' }}>
          填写他的人邀请码，可获得无限邮件追踪
        </div>
        <Button type="primary" onClick={onBinding}>
          提交
        </Button>
      </div>
    </Modal>
  );
};

export default WriteModal;
