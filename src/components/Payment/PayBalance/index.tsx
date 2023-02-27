import React, { useEffect } from 'react';
import { Modal, Divider, Radio, message, Row, Col } from 'antd';
import styles from './style.less';
import { WechatOutlined, AlipayCircleOutlined } from '@ant-design/icons';
import { useSetState } from 'ahooks';
import numeral from 'numeral';
import { apiOrderCreate, apiGoodsList } from '@/services/payment';

interface OperationModalProps {
  visible: boolean;
  onCancel: () => void;
  openQrcode: (id: string, app: string, url: string) => void;
}

const PayBalance: React.FC<OperationModalProps> = (props) => {
  const { visible, onCancel, openQrcode } = props;
  const [state, setState] = useSetState({
    testLoading: false,
    submitLoading: false,
    payApp: 'alipay',
    payYuan: 0,
    goodsId: '',
    qrcodeVisiable: true,
    codeUrl: '',
    goodsList: [],
    tips: '',
    uid: '',
  });

  const getGoodsList = async () => {
    const data = await apiGoodsList({ type: 'balance' });
    if (data) {
      const { goodsList, uid } = data;
      setState({ goodsList, uid });
      if (goodsList && goodsList.length) {
        const { id, price, tips } = goodsList[0];
        setState({ goodsId: id, payYuan: price / 100, tips });
      }
    }
  };

  useEffect(() => {
    if (visible) {
      getGoodsList();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const handleSubmit = async () => {
    setState({ submitLoading: true });
    const { payApp, payYuan, goodsId } = state;
    if (payYuan) {
      const data = await apiOrderCreate({
        payApp,
        payYuan,
        goods_type: 'balance',
        goodsId,
        goodsCount: 1,
      });
      if (data) {
        const { code_url, return_code, return_msg, id } = data;
        if (return_code === 'SUCCESS' || `${return_code}` === '10000') {
          onCancel();
          openQrcode(id, payApp, code_url);
        } else {
          message.error(return_msg);
        }
      }
    } else {
      message.error('充值金额不能为0');
    }

    setState({ submitLoading: false });
  };

  const modalFooter = { okText: '确认支付', onOk: handleSubmit, onCancel };

  const style1 = { fontSize: 16, fontWeight: 525, marginLeft: 30 };
  const style2 = { fontSize: 16, fontWeight: 400 };

  const goodsButtons = (item: any) => {
    const { id, name, price, tips } = item;
    return (
      <Radio.Button
        key={id}
        style={{ ...style2, width: 90, marginRight: 12, marginBottom: 12, textAlign: 'center' }}
        value={id}
        onClick={() => setState({ goodsId: id, payYuan: price / 100, tips })}
      >
        {name}
      </Radio.Button>
    );
  };

  const payAppChange = (value: string) => {
    setState({ payApp: value });
  };

  const getModalContent = () => {
    return (
      <>
        <Row>
          <Col span={3}>
            <span style={style1}>充值信息</span>
          </Col>
          <Col span={20}>
            <a style={style2}>充值来发信账号余额</a>
            <p style={style2}>
              用户ID: <a>{state.uid}</a>
            </p>
          </Col>
        </Row>
        <Divider />
        <Row>
          <Col span={3}>
            <span style={style1}>充值金额</span>
          </Col>
          <Col span={20}>
            <div>
              <Radio.Group buttonStyle="outline" optionType="button" value={state.goodsId}>
                {state.goodsList.map((item) => goodsButtons(item))}
              </Radio.Group>
              {state.tips ? (
                <div style={{ marginTop: 0, fontSize: 12, color: '#999999' }}>{state.tips}</div>
              ) : null}
            </div>
          </Col>
        </Row>
        <Divider />
        <Row>
          <Col span={3}>
            <span style={style1}>充值信息</span>
          </Col>
          <Col span={20}>
            <Radio.Group
              buttonStyle="outline"
              optionType="button"
              onChange={(e) => payAppChange(e.target.value)}
              value={state.payApp}
            >
              <Radio.Button value="wechat" style={{ height: 120, width: 325, marginRight: 20 }}>
                <div style={{ marginTop: 10 }}>
                  <Row>
                    <Col span={11}>
                      <div style={{ fontSize: 20 }}>
                        <WechatOutlined style={{ marginRight: 10 }} />
                        微信支付
                      </div>
                      <div style={{ fontSize: 14, color: '#999999' }}>请使用 微信扫一扫</div>
                      <div style={{ fontSize: 14, color: '#999999' }}>扫描二维码支付订单</div>
                    </Col>
                    <Col span={13} style={{ textAlign: 'center' }}>
                      <div style={{ width: 160, fontSize: 32, marginTop: 30 }}>
                        ￥{numeral(state.payYuan).format('0,0.00')}
                      </div>
                    </Col>
                  </Row>
                </div>
              </Radio.Button>
              <Radio.Button value="alipay" style={{ height: 120, width: 325 }}>
                <div style={{ marginTop: 10 }}>
                  <Row>
                    <Col span={11}>
                      <div style={{ fontSize: 20 }}>
                        <AlipayCircleOutlined style={{ marginRight: 10 }} />
                        支付宝支付
                      </div>
                      <div style={{ fontSize: 14, color: '#999999' }}>请使用 支付宝扫一扫</div>
                      <div style={{ fontSize: 14, color: '#999999' }}>扫描二维码支付订单</div>
                    </Col>
                    <Col span={13} style={{ textAlign: 'center' }}>
                      <div style={{ width: 160, fontSize: 32, marginTop: 30 }}>
                        ￥{numeral(state.payYuan).format('0,0.00')}
                      </div>
                    </Col>
                  </Row>
                </div>
              </Radio.Button>
            </Radio.Group>
          </Col>
        </Row>
        <div style={{ marginBottom: 30 }}></div>
      </>
    );
  };

  return (
    <Modal
      title="收银台"
      className={styles.standardListForm}
      width={820}
      bodyStyle={{ padding: '28px 0 0' }}
      destroyOnClose
      open={visible}
      confirmLoading={state.submitLoading}
      maskClosable={false}
      {...modalFooter}
    >
      {getModalContent()}
    </Modal>
  );
};

export default PayBalance;
