import React, { useEffect, useMemo } from 'react';
import MyInvite from './components/MyInvite';
import styles from './style.less';
import RightContainer from '@/components/Global/RightContainer';
import PartnerModal from '@/components/Partner/PartnerModal';
import { apiPartnerInviteInfo } from '@/services/partner';
import { useSetState } from 'ahooks';
import { useRequest } from '@umijs/max';
import { Card, theme } from 'antd';
import { yieldDelayCss } from '@/utils/animation';
const { useToken } = theme

const Invite: React.FC = () => {
  const { token } = useToken()
  const [state, setState] = useSetState<Record<string, any>>({
    pid: '',
    uid: '',
    inviteCount: 0,
    inviteLink: '',
    inviteHide: false,
    partnerVisible: false,
  });

  const { run: infoRun } = useRequest(apiPartnerInviteInfo, {
    manual: true,
    onSuccess: (data: any) => {
      if (!data) return;
      const { uid, pid, inviteCode, inviteCount, inviteHide } = data;
      const { protocol, host } = window.location;
      const inviteLink = `${protocol}//${host}/i/${inviteCode}`;
      const partnerVisible = inviteHide ? false : true;
      setState({ uid, pid, inviteCode, inviteCount, inviteLink, partnerVisible });
    },
  });

  useEffect(() => {
    infoRun();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const textdelay = yieldDelayCss({ max: 5 })

  const BaseStyle: React.CSSProperties = useMemo(() => ({
    fontWeight: "bold",
    paddingLeft: "20px"
  }), [])

  return (
    <RightContainer pageTitle={false} pageGroup={''} pageActive={''}>
      <Card
        style={{ border: "none" }}
        bodyStyle={{ background: token.colorBgLayout, border: "none" }}
      >

        <div
          className={styles.main}
        >
          <div
            className={`${styles.leftMenu}`}
            style={{ backgroundColor: token.colorPrimaryActive, borderRadius: "20px" }}>
            <div
              className='both-right'
              style={{ fontSize: 36, marginTop: 48, ...BaseStyle, animationDelay: textdelay.next().value! }}>
              邀好友 赚现金
            </div>
            <div
              className='both-right'
              style={{ fontSize: 36, marginTop: 12, ...BaseStyle, animationDelay: textdelay.next().value! }}>
              佣金高达 20%
            </div>
            <div
              className='both-right'
              style={{ fontSize: 36, marginTop: 12, ...BaseStyle, animationDelay: textdelay.next().value! }}>
              可提现
            </div>
            <div
              className='both-right'
              style={{ fontSize: 24, marginTop: 24, ...BaseStyle, animationDelay: textdelay.next().value! }}>
              专属链接 ★ 永久绑定
            </div>
            <div
              className='both-right'
              style={{ fontSize: 24, marginTop: 24, marginBottom: 20, ...BaseStyle, animationDelay: textdelay.next().value! }}>
              笔笔返现 ★ 消费就返
            </div>
          </div>
          <div className={`${styles.right} `}>
            <MyInvite />
          </div>
        </div>
      </Card>

      <PartnerModal
        uid={state.uid}
        pid={state.pid}
        visible={state.partnerVisible}
        inviteCount={state.inviteCount}
        inviteLink={state.inviteLink}
        onCancel={() => setState({ partnerVisible: false })}
      />
    </RightContainer>
  );
};

export default Invite;
