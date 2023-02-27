import React, { useEffect, useRef } from 'react';
import { Alert, Button, Descriptions, Drawer, Tabs } from 'antd';
import { MailOutlined } from '@ant-design/icons';
import DomainEmails from './components/DomainEmails';
import DomainPersonal from './components/DomainPersonal';
import { apiDomainSaveStatus } from '@/services/search';
import { useRequest } from '@umijs/max';
import DomainSaveToContatcs from './DomainSaveToContacts';
import { useSetState } from 'ahooks';

interface InfoProps {
  visible: boolean;
  onCancel: () => void;
  domainInfo: any;
}
const { TabPane } = Tabs;
const DomainDetails: React.FC<InfoProps> = (props) => {
  const { domainInfo, visible, onCancel } = props;
  const { domain, generic, personal, gg_total, gg_title, gg_desc } = domainInfo;
  const [state, setState] = useSetState<Record<string, any>>({
    domainSaveVisible: false,
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

  useEffect(() => {
    if (visible) {
      statusRun({ domain });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, domain]);

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
        <Descriptions.Item label="域名">{domain}</Descriptions.Item>
        <Descriptions.Item label="谷歌收录数">{gg_total}</Descriptions.Item>
        <Descriptions.Item label="标题">{gg_title}</Descriptions.Item>
        <Descriptions.Item label="描述">{gg_desc}</Descriptions.Item>
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
      <Tabs defaultActiveKey="1" onChange={onTabChange}>
        <TabPane
          tab={
            <span>
              <MailOutlined />
              精准邮箱 ({personal})
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
              普通邮箱 ({generic})
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
        initValues={{ domain }}
        actionReload={() => emailsReload()}
      />
    </Drawer>
  );
};

export default DomainDetails;
