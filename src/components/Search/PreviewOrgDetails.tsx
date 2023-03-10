import React, { useEffect, useRef } from 'react';
import { Descriptions, Drawer, Tabs, Alert, Button } from 'antd';
import { HomeOutlined, MailOutlined, UserOutlined } from '@ant-design/icons';
import { useRequest } from '@umijs/max';
import { useSetState } from 'ahooks';
import { apiDomainSaveStatus, apiPreviewOrgInfo, apiPreviewDomainInfo } from '@/services/search';
import DomainSaveToContatcs from './DomainSaveToContacts';
import { getWebsiteDomain } from '@/utils/common';
import OrgInfo from './components/OrgInfo';
import OrgPeople from './components/OrgPeople';
import DomainPersonal from './components/DomainPersonal';
import DomainEmails from './components/DomainEmails';

interface InfoProps {
  visible: boolean;
  onCancel: () => void;
  id: string;
  platform: string;
  language: string;
}
const { TabPane } = Tabs;
const PreviewOrgDetails: React.FC<InfoProps> = (props) => {
  const { visible, onCancel, id, platform, language } = props;
  const [state, setState] = useSetState<Record<string, any>>({
    domainSaveVisible: false,
    domain: '',
  });
  const personslRef: any = useRef(null);
  const genericRef: any = useRef(null);

  const onTabChange = (key: string) => {
    console.log(key);
  };

  const {
    run: statusRun,
    data: statusData,
    refresh: statusRefresh,
  } = useRequest(apiDomainSaveStatus, {
    manual: true,
  });

  const { data: previewDomainData, run: previewDomainRun } = useRequest(apiPreviewDomainInfo, {
    manual: true,
  });

  const { data: infoData, run: infoRun } = useRequest(apiPreviewOrgInfo, {
    manual: true,
    debounceInterval: 500,
    onSuccess: (data: any) => {
      if (!data) return;
      const { website } = data;
      const domain = getWebsiteDomain(website);
      if (domain) {
        previewDomainRun({ domain });
        statusRun({ domain });
      }
      setState({ domain });
    },
  });

  const emailsReload = () => {
    setState({ domainSaveVisible: false });
    statusRefresh();
    personslRef?.current?.flush();
    genericRef?.current?.flush();
  };

  useEffect(() => {
    if (visible) {
      infoRun({ id, platform, language });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, id]);

  return (
    <Drawer
      destroyOnClose
      width={720}
      title="??????????????????"
      placement="right"
      open={visible}
      onClose={() => onCancel()}
    >
      <Descriptions title={false} bordered labelStyle={{ width: 128 }} column={1}>
        <Descriptions.Item label="??????ID">{infoData?.orgId}</Descriptions.Item>
        <Descriptions.Item label="????????????">{infoData?.orgName}</Descriptions.Item>
        <Descriptions.Item label="????????????">
          <a href={infoData?.website} target="blank">
            {infoData?.website}
          </a>
        </Descriptions.Item>
      </Descriptions>
      {infoData?.domain ? (
        <Alert
          message="?????????????????????????????????????????????"
          description={
            <div>
              ???????????????????????????<a>{statusData?.personal}</a> ???????????????????????????
              <a>{statusData?.generic}</a>
            </div>
          }
          type="warning"
          showIcon
          action={
            <Button type="primary" onClick={() => setState({ domainSaveVisible: true })}>
              ????????????
            </Button>
          }
        />
      ) : null}

      <Tabs defaultActiveKey="1" onChange={onTabChange}>
        <TabPane
          tab={
            <span>
              <HomeOutlined />
              ????????????
            </span>
          }
          key="1"
        >
          <OrgInfo orgId={infoData?.orgId} />
        </TabPane>
        <TabPane
          tab={
            <span>
              <UserOutlined />
              ???????????? ({infoData?.employees})
            </span>
          }
          key="2"
        >
          <OrgPeople orgId={infoData?.orgId} />
        </TabPane>
        <TabPane
          tab={
            <span>
              <MailOutlined />
              ???????????? ({previewDomainData?.personal_emails})
            </span>
          }
          key="3"
        >
          <DomainPersonal domain={state.domain} ref={personslRef} />
        </TabPane>
        <TabPane
          tab={
            <span>
              <MailOutlined />
              ???????????? ({previewDomainData?.generic_emails})
            </span>
          }
          key="4"
        >
          <DomainEmails domain={state.domain} ref={genericRef} />
        </TabPane>
      </Tabs>
      <DomainSaveToContatcs
        visible={state.domainSaveVisible}
        onCancel={() => setState({ domainSaveVisible: false })}
        initValues={{ domain: infoData?.domain }}
        actionReload={() => emailsReload()}
      />
    </Drawer>
  );
};

export default PreviewOrgDetails;
