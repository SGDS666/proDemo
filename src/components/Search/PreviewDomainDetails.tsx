import React, { useEffect, useRef } from 'react';
import { Alert, Button, Descriptions, Drawer, Tabs } from 'antd';
import { MailOutlined } from '@ant-design/icons';
import DomainEmails from './components/DomainEmails';
import DomainPersonal from './components/DomainPersonal';
import DomainInfo from './components/DomainInfo';
import { apiDomainSaveStatus, apiPreviewDomainInfo } from '@/services/search';
import { useRequest } from '@umijs/max';
import DomainSaveToContatcs from './DomainSaveToContacts';
import { useSetState } from 'ahooks';
import { getWebsiteDomain } from '@/utils/common';

interface InfoProps {
  visible: boolean;
  onCancel: () => void;
  url: string;
}
const { TabPane } = Tabs;
const PreviewDomainDetails: React.FC<InfoProps> = (props) => {
  const { url, visible, onCancel } = props;
  const [state, setState] = useSetState<Record<string, any>>({
    domainSaveVisible: false,
    domain: '',
  });

  const personslRef: any = useRef(null);
  const genericRef: any = useRef(null);

  const {
    data: previewData,
    run: previewRun,
    loading: previewLoading,
  } = useRequest(apiPreviewDomainInfo, { manual: true });

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

  useEffect(() => {
    if (visible) {
      const domain = getWebsiteDomain(url);
      setState({ domain });
      previewRun({ domain });
      statusRun({ domain });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, url]);

  const emailsReload = () => {
    statusRefresh();
    personslRef?.current?.flush();
    genericRef?.current?.flush();
    setState({ domainSaveVisible: false });
  };

  return (
    <Drawer
      destroyOnClose
      width={720}
      title="域名相关邮箱"
      placement="right"
      open={visible}
      onClose={() => onCancel()}
    >
      <Descriptions title={false} bordered labelStyle={{ width: 128 }} column={1}>
        <Descriptions.Item label="域名">
          <a>{state.domain}</a>
        </Descriptions.Item>
      </Descriptions>
      <Alert
        message="邮箱需要保存后才能查看完整地址"
        description={
          <div>
            精准邮箱保存数量：<a>{statusData?.personal}</a> 普通邮箱保存数量：
            <a>{statusData?.generic}</a>
          </div>
        }
        type="warning"
        showIcon
        action={
          <Button type="primary" onClick={() => setState({ domainSaveVisible: true })}>
            立即保存
          </Button>
        }
      />
      <Tabs defaultActiveKey="2" onChange={onTabChange}>
        <TabPane
          tab={
            <span>
              <MailOutlined /> 基本信息
            </span>
          }
          key="2"
        >
          <DomainInfo domainInfo={previewData} loading={previewLoading} />
        </TabPane>
        <TabPane
          tab={
            <span>
              <MailOutlined />
              精准邮箱 ({previewData?.personal_emails})
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
              普通邮箱 ({previewData?.generic_emails})
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
        initValues={{ domain: state.domain }}
        actionReload={() => emailsReload()}
      />
    </Drawer>
  );
};

export default PreviewDomainDetails;
