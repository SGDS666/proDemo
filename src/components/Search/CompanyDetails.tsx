import React, { useEffect, useRef } from 'react';
import { Card, Divider, Drawer, Space, Tabs, message, Tooltip, Button, Avatar } from 'antd';
import {
  FacebookOutlined,
  HomeOutlined,
  LinkedinOutlined,
  LinkOutlined,
  MailOutlined,
  PhoneOutlined,
  TwitterOutlined,
  SaveOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import CompanyInfo from './components/CompanyInfo';
import DomainEmails from './components/DomainEmails';
import DomainPersonal from './components/DomainPersonal';
import { apiCompanyInfo, apiDomainCancelBlack, apiDomainSaveBlack } from '@/services/search';
import { useRequest } from '@umijs/max';
import { useSetState } from 'ahooks';
import DomainSaveToContatcs from './DomainSaveToContacts';

interface InfoProps {
  visible: boolean;
  onCancel: () => void;
  domain: string;
}
const { TabPane } = Tabs;
const CompanyDetails: React.FC<InfoProps> = (props) => {
  const { visible, onCancel, domain } = props;
  const [state, setState] = useSetState<Record<string, any>>({
    companyInfo: {},
    domainValues: {},
    domainSaveVisible: false,
  });
  const { companyInfo } = state;
  const personslRef: any = useRef(null);
  const genericRef: any = useRef(null);

  const onTabChange = (key: string) => {
    console.log(key);
  };

  const { run: infoRun, loading: infoLoading } = useRequest(apiCompanyInfo, {
    loadingDelay: 300,
    manual: true,
    onSuccess: (data: any) => {
      if (!data) return;
      if (data) {
        setState({ companyInfo: data });
      }
    },
  });

  const { run: saveBlackRun } = useRequest(apiDomainSaveBlack, {
    manual: true,
    onSuccess: () => {
      message.success('拉入黑名单成功');
      infoRun({ domain });
    },
  });

  const { run: cancelBlackRun } = useRequest(apiDomainCancelBlack, {
    manual: true,
    onSuccess: () => {
      message.success('移出黑名单成功');
      infoRun({ domain });
    },
  });

  const emailsReload = () => {
    setState({ domainSaveVisible: false });
    personslRef?.current?.flush();
    genericRef?.current?.flush();
  };

  useEffect(() => {
    if (visible) {
      infoRun({ domain });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, domain]);

  const renderCompanyName = () => {
    const { black } = companyInfo;
    let { orgName } = companyInfo;
    if (!orgName) {
      orgName = domain;
    }
    const logoImg = (
      // <img
      //   src={`https://ico.laifaxin.com/ico/${domain}`}
      //   width={25}
      //   height={25}
      //   style={{ borderRadius: '5px' }}
      // />
      <Avatar
        shape="square"
        src={<img src={`https://ico.laifaxin.com/ico/${domain}`} alt="avatar" />}
      />
    );

    if (black) {
      return (
        <div
          style={{
            width: '100%',
            textAlign: 'center',
            height: 40,
            textDecoration: 'line-through',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
          }}
        >
          {logoImg}
          <span
            style={{
              fontSize: 18,
              marginLeft: 12,
              color: '#999',
            }}
          >
            {orgName}
          </span>
        </div>
      );
    }
    return (
      <div
        style={{
          width: '100%',
          textAlign: 'center',
          height: 40,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
        }}
      >
        {logoImg}
        <span style={{ fontSize: 18, fontWeight: 'bold', marginLeft: 12 }}>{orgName}</span>
      </div>
    );
  };

  const renderAction = () => {
    const { black } = companyInfo;
    const blackIcon = black ? (
      <Tooltip title="移出黑名单">
        <Button type="text" onClick={() => cancelBlackRun({ domain })}>
          <DeleteOutlined />
        </Button>
      </Tooltip>
    ) : (
      <Tooltip title="拉入黑名单">
        <a onClick={() => saveBlackRun({ domain })}>
          <DeleteOutlined />
        </a>
      </Tooltip>
    );
    return <span>{blackIcon}</span>;
  };

  const renderCompanySocial = () => {
    const { website, linkedin_url, facebook_url, twitter_url, phone_number } = companyInfo;
    let url = website;
    if (website?.indexOf('http') < 0) {
      url = `http://${website}`;
    }
    const linkedin = linkedin_url ? (
      <a target="_blank" href={linkedin_url} rel="noreferrer">
        <LinkedinOutlined />
      </a>
    ) : null;
    const fackbook = facebook_url ? (
      <a target="_blank" href={facebook_url} rel="noreferrer">
        <FacebookOutlined />
      </a>
    ) : null;
    const twitter = twitter_url ? (
      <a target="_blank" href={twitter_url} rel="noreferrer">
        <TwitterOutlined />
      </a>
    ) : null;
    const phone = phone_number ? (
      <span>
        <Divider type="vertical" />
        <a style={{ marginLeft: 12 }}>
          <PhoneOutlined /> {phone_number}
        </a>
      </span>
    ) : null;
    return (
      <div style={{ width: '100%', textAlign: 'center', height: 32 }}>
        <Space style={{ fontSize: 18 }} size="middle">
          <a target="_blank" href={url} rel="noreferrer">
            <LinkOutlined />
          </a>
          {linkedin}
          {fackbook}
          {twitter}
          {phone}
          <Divider type="vertical" />
          {renderAction()}
        </Space>
      </div>
    );
  };

  return (
    <Drawer
      destroyOnClose
      width={720}
      title="企业相关信息"
      placement="right"
      open={visible}
      onClose={() => onCancel()}
      bodyStyle={{ padding: 12 }}
      extra={
        <Space>
          <Button
            type="primary"
            onClick={() => setState({ domainSaveVisible: true, domainValues: { domain } })}
          >
            <SaveOutlined /> 保存
          </Button>
        </Space>
      }
    >
      <Card bodyStyle={{ padding: 12 }} loading={infoLoading}>
        {renderCompanyName()}
        {renderCompanySocial()}
      </Card>

      <Tabs defaultActiveKey="1" onChange={onTabChange} centered>
        <TabPane
          tab={
            <span>
              <HomeOutlined />
              企业信息
            </span>
          }
          key="1"
        >
          <CompanyInfo data={companyInfo} loading={infoLoading} />
        </TabPane>
        <TabPane
          tab={
            <span>
              <MailOutlined />
              精准邮箱 ({companyInfo?.personal})
            </span>
          }
          key="3"
        >
          <DomainPersonal domain={domain} ref={personslRef} />
        </TabPane>
        <TabPane
          tab={
            <span>
              <MailOutlined />
              普通邮箱 ({companyInfo?.generic})
            </span>
          }
          key="4"
        >
          <DomainEmails domain={domain} ref={genericRef} />
        </TabPane>
      </Tabs>
      <DomainSaveToContatcs
        visible={state.domainSaveVisible}
        onCancel={() => setState({ domainSaveVisible: false })}
        initValues={state.domainValues}
        actionReload={() => emailsReload()}
      />
    </Drawer>
  );
};

export default CompanyDetails;
