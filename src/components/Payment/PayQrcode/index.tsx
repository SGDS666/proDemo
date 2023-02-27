import React, { useEffect, useState } from 'react';
import { Modal, Row, Col, Statistic, message } from 'antd';
import styles from './style.less';
import { WechatOutlined, ScanOutlined, AlipayCircleOutlined } from '@ant-design/icons';
import { apiOrderCheck } from '@/services/payment';
import { QRCodeSVG } from 'qrcode.react';
import { useRequest } from '@umijs/max';

const { Countdown } = Statistic;

interface OperationModalProps {
  visible: boolean;
  onCancel: () => void;
  actionReload: () => void;
  codeUrl: string;
  app: string;
  id: string;
}

const PayQrcode: React.FC<OperationModalProps> = (props) => {
  const { visible, onCancel, codeUrl, app, id, actionReload } = props;
  const [timeout, setTimeout] = useState(Date.now());
  const { run: checkRun, cancel: checkCancel } = useRequest(apiOrderCheck, {
    manual: true,
    pollingInterval: 2000,
    onSuccess: (data) => {
      if (data) {
        const { done } = data;
        if (done) {
          message.success('付款成功.');
          checkCancel();
          onCancel();
          actionReload();
        }
      }
    },
  });

  const onClose = () => {
    checkCancel();
    onCancel();
  };

  useEffect(() => {
    if (visible) {
      const t = Date.now() + 1000 * 300;
      setTimeout(t);
      checkRun({ id });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const getModalContent = () => {
    return (
      <>
        <div className={styles.container}>
          <div style={{ fontSize: 32, textAlign: 'center', marginTop: 32, fontWeight: 700 }}>
            {app === 'wechat' ? (
              <WechatOutlined style={{ color: '#52c41a', marginRight: 10 }} />
            ) : (
              <AlipayCircleOutlined style={{ color: '#108ee9', marginRight: 10 }} />
            )}
            {app === 'wechat' ? <span>微信支付</span> : <span>支付宝支付</span>}
          </div>
          <div style={{ fontSize: 16, textAlign: 'center', marginTop: 10, color: '#6d6d6d' }}>
            二维码有效时长为5分钟，请尽快支付
          </div>
          <Countdown title={false} value={timeout} format="m 分 s 秒" onFinish={onClose} />
          {visible ? (
            <div className={styles.qrcode}>
              <QRCodeSVG value={codeUrl} size={138} />
            </div>
          ) : null}
          <div style={{ marginTop: 10, fontSize: 16, color: '#6d6d6d' }}>
            <Row>
              <Col>
                {app === 'wechat' ? (
                  <ScanOutlined style={{ color: '#52c41a', fontSize: 42, marginTop: 4 }} />
                ) : (
                  <ScanOutlined style={{ color: '#108ee9', fontSize: 42, marginTop: 4 }} />
                )}
              </Col>
              <Col>
                {app === 'wechat' ? <div>请使用微信扫一扫</div> : <div>请使用支付宝扫一扫</div>}
                <div>扫描二维码支付</div>
              </Col>
            </Row>
          </div>
        </div>
      </>
    );
  };

  return (
    <Modal
      title="支付"
      className={styles.standardListForm}
      width={820}
      bodyStyle={{ padding: '0 0 0' }}
      destroyOnClose
      open={visible}
      footer={false}
      onCancel={onClose}
      maskClosable={false}
    >
      {getModalContent()}
    </Modal>
  );
};

export default PayQrcode;
