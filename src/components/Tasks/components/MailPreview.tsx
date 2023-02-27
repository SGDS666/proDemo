import React, { useEffect } from 'react';
import { Modal, Descriptions, Card } from 'antd';
import { useSetState } from 'ahooks';
import { randomArray } from '@/utils/common';
import { useRequest } from '@umijs/max';
import { apiTaskPreview } from '@/services/tasks';

interface OperationModalProps {
  visible: boolean;
  onCancel: () => void;
  taskValues: any;
}

const MailPreview: React.FC<OperationModalProps> = (props) => {
  const { visible, onCancel, taskValues } = props;
  const [state, setState] = useSetState({
    email: '',
    subject: '',
    html: '',
  });

  const { run: previewRun, loading: previewLoading } = useRequest(apiTaskPreview, {
    manual: true,
    onSuccess: (data: any) => {
      const { email, subject, html } = data;
      console.log(email, subject, html);
      setState({ email, subject, html });
    },
  });

  const getPreviewContent = () => {
    const { cids, contentsIds } = taskValues;
    const cid = randomArray(cids);
    const contentsId = randomArray(contentsIds);
    previewRun({ cid, contentsId });
  };

  useEffect(() => {
    if (visible) {
      getPreviewContent();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const getModalContent = () => {
    return (
      <>
        <Descriptions column={1}>
          <Descriptions.Item label="收件人">{state.email}</Descriptions.Item>
          <Descriptions.Item label="邮件主题">{state.subject}</Descriptions.Item>
        </Descriptions>
        <Card>
          <div
            style={{ maxWidth: 600, maxHeight: 480, overflow: 'auto' }}
            dangerouslySetInnerHTML={{ __html: state.html }}
          />
        </Card>
      </>
    );
  };

  const modalFooter = { okText: '更换预览', onOk: getPreviewContent, onCancel };

  return (
    <Modal
      title="邮件预览"
      width={800}
      destroyOnClose
      open={visible}
      confirmLoading={previewLoading}
      {...modalFooter}
    >
      {getModalContent()}
    </Modal>
  );
};

export default MailPreview;
