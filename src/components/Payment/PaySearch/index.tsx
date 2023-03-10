import { useEffect } from 'react';
import {
  Modal,
  Divider,
  Radio,
  message,
  Row,
  Col,
  Tabs,
  Space,
  Checkbox,
  InputNumber,
  Button,
  Alert,
} from 'antd';
import { WechatOutlined, AlipayCircleOutlined } from '@ant-design/icons';
import { useSetState } from 'ahooks';
import numeral from 'numeral';
import { apiOrderCreate, apiGoodsList } from '@/services/payment';
import './style.less';
import { useRequest } from '@umijs/max';

interface OperationModalProps {
  visible: boolean;
  onCancel: () => void;
  openQrcode: (id: string, app: string, url: string) => void;
  actionReload: () => void;
}

const PaySearch: React.FC<OperationModalProps> = (props) => {
  const { visible, onCancel, openQrcode, actionReload } = props;
  const [state, setState] = useSetState({
    payApp: 'alipay',
    payYuan: 0,
    goodsId: '',
    qrcodeVisiable: true,
    codeUrl: '',
    goodsList: [],
    tips: '',
    uid: '',
    tabKey: 'searchMonth',
    price: 0,
    goodsCount: 1,
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

  const { run: goodsRun } = useRequest(apiGoodsList, {
    manual: true,
    onSuccess: (data) => {
      if (data) {
        const { goodsList, uid, balance, commission } = data;
        setState({
          goodsList,
          uid,
          balance: balance / 10,
          commission: commission / 10,
          useBalance: false,
          payBalance: '',
          payCommission: '',
          useCommission: false,
        });
        if (goodsList && goodsList.length) {
          const { id, price, tips } = goodsList[0];
          setState({ goodsId: id, payYuan: price / 100, tips, price });
        }
      }
    },
  });

  useEffect(() => {
    if (visible) {
      const { tabKey } = state;
      goodsRun({ type: tabKey });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const { run: orderRun, loading: orderLoading } = useRequest(apiOrderCreate, {
    manual: true,
    onSuccess: (data: any) => {
      if (data) {
        const { code_url, return_code, id, return_msg } = data;
        const { payApp } = state;
        if (return_code === 'finished') {
          onCancel();
          message.success('????????????');
          actionReload();
        } else if (return_code === 'SUCCESS' || `${return_code}` === '10000') {
          onCancel();
          openQrcode(id, payApp, code_url);
        } else if (return_msg) {
          message.error('?????????????????????', return_msg);
        }
      }
    },
  });

  const handleSubmit = async () => {
    const {
      payApp,
      payYuan,
      goodsId,
      useBalance,
      useCommission,
      payBalance,
      payCommission,
      goodsCount,
      tabKey,
    } = state;
    if (!goodsId) {
      message.error('???????????????');
      return;
    }
    if (!goodsCount) {
      message.error('?????????????????????');
      return;
    }
    await orderRun({
      payApp,
      payYuan,
      goods_type: tabKey,
      goodsId,
      goodsCount,
      useBalance,
      useCommission,
      payBalance,
      payCommission,
    });
  };

  const myFooter = () => {
    return (
      <div>
        <Button onClick={onCancel}>??????</Button>
        <Button type="primary" onClick={handleSubmit} loading={orderLoading}>
          ????????????
        </Button>
      </div>
    );
  };

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
            {worth ? <div className="bestText">??????</div> : null}
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
                ???
                <span style={{ color: '#f60', fontSize: '26px', fontWeight: 700 }}>
                  {numeral(price / 100).format('0,0')}
                </span>
                <span
                  style={{
                    paddingLeft: 4,
                    color: '#ca963b',
                    fontSize: '16px',
                    textDecoration: 'line-through',
                  }}
                >
                  {numeral(oriPrice / 100).format('0,0')}
                </span>
              </div>
            ) : (
              <div>
                ???{' '}
                <span style={{ color: '#f60', fontSize: '26px', fontWeight: 700 }}>
                  {numeral(price / 100).format('0,0')}
                </span>
              </div>
            )}
            {state.tabKey === 'searchMonth' ? (
              <div style={{ color: '#b57d1d' }}>
                {numeral(price / 100 / count).format('0,0.000')} ???/???
              </div>
            ) : (
              <div style={{ color: '#b57d1d' }}>
                {numeral(price / 100 / count / 12).format('0,0.000')} ???/???
              </div>
            )}
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
          {worth ? <div className="bestText">??????</div> : null}
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
              ???
              <span style={{ color: '#f60', fontSize: '26px', fontWeight: 700 }}>
                {numeral(price / 100).format('0,0')}
              </span>
              <span
                style={{
                  paddingLeft: 4,
                  color: '#ca963b',
                  fontSize: '16px',
                  textDecoration: 'line-through',
                }}
              >
                {numeral(oriPrice / 100).format('0,0')}
              </span>
            </div>
          ) : (
            <div>
              ???{' '}
              <span style={{ color: '#f60', fontSize: '26px', fontWeight: 700 }}>
                {numeral(price / 100).format('0,0')}
              </span>
            </div>
          )}
          {state.tabKey === 'searchMonth' ? (
            <div style={{ color: '#b57d1d' }}>
              {numeral(price / 100 / count).format('0,0.000')} ???/???
            </div>
          ) : (
            <div style={{ color: '#b57d1d' }}>
              {numeral(price / 100 / count / 12).format('0,0.000')} ???/???
            </div>
          )}
        </div>
      </Radio.Button>
    );
  };

  const payAppChange = (value: string) => {
    setState({ payApp: value });
  };

  const onTabChange = (activeKey: string) => {
    setState({ tabKey: activeKey });
    goodsRun({ type: activeKey });
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
        {state.tabKey === 'searchMonth' ? (
          <div style={style1}>
            ?????? <span style={{ color: '#e9b966', fontWeight: 700 }}>???</span> ??????:
          </div>
        ) : (
          <div style={style1}>
            ?????? <span style={{ color: '#ff7b64', fontWeight: 700 }}>???</span> ??????:
          </div>
        )}
        <div>
          <Radio.Group buttonStyle="outline" optionType="button" value={state.goodsId}>
            {state.goodsList.map((item, idx) => goodsButtons(item, idx))}
          </Radio.Group>
          {state.tips ? <Alert message={state.tips} type="info" showIcon /> : null}
        </div>
        <Divider />
        {state.balance ? (
          <>
            <Row>
              <Col span={3}>
                <span style={style1}>????????????</span>
              </Col>
              <Col span={20}>
                <Space>
                  <Checkbox
                    checked={state.useBalance}
                    onChange={(e) => onUseBalanceChange(e.target.checked)}
                  >
                    {' '}
                    ???????????????????????? (??????????????????
                    <span style={{ color: '#ff8a00' }}>
                      ???{numeral(state.balance / 100).format('0,0.00')}
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
                  ???
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
                <span style={style1}>????????????</span>
              </Col>
              <Col span={20}>
                <Space>
                  <Checkbox
                    checked={state.useCommission}
                    onChange={(e) => onUseCommissionChange(e.target.checked)}
                  >
                    {' '}
                    ???????????????????????? (??????????????????
                    <span style={{ color: '#ff8a00' }}>
                      ???{numeral(state.commission / 100).format('0,0.00')}
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
                  ???
                </Space>
              </Col>
            </Row>
            <Divider />
          </>
        ) : null}
        <div>
          <span style={style1}>????????????:</span>
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
                      ????????????
                    </div>
                    <div style={{ fontSize: 14, color: '#999999' }}>????????? ???????????????</div>
                    <div style={{ fontSize: 14, color: '#999999' }}>???????????????????????????</div>
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
                      ???{numeral(state.payYuan).format('0,0.00')}
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
                      ???????????????
                    </div>
                    <div style={{ fontSize: 14, color: '#999999' }}>????????? ??????????????????</div>
                    <div style={{ fontSize: 14, color: '#999999' }}>???????????????????????????</div>
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
                      ???{numeral(state.payYuan).format('0,0.00')}
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
      title="????????????"
      width={860}
      destroyOnClose
      open={visible}
      maskClosable={false}
      onCancel={onCancel}
      footer={myFooter()}
    >
      <div className="class-vip-info">
        <Tabs
          type="card"
          size="large"
          onChange={onTabChange}
          activeKey={state.tabKey}
          items={[
            {
              tabKey: "searchMonth",
              key: "searchMonth",
              label: (
                <div style={{ width: 336, fontSize: 20, textAlign: 'center', fontWeight: 700 }}>
                  <img width={24} src="https://files.laifaxin.com/www/svip.jpg" /> ???????????????
                </div>
              ),
              children: getModalContent()
            },
            {
              key: "searchYear",
              tabKey: "searchYear",
              label: (
                <div style={{ width: 336, fontSize: 20, textAlign: 'center', fontWeight: 700 }}>
                  <img width={24} src="https://files.laifaxin.com/www/vip.jpg" /> ???????????????
                </div>
              ),
              children: getModalContent()
            }
          ]}
        >

        </Tabs>
      </div>
    </Modal>
  );
};

export default PaySearch;
