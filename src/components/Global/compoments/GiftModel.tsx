import React, { useEffect } from 'react';
import { Modal, Button, message, Tooltip, Card, Row, Col } from 'antd';
import { useRequest, history } from '@umijs/max';
import { apiVipGet, apiVipGiftStatus } from '@/services/vip';
import { useSetState } from 'ahooks';
import { GiftTwoTone } from '@ant-design/icons';
import PayNewUser from '@/components/Payment/PayNewUser';
import PayQrocde from '@/components/Payment/PayQrcode';

interface CreateFormProps {
  visible: boolean;
  onCancel: () => void;
  actionReload: () => void;
}

const GiftModel: React.FC<CreateFormProps> = (props) => {
  const { visible, onCancel, actionReload } = props;
  const [state, setState] = useSetState<Record<string, any>>({
    vipGifts: {},
    giftData: {},
    vip: 0,
    app: 'wechat',
    codeUrl: '',
    id: '',
    qrcodeVisible: false,
    payVipVisible: false,
    tips: false,
    newUserGift: false,
    firstTimeGift: false,
    payNewUserVisible: false,
  });
  const { run: statusRun } = useRequest(apiVipGiftStatus, {
    manual: true,
    onSuccess: (data) => {
      setState({ ...data });
    },
  });

  const { run: getRun } = useRequest(apiVipGet, {
    manual: true,
    onSuccess: () => {
      message.success('领取成功');
      statusRun();
      actionReload();
    },
  });

  const onClickGetGift = () => {
    Modal.confirm({
      title: `购买VIP`,
      content: `VIP可以拥有更多特权`,
      onOk: () => history.push('/expenses/purchase?type=svip'),
    });
  };

  const renderGetButton = (giftType: string, todayCount: number) => {
    const { vip } = state;
    if (!vip) {
      return (
        <Tooltip title="购买VIP可领取">
          <Button type="primary" onClick={() => onClickGetGift()}>
            领取
          </Button>
        </Tooltip>
      );
    }
    if (todayCount) {
      return (
        <Button type="primary" disabled>
          已领取
        </Button>
      );
    }
    return (
      <Button
        type="primary"
        onClick={(e) => {
          e.stopPropagation();
          getRun({ giftType });
        }}
      >
        领取
      </Button>
    );
  };

  const renderOneYunGift = () => {
    const { firstTimeGift } = state;
    if (firstTimeGift) {
      return (
        <Button type="primary" disabled>
          已购买
        </Button>
      );
    }
    return (
      <Button
        type="primary"
        onClick={(e) => {
          e.stopPropagation();
          setState({ payNewUserVisible: true });
        }}
      >
        购买
      </Button>
    );
  };

  useEffect(() => {
    if (visible) {
      statusRun();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const openQrcode = (id: string, app: string, codeUrl: string) => {
    setState({ id, app, codeUrl, qrcodeVisible: true });
  };

  return (
    <Modal
      destroyOnClose
      title={false}
      open={visible}
      onCancel={() => onCancel()}
      footer={null}
      bodyStyle={{ padding: 12 }}
    >
      <Card
        title="每日会员福利"
        extra={state.vip ? null : <a href="/expenses/purchase?type=svip">升级VIP</a>}
      >
        {Object.keys(state.giftData).map((k: any) => {
          const values = state.giftData[k];
          const { name, vipCount, todayCount } = values;
          return (
            <Row key={k}>
              <Col span={16}>
                <span style={{ fontSize: 20, fontWeight: 600 }}>{name}</span>
                <div style={{ color: '#888', fontSize: 12 }}>每日免费数量 {vipCount}</div>
              </Col>
              <Col span={8} style={{ paddingTop: 12 }}>
                {renderGetButton(k, todayCount)}
              </Col>
            </Row>
          );
        })}
      </Card>
      <Card title="首充礼包(5折)" style={{ marginTop: 12 }}>
        <Row key="firstTime">
          <Col span={16}>
            <span style={{ fontSize: 20, fontWeight: 600 }}>
              <GiftTwoTone style={{ fontSize: 20 }} /> 新用户优惠套餐
            </span>
            <div style={{ color: '#888', fontSize: 12 }}>获客10000 群发10000 </div>
          </Col>
          <Col span={8} style={{ paddingTop: 12 }}>
            {renderOneYunGift()}
          </Col>
        </Row>
      </Card>
      <PayNewUser
        visible={state.payNewUserVisible}
        onCancel={() => setState({ payNewUserVisible: false })}
        openQrcode={(id, app, url) => openQrcode(id, app, url)}
        actionReload={() => statusRun()}
      />
      <PayQrocde
        visible={state.qrcodeVisible}
        codeUrl={state.codeUrl}
        app={state.app}
        id={state.id}
        onCancel={() => setState({ qrcodeVisible: false })}
        actionReload={() => statusRun()}
      />
    </Modal>
  );
};

export default GiftModel;
