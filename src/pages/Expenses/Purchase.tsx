import React, { Fragment, useEffect } from 'react';
import {
  Card,
  Tag,
  Form,
  Button,
  Space,
  Checkbox,
  InputNumber,
  message,
  Result,
  theme,
} from 'antd';
import { AlipayCircleOutlined, WechatOutlined } from '@ant-design/icons';
import RightContainer from '@/components/Global/RightContainer';
import { useLocation, useRequest } from '@umijs/max';
import { useSetState } from 'ahooks';
import numeral from 'numeral';
import moment from 'moment';
import { apiOrderCreate, apiGoodsList } from '@/services/payment';
import { apiAccountBalnace } from '@/services/user';
import PayQrocde from '@/components/Payment/PayQrcode';
import { getPageQuery } from '@/utils/common';
import CheckCards from '@/components/CheckCards';
import { getUrlData } from '@/utils/geturlData';


const Purchase: React.FC = () => {
  const [form] = Form.useForm();
  const location = useLocation();

  const [state, setState] = useSetState<Record<string, any>>({
    isOrg: false,
    type: 'searchCount',
    balance: 0,
    commission: 0,
    goodsList: [],
    payYuan: 0,
    price: '',
    goodsCount: 1,
    tips: '',
    useBalance: false,
    payBalance: '',
    payCommission: '',
    useCommission: false,
    uid: '',
    searchCount: 0,
    futureSearchCount: 0,
    vip: 0,
    vipTime: 0,
    sendCount: 0,
    now: moment().valueOf(),
    qrcodeVisible: false,
    orderId: '',
    payApp: '',
    codeUrl: '',
    status: '', // success充值成功
  });
  const { token } = theme.useToken()
  const { run: balnaceRun } = useRequest(apiAccountBalnace, {
    manual: true,
    onSuccess: (data: any) => {
      if (!data) return;
      const { vip, vipTime, searchCount, futureSearchCount, sendCount, isOrg } = data;
      setState({ vip, vipTime, searchCount, futureSearchCount, sendCount, isOrg });
    },
  });

  const { run: createRun, loading: createLoading } = useRequest(apiOrderCreate, {
    manual: true,
    onSuccess: (data: any) => {
      if (data) {
        const { code_url, return_code, return_msg, id, payApp } = data;
        if (return_code === 'finished') {
          message.success('支付成功');
          setState({ status: 'success' });
        } else if (return_code === 'SUCCESS' || `${return_code}` === '10000') {
          setState({ payApp, orderId: id, codeUrl: code_url, qrcodeVisible: true });
        } else if (return_msg) {
          message.error('订单创建失败：', return_msg);
        }
      }
    },
  });

  const onGoodsClick = (id: string, price: number, tips: string) => {
    console.log("click")
    setState({
      payYuan: price / 100,
      price,
      goodsCount: 1,
      tips,
      useBalance: false,
      payBalance: '',
      payCommission: '',
      useCommission: false,
      goodsId: id,
    });
    form.setFieldsValue({ goodsId: id });
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
    const params = getPageQuery();
    const { type } = params;
    const goodsType = type ? type : 'searchMonth';
    balnaceRun();
    form.setFieldsValue({ type: goodsType, payApp: 'wechat' });
    goodsRun({ type: goodsType });
    setState({ payApp: 'wechat' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location]);

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
      goodsId,
      goodsCount,
      useBalance,
      useCommission,
      payBalance,
      payCommission,
    });
  };

  const renderTitle = (name: string) => {
    return <div style={{ fontWeight: 'bold', fontSize: 20 }}>{name}</div>;
  };

  const onTypeChange = (value: any) => {
    goodsRun({ type: value });
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

  const onPayCommissionChange = (yuan: any) => {
    const { price, commission, goodsCount } = state;
    const value = parseFloat(yuan) * 100;
    if (value <= price * goodsCount && value <= commission) {
      const payYuan = (price * goodsCount - value) / 100;
      setState({ payCommission: yuan, payYuan });
    }
  };


  const onGoodsIdChange = (value: any) => {
    if (value) {
      setState({ goodsId: value });
    }
  };


  const CardStyle = { width: "260px", height: "150px" }
  const sellForm = (
    <Form form={form} onFinish={handleSubmit} labelCol={{ span: 4 }} wrapperCol={{ span: 20 }}>
      <Form.Item
        name="type"
        label="产品类型"
        rules={[{ required: true, message: '请选择产品类型' }]}
      >

        <CheckCards
          getDefaultValue={() => getUrlData().type}
          style={{ width: "100%" }}
          childStyle={CardStyle}
          onChange={(value) => {
            onTypeChange(value)
          }}
          Cards={[
            {
              title: renderTitle('获客月套餐'),
              description: (
                <>
                  <div>批量获取邮箱点数(31天有效期)</div>
                  <div>
                    有效剩余点数：<a>{state.searchCount}</a>
                  </div>
                </>
              ),
              value: "searchMonth"
            },
            {
              title: renderTitle('获客年套餐'),
              description: (
                <>
                  <div>批量获取邮箱点数(1年有效期)</div>
                  <div>
                    未生效点数：<a>{state.futureSearchCount}</a>
                  </div>
                </>
              ),
              value: "searchYear"
            },
            {
              title: renderTitle('群发额度'),
              description: (
                <>
                  <div>批量发送邮件额度</div>
                  <div>
                    剩余额度：<a>{state.sendCount}</a>
                  </div>
                </>
              ),
              value: "sendCount"
            },
            state.isOrg ? null : {
              title: renderTitle('SVIP会员'),
              description: (
                <>
                  <div>拥有更多特权</div>
                  {state.vip ? (
                    <div>
                      有效期：<a>{moment(state.vipTime).format('YYYY年MM月DD日')}</a>
                    </div>
                  ) : (
                    <div>普通会员</div>
                  )}
                </>
              ),
              disabled: state.vipTime - state.now >= 10 * 365 * 24 * 3600 * 1000 ? true : false,
              value: "svip"
            }
          ]}
        />

      </Form.Item>
      <Form.Item
        name="goodsId"
        label="产品套餐"
        rules={[{ required: true, message: '请选择产品套餐' }]}
      >
        <CheckCards
          style={{ width: '100%' }}
          childStyle={CardStyle}
          onChange={(value) => onGoodsIdChange(value)}
          checkValue={state.goodsId}
          Cards={state.goodsList.map((item: any) => {
            const { id, name, price, oriPrice, tips, worth } = item;
            const desc = oriPrice && oriPrice > price ? (
              <>
                <div>
                  ￥
                  <span style={{ color: '#f60', fontSize: '26px', fontWeight: 700 }}>{price / 100}</span>
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
                <div> {tips ? tips : '无说明'}</div>
              </>
            ) : (
              <>
                <div style={{ textAlign: "center" }}>
                  ￥{' '}
                  <span style={{ color: '#f60', fontSize: '26px', fontWeight: 700 }}>{price / 100}</span>
                </div>
                <div style={{ textIndent: 10 }}> {tips ? tips : '无说明'}</div>
              </>
            );

            return {
              title: renderTitle(name),
              description: desc,
              value: id,
              key: id,
              extra: worth && <Tag color="success">推荐</Tag>,
              onClick: () => onGoodsClick(id, price, tips)
            }
          }

          )}
        />

      </Form.Item>
      <Form.Item label="使用佣金">
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
      </Form.Item>
      <Form.Item
        name="payApp"
        label="付款方式"
        rules={[{ required: true, message: '请选择支付应用' }]}
      >
        <CheckCards
          style={{ width: '100%' }}
          childStyle={CardStyle}
          onChange={(value) => setState({ payApp: value })}
          checkValue={state.payApp}
          Cards={[
            {
              title: (
                <div style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <WechatOutlined style={{ color: '#52c41a', fontSize: 36, marginRight: 10 }} />
                  <div>微信支付</div>
                </div>
              ),
              description: (
                <div >
                  <div
                    style={{
                      fontSize: "24px",
                      color: state.payApp === 'wechat' ? '#f60' : token.colorText,
                    }}
                  >
                    ￥{numeral(state.payYuan).format('0,0.00')}
                  </div>
                  <div style={{ color: '#999999', fontSize: "10px" }}>
                    <p>请使用微信扫一扫</p>
                    <p>扫描二维码支付订单</p>
                  </div>

                </div>
              ),
              value: "wechat",

            },
            {
              title: (
                <div style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <AlipayCircleOutlined style={{ color: '#027aff', fontSize: 36, marginRight: 10 }} />
                  <div>支付宝支付</div>
                </div>
              ),
              description: (
                <div >
                  <div
                    style={{
                      fontSize: "24px",
                      color: state.payApp === 'alipay' ? '#f60' : token.colorText,
                    }}
                  >
                    ￥{numeral(state.payYuan).format('0,0.00')}
                  </div>
                  <div style={{ color: '#999999', fontSize: "10px" }}>
                    <p>请使用支付宝扫一扫</p>
                    <p>扫描二维码支付订单</p>
                  </div>

                </div>

              ),
              value: "alipay",


            }
          ]}
        />

      </Form.Item>
      <Form.Item wrapperCol={{ span: 20, offset: 4 }}>
        <Button
          style={{
            width: "300px",
            height: "70px",
            fontSize: "20px"
          }}
          type="primary"
          htmlType="submit"
          loading={createLoading}>
          确认支付
        </Button>
      </Form.Item>
    </Form>
  );

  const onClickContinue = () => {
    setState({ status: '' });
    balnaceRun();
  };

  const extra = (
    <Fragment>
      <Button type="primary" onClick={onClickContinue}>
        继续购买
      </Button>
    </Fragment>
  );

  const successResult = (
    <Result
      status="success"
      title="购买成功"
      subTitle="返回即可查看"
      extra={extra}
      style={{ marginBottom: 16 }}
    >
      { }
    </Result>
  );

  return (
    <RightContainer pageTitle="充值界面" pageGroup={''} pageActive={''}>
      <Card>{state.status === 'success' ? successResult : sellForm}</Card>
      <PayQrocde
        visible={state.qrcodeVisible}
        codeUrl={state.codeUrl}
        app={state.payApp}
        id={state.orderId}
        onCancel={() => setState({ qrcodeVisible: false })}
        actionReload={() => setState({ status: 'success' })}
      />
    </RightContainer>
  );
};

export default Purchase;
