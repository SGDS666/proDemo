import React from 'react';
import { Card, Row, Col, Tooltip, Button, Input, message } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import RightContainer from '@/components/Global/RightContainer';
import { apiAccountBalance, apiCdkeyExchange } from '@/services/expenses';
import PayQrocde from '@/components/Payment/PayQrcode';
import PayPackage from '@/components/Payment/PayPackage';
import PayVip from '@/components/Payment/PayVip';
import PaySearch from '@/components/Payment/PaySearch';
import { useSetState } from 'ahooks';
import { history, useRequest } from '@umijs/max';
import moment from 'moment';
import numeral from 'numeral';
import { yieldDelayCss } from '@/utils/animation';
const disStyle = { xs: 24, sm: 12, md: 12, lg: 12, xl: 12 };
const Balance: React.FC = () => {
  const [state, setState] = useSetState({
    loading: false,
    balance: 0,
    sendCount: 0,
    searchCount: 0,
    payBalanceVisible: false,
    payPackageVisible: false,
    paySearchVisible: false,
    payVipVisible: false,
    qrcodeVisible: false,
    app: 'wechat',
    codeUrl: 'https://laifaxin.com',
    id: '',
    cdkey: '',
    vip: 0,
    vipTime: 0,
    now: moment().valueOf(),
  });

  const { refresh: accountRefresh } = useRequest(apiAccountBalance, {
    onSuccess: (data: any) => {
      if (!data) return;
      setState({ ...data });
    },
  });

  const { run: cdkeyExchangeRun } = useRequest(apiCdkeyExchange, {
    manual: true,
    onSuccess: () => {
      setState({ cdkey: '' });
      message.success('兑换成功');
      accountRefresh();
    },
  });

  const onClickExchange = () => {
    const { cdkey } = state;
    cdkeyExchangeRun({ cdkey });
  };

  const openQrcode = (id: string, app: string, codeUrl: string) => {
    setState({ id, app, codeUrl, qrcodeVisible: true });
  };
  const cardDelay = yieldDelayCss({ max: 5, reverse: true })
  return (
    <RightContainer pageTitle={false} pageGroup="expenses" pageActive="balance">
      <Row gutter={24}>
        <Col {...disStyle}>
          <Card className='both-down' style={{ padding: 12, animationDelay: cardDelay.next().value! }} bodyStyle={{ height: 166 }}>
            <div style={{ fontSize: 24 }}>
              <span style={{ marginRight: 10, fontWeight: 500 }}>会员等级</span>
              <Tooltip title="用户会员等级">
                <QuestionCircleOutlined />
              </Tooltip>
            </div>
            {state.vip === 0 ? (
              <>
                <div style={{ fontSize: 24, color: '#108ee9' }}>
                  <img width={24} src="https://files.laifaxin.com/www/normal.jpg" /> 普通会员
                </div>
                <div style={{ marginTop: 10 }}>
                  <Button type="primary" onClick={() => history.push('/expenses/purchase?type=svip')}>
                    购买VIP
                  </Button>
                </div>
              </>
            ) : null}
            {state.vip === 1 ? (
              <>
                <div style={{ fontSize: 24, color: '#EBAF5B', fontWeight: 'bold' }}>
                  <img width={24} src="https://files.laifaxin.com/www/vip.jpg" /> VIP会员
                  <span style={{ color: '#696969', marginLeft: 12 }}>
                    {state.vipTime - state.now >= 10 * 365 * 24 * 3600 * 1000
                      ? '永久'
                      : `${moment(state.vipTime).format('YYYY-MM-DD')} 到期`}
                  </span>
                </div>
                <div style={{ marginTop: 10 }}>
                  <Button type="primary" onClick={() => setState({ payVipVisible: true })}>
                    {state.vipTime - state.now >= 365 * 24 * 3600 * 1000 ? '' : '续费'}
                  </Button>
                </div>
              </>
            ) : null}
            {state.vip === 2 ? (
              <>
                <div style={{ fontSize: 24, color: '#EBAF5B', fontWeight: 'bold' }}>
                  <img width={24} src="https://files.laifaxin.com/www/svip.jpg" /> SVIP会员
                  <span style={{ color: '#696969', marginLeft: 12 }}>
                    {state.vipTime - state.now >= 10 * 365 * 24 * 3600 * 1000
                      ? '永久会员'
                      : `${moment(state.vipTime).format('YYYY-MM-DD')} 到期`}
                  </span>
                </div>
                <div
                  style={{ marginTop: 10 }}
                  hidden={state.vipTime - state.now >= 365 * 24 * 3600 * 1000}
                >
                  <Button type="primary" onClick={() => history.push('/expenses/purchase?type=svip')}>
                    续费
                  </Button>
                </div>
              </>
            ) : null}
          </Card>
        </Col>
        <Col {...disStyle}>
          <Card className='both-down' style={{ padding: 12, animationDelay: cardDelay.next().value! }} bodyStyle={{ height: 166 }}>
            <div style={{ fontSize: 24 }}>
              <span style={{ marginRight: 10, fontWeight: 500 }}>账户余额</span>
              <Tooltip title="用户账户上余额，来源于用户充值">
                <QuestionCircleOutlined />
              </Tooltip>
            </div>
            <div style={{ fontSize: 24, color: '#108ee9' }}>
              ¥ {numeral(state.balance / 1000).format('0,0.00')}
            </div>
            {/* <div style={{ marginTop: 10 }}>
              <Button
                type="primary"
                onClick={() => setState({ payBalanceVisible: true })}
                disabled
              />
            </div> */}
          </Card>
        </Col>
      </Row>
      <Row gutter={24} style={{ marginTop: 12 }}>
        <Col {...disStyle}>
          <Card className='both-down' style={{ padding: 12, animationDelay: cardDelay.next().value! }}>
            <div style={{ fontSize: 24 }}>
              <span style={{ marginRight: 10, fontWeight: 500 }}>群发额度</span>
              <Tooltip title="群发资源包剩余">
                <QuestionCircleOutlined />
              </Tooltip>
            </div>
            <div style={{ fontSize: 24, color: '#108ee9' }}>
              {numeral(state.sendCount).format('0,0')}
            </div>
            <div style={{ marginTop: 10 }}>
              <Button type="primary" onClick={() => history.push('/expenses/purchase?type=sendCount')}>
                购买
              </Button>
            </div>
          </Card>
        </Col>
        <Col {...disStyle}>
          <Card className='both-down' style={{ padding: 12, animationDelay: cardDelay.next().value! }}>
            <div style={{ fontSize: 24 }}>
              <span style={{ marginRight: 10, fontWeight: 500 }}>获客点数</span>
              <Tooltip title="获客点数剩余">
                <QuestionCircleOutlined />
              </Tooltip>
            </div>
            <div style={{ fontSize: 24, color: '#108ee9' }}>
              {numeral(state.searchCount).format('0,0')}
            </div>
            <div style={{ marginTop: 10 }}>
              <Button type="primary" onClick={() => history.push('/expenses/purchase?type=searchYear')}>
                购买
              </Button>
            </div>
          </Card>
        </Col>
      </Row>
      <Row gutter={24} style={{ marginTop: 12 }}>
        <Col {...disStyle}>
          <Card className='both-down' style={{ padding: 12, animationDelay: cardDelay.next().value! }}>
            <div style={{ fontSize: 24 }}>
              <span style={{ marginRight: 10, fontWeight: 500 }}>礼包码兑换</span>
              <Tooltip title="活动礼包码兑换">
                <QuestionCircleOutlined />
              </Tooltip>
            </div>
            <div style={{ fontSize: 24, color: '#108ee9' }}>
              <Input
                value={state.cdkey}
                onChange={(e) => setState({ cdkey: e.target.value })}
                style={{ width: 240 }}
              />
            </div>
            <div style={{ marginTop: 10 }}>
              <Button type="primary" onClick={() => onClickExchange()}>
                兑换
              </Button>
            </div>
          </Card>
        </Col>
      </Row>
      <PayPackage
        visible={state.payPackageVisible}
        onCancel={() => setState({ payPackageVisible: false })}
        openQrcode={(id, app, url) => openQrcode(id, app, url)}
        actionReload={() => accountRefresh()}
      />
      <PayVip
        visible={state.payVipVisible}
        onCancel={() => setState({ payVipVisible: false })}
        openQrcode={(id, app, url) => openQrcode(id, app, url)}
        actionReload={() => accountRefresh()}
      />
      <PaySearch
        visible={state.paySearchVisible}
        onCancel={() => setState({ paySearchVisible: false })}
        openQrcode={(id, app, url) => openQrcode(id, app, url)}
        actionReload={() => accountRefresh()}
      />
      <PayQrocde
        visible={state.qrcodeVisible}
        codeUrl={state.codeUrl}
        app={state.app}
        id={state.id}
        onCancel={() => setState({ qrcodeVisible: false })}
        actionReload={() => accountRefresh()}
      />
    </RightContainer>
  );
};

export default Balance;
