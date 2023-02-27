import React, { useEffect } from 'react';
import {
  Modal,
  Divider,
  Radio,
  message,
  Row,
  Col,
  Alert,
  InputNumber,
  Checkbox,
  Space,
} from 'antd';
import styles from './style.less';
import { WechatOutlined, AlipayCircleOutlined } from '@ant-design/icons';
import { useSetState } from 'ahooks';
import numeral from 'numeral';
import { apiOrderCreate, apiGoodsList } from '@/services/payment';
import { useRequest } from '@umijs/max';

interface OperationModalProps {
  visible: boolean;
  onCancel: () => void;
  openQrcode: (id: string, app: string, url: string) => void;
  actionReload: () => void;
}

const PayPackage: React.FC<OperationModalProps> = (props) => {
  const { visible, onCancel, openQrcode, actionReload } = props;
  const [state, setState] = useSetState({
    testLoading: false,
    submitLoading: false,
    payApp: 'alipay',
    payYuan: 0,
    goodsId: '',
    qrcodeVisiable: true,
    codeUrl: '',
    goodsList: [],
    price: 0,
    goodsCount: 0,
    tips: '',
    uid: '',
    balance: 0,
    commission: 0,
    useBalance: false,
    payBalance: '',
    useCommission: false,
    payCommission: '',
  });

  const onGoodsClick = (id: string, price: number, tips: string) => {
    setState({
      goodsId: id,
      payYuan: price / 100,
      price,
      goodsCount: 1,
      tips,
      useBalance: false,
      payBalance: '',
      payCommission: '',
      useCommission: false,
    });
  };

  const goodsCountChange = (value: any) => {
    const { price } = state;
    const count = parseInt(value, 10);
    setState({
      payYuan: (price * count) / 100,
      goodsCount: count,
      useBalance: false,
      payBalance: '',
      payCommission: '',
      useCommission: false,
    });
  };

  const { run: goodsRun } = useRequest(apiGoodsList, {
    manual: true,
    onSuccess: (data) => {
      if (data) {
        const { goodsList, uid, balance, commission } = data;
        setState({ goodsList, uid, balance: balance / 10, commission: commission / 10 }); // 统一转成分单位
        if (goodsList && goodsList.length > 0) {
          const { id, price, tips } = goodsList[0];
          onGoodsClick(id, price, tips);
        }
      }
    },
  });

  useEffect(() => {
    if (visible) {
      goodsRun({ type: 'sendCount' });
      setState({ payYuan: 0 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const { run: createRun, loading: createLoading } = useRequest(apiOrderCreate, {
    manual: true,
    onSuccess: (data: any) => {
      if (data) {
        const { code_url, return_code, return_msg, id, payApp } = data;
        if (return_code === 'finished') {
          onCancel();
          message.success('支付成功');
          actionReload();
        } else if (return_code === 'SUCCESS' || `${return_code}` === '10000') {
          onCancel();
          openQrcode(id, payApp, code_url);
        } else if (return_msg) {
          message.error('订单创建失败：', return_msg);
        }
      }
    },
  });

  const handleSubmit = async () => {
    const {
      payApp,
      payYuan,
      goodsId,
      goodsCount,
      useBalance,
      useCommission,
      payBalance,
      payCommission,
    } = state;
    if (!goodsId) {
      message.error('请选择套餐');
      return;
    }
    if (!goodsCount) {
      message.error('请选择套餐数量');
      return;
    }
    createRun({
      payApp,
      payYuan,
      goods_type: 'balance',
      goodsId,
      goodsCount,
      useBalance,
      useCommission,
      payBalance,
      payCommission,
    });
  };

  const modalFooter = { okText: '确认支付', onOk: handleSubmit, onCancel };

  const style1 = { fontSize: 16, fontWeight: 525 };
  const style2 = { fontSize: 16, fontWeight: 400 };

  const goodsButtons = (item: any, idx: number) => {
    const { id, name, price, oriPrice, tips, count, worth } = item;
    const marginLeft = idx ? 14 : 0;
    if (state.goodsId === id) {
      return (
        <Radio.Button
          key={id}
          style={{
            ...style2,
            width: 180,
            height: 120,
            marginLeft,
            marginBottom: 12,
            textAlign: 'center',
            backgroundColor: '#fffaeb',
          }}
          value={id}
          onClick={() => onGoodsClick(id, price, tips)}
        >
          <div>
            {worth ? <div className={styles.bestText}>超值</div> : null}
            <div
              style={{
                color: '#03081a',
                fontSize: '20px',
                fontWeight: 700,
                lineHeight: '28px',
                paddingTop: 12,
              }}
            >
              {name}
            </div>
            {oriPrice && oriPrice > price ? (
              <div>
                ￥
                <span style={{ color: '#f60', fontSize: '26px', fontWeight: 700 }}>
                  {price / 100}
                </span>
                <span
                  style={{
                    paddingLeft: 4,
                    color: '#ca963b',
                    fontSize: '20px',
                    textDecoration: 'line-through',
                  }}
                >
                  {oriPrice / 100}
                </span>
              </div>
            ) : (
              <div>
                ￥{' '}
                <span style={{ color: '#f60', fontSize: '26px', fontWeight: 700 }}>
                  {price / 100}
                </span>
              </div>
            )}
            <div style={{ color: '#b57d1d' }}>
              {numeral(price / 100 / count).format('0,0.000')} 元/封
            </div>
          </div>
        </Radio.Button>
      );
    }
    return (
      <Radio.Button
        key={id}
        style={{
          ...style2,
          width: 180,
          height: 120,
          marginLeft,
          marginBottom: 12,
          textAlign: 'center',
        }}
        value={id}
        onClick={() => onGoodsClick(id, price, tips)}
      >
        <div>
          {worth ? <div className={styles.bestText}>超值</div> : null}
          <div
            style={{
              color: '#03081a',
              fontSize: '20px',
              fontWeight: 700,
              lineHeight: '28px',
              paddingTop: 12,
            }}
          >
            {name}
          </div>
          {oriPrice && oriPrice > price ? (
            <div>
              ￥
              <span style={{ color: '#f60', fontSize: '26px', fontWeight: 700 }}>
                {price / 100}
              </span>
              <span
                style={{
                  paddingLeft: 4,
                  color: '#ca963b',
                  fontSize: '20px',
                  textDecoration: 'line-through',
                }}
              >
                {oriPrice / 100}
              </span>
            </div>
          ) : (
            <div>
              ￥{' '}
              <span style={{ color: '#f60', fontSize: '26px', fontWeight: 700 }}>
                {price / 100}
              </span>
            </div>
          )}
          <div style={{ color: '#b57d1d' }}>
            {numeral(price / 100 / count).format('0,0.000')} 元/封
          </div>
        </div>
      </Radio.Button>
    );
  };

  const payAppChange = (value: string) => {
    setState({ payApp: value });
  };

  const onUseBalanceChange = (checked: boolean) => {
    setState({ useBalance: checked });
    const { price, balance, goodsCount } = state;
    if (checked) {
      let payBalance = `${balance / 100}`;
      if (balance >= price * goodsCount) {
        payBalance = `${numeral((price / 100) * goodsCount).format('0.00')}`;
      }
      const payYuan = (price * goodsCount - parseFloat(payBalance) * 100) / 100;
      setState({ payBalance, payYuan, useCommission: false, payCommission: '' });
    } else {
      const payYuan = (price * goodsCount) / 100;
      setState({ payYuan, payBalance: '' });
    }
  };

  const onPayBalanceChange = (yuan: string) => {
    const { price, balance, goodsCount } = state;
    const value = parseFloat(yuan) * 100;
    if (value <= price * goodsCount && value <= balance) {
      const payYuan = (price * goodsCount - value) / 100;
      setState({ payBalance: yuan, payYuan });
    }
  };

  const onUseCommissionChange = (checked: boolean) => {
    setState({ useCommission: checked });
    const { price, commission, goodsCount } = state;
    if (checked) {
      let payCommission = `${commission / 100}`;
      if (commission >= price * goodsCount) {
        payCommission = `${numeral((price / 100) * goodsCount).format('0.00')}`;
      }
      const payYuan = (price * goodsCount - parseFloat(payCommission) * 100) / 100;
      setState({ payCommission, payYuan, useBalance: false, payBalance: '' });
    } else {
      const payYuan = (price * goodsCount) / 100;
      setState({ payYuan, payCommission: '' });
    }
  };

  const onPayCommissionChange = (yuan: string) => {
    const { price, commission, goodsCount } = state;
    const value = parseFloat(yuan) * 100;
    if (value <= price * goodsCount && value <= commission) {
      const payYuan = (price * goodsCount - value) / 100;
      setState({ payCommission: yuan, payYuan });
    }
  };

  const getModalContent = () => {
    return (
      <>
        <div>
          <Radio.Group buttonStyle="outline" optionType="button" value={state.goodsId}>
            {state.goodsList.map((item, idx) => goodsButtons(item, idx))}
          </Radio.Group>
          {state.tips ? <Alert message={state.tips} banner /> : null}
        </div>
        <Divider />
        <Row>
          <Col span={3}>
            <span style={style1}>购买数量</span>
          </Col>
          <Col span={20}>
            <Space>
              <InputNumber
                value={state.goodsCount}
                onChange={goodsCountChange}
                min={1}
                max={100}
                step={1}
              />
              <div style={{ marginTop: 5, fontSize: 12, color: '#999999' }}>选择您要购买的数量</div>
            </Space>
          </Col>
        </Row>
        <Divider />
        {state.balance ? (
          <>
            <Row>
              <Col span={3}>
                <span style={style1}>使用余额</span>
              </Col>
              <Col span={20}>
                <Space>
                  <Checkbox
                    checked={state.useBalance}
                    onChange={(e) => onUseBalanceChange(e.target.checked)}
                  >
                    {' '}
                    使用账户余额抵扣 (当前账户余额
                    <span style={{ color: '#ff8a00' }}>
                      ￥{numeral(state.balance / 100).format('0,0.00')}
                    </span>
                    )
                  </Checkbox>
                  <InputNumber
                    disabled={!state.useBalance}
                    value={state.payBalance}
                    onChange={onPayBalanceChange}
                    min="0.01"
                    max="10000.00"
                    stringMode
                    step={0.01}
                    size="small"
                  />
                  元
                </Space>
              </Col>
            </Row>
            <Divider />
          </>
        ) : null}
        {state.commission ? (
          <>
            <Row>
              <Col span={3}>
                <span style={style1}>使用佣金</span>
              </Col>
              <Col span={20}>
                <Space>
                  <Checkbox
                    checked={state.useCommission}
                    onChange={(e) => onUseCommissionChange(e.target.checked)}
                  >
                    {' '}
                    使用账户佣金抵扣 (当前账户佣金
                    <span style={{ color: '#ff8a00' }}>
                      ￥{numeral(state.commission / 100).format('0,0.00')}
                    </span>
                    )
                  </Checkbox>
                  <InputNumber
                    disabled={!state.useCommission}
                    value={state.payCommission}
                    onChange={onPayCommissionChange}
                    min="0.01"
                    max="10000.00"
                    stringMode
                    step={0.01}
                    size="small"
                  />
                  元
                </Space>
              </Col>
            </Row>
            <Divider />
          </>
        ) : null}
        <div>
          <span style={style1}>支付方式:</span>
        </div>
        <div>
          <Radio.Group
            buttonStyle="outline"
            optionType="button"
            onChange={(e) => payAppChange(e.target.value)}
            value={state.payApp}
          >
            <Radio.Button
              value="wechat"
              style={{
                height: 160,
                width: 360,
                marginRight: 20,
                background: state.payApp === 'wechat' ? '#fffaeb' : '#fff',
              }}
            >
              <div style={{ marginTop: 24 }}>
                <Row>
                  <Col span={11}>
                    <div style={{ fontSize: 24, fontWeight: 700, paddingBottom: 12 }}>
                      <WechatOutlined style={{ marginRight: 10, color: '#52c41a' }} />
                      微信支付
                    </div>
                    <div style={{ fontSize: 14, color: '#999999' }}>请使用 微信扫一扫</div>
                    <div style={{ fontSize: 14, color: '#999999' }}>扫描二维码支付订单</div>
                  </Col>
                  <Col span={13} style={{ textAlign: 'center' }}>
                    <div
                      style={{
                        width: 160,
                        fontSize: 32,
                        marginTop: 30,
                        fontWeight: 700,
                        color: state.payApp === 'wechat' ? '#f60' : '#000',
                      }}
                    >
                      ￥{numeral(state.payYuan).format('0,0.00')}
                    </div>
                  </Col>
                </Row>
              </div>
            </Radio.Button>
            <Radio.Button
              value="alipay"
              style={{
                height: 160,
                width: 360,
                background: state.payApp === 'alipay' ? '#fffaeb' : '#fff',
              }}
            >
              <div style={{ marginTop: 24 }}>
                <Row>
                  <Col span={12}>
                    <div style={{ fontSize: 24, fontWeight: 700, paddingBottom: 12 }}>
                      <AlipayCircleOutlined style={{ marginRight: 10, color: '#027aff' }} />
                      支付宝支付
                    </div>
                    <div style={{ fontSize: 14, color: '#999999' }}>请使用 支付宝扫一扫</div>
                    <div style={{ fontSize: 14, color: '#999999' }}>扫描二维码支付订单</div>
                  </Col>
                  <Col span={12} style={{ textAlign: 'center' }}>
                    <div
                      style={{
                        width: 160,
                        fontSize: 32,
                        marginTop: 30,
                        fontWeight: 700,
                        color: state.payApp === 'alipay' ? '#f60' : '#000',
                      }}
                    >
                      ￥{numeral(state.payYuan).format('0,0.00')}
                    </div>
                  </Col>
                </Row>
              </div>
            </Radio.Button>
          </Radio.Group>
        </div>
        <div style={{ marginBottom: 30 }}> </div>
      </>
    );
  };

  return (
    <Modal
      title="群发额度购买"
      className={styles.standardListForm}
      width={860}
      destroyOnClose
      open={visible}
      confirmLoading={createLoading}
      maskClosable={false}
      {...modalFooter}
    >
      {getModalContent()}
    </Modal>
  );
};

export default PayPackage;
