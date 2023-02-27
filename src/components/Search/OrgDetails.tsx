import React, { useEffect, useRef } from 'react';
import { Descriptions, Drawer, Tabs, Alert, Button } from 'antd';
import { HomeOutlined, MailOutlined, UserOutlined } from '@ant-design/icons';
import OrgInfo from './components/OrgInfo';
import OrgPeople from './components/OrgPeople';
import OrgEmails from './components/OrgEmails';
import OrgPersonal from './components/OrgPersonal';
import { useRequest } from '@umijs/max';
import { useSetState } from 'ahooks';
import { apiDomainSaveStatus } from '@/services/search';
import DomainSaveToContatcs from './DomainSaveToContacts';

interface InfoProps {
  visible: boolean;
  onCancel: () => void;
  orgInfo: any;
}
const { TabPane } = Tabs;
const OrgDetails: React.FC<InfoProps> = (props) => {
  const { orgInfo, visible, onCancel } = props;
  const {
    orgId,
    orgName,
    employees,
    generic,
    personal,
    domain,
    website,
    gg_total,
    gg_title,
    gg_desc,
  } = orgInfo;
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

  const emailsReload = () => {
    setState({ domainSaveVisible: false });
    statusRefresh();
    personslRef?.current?.flush();
    genericRef?.current?.flush();
  };

  useEffect(() => {
    if (visible) {
      statusRun({ domain });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, domain]);

  return (
    <Drawer
      destroyOnClose
      width={720}
      title="企业相关信息"
      placement="right"
      open={visible}
      onClose={() => onCancel()}
    >
      <Descriptions title={false} bordered labelStyle={{ width: 128 }} column={1}>
        <Descriptions.Item label="企业ID">{orgId}</Descriptions.Item>
        <Descriptions.Item label="企业名称">{orgName}</Descriptions.Item>
        <Descriptions.Item label="企业官网">{website}</Descriptions.Item>
        {domain ? (
          <>
            <Descriptions.Item label="谷歌收录数">{gg_total}</Descriptions.Item>
            <Descriptions.Item label="标题">{gg_title}</Descriptions.Item>
            <Descriptions.Item label="描述">{gg_desc}</Descriptions.Item>
          </>
        ) : null}
      </Descriptions>
      {domain ? (
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
      ) : null}

      <Tabs defaultActiveKey="1" onChange={onTabChange}>
        <TabPane
          tab={
            <span>
              <HomeOutlined />
              企业信息
            </span>
          }
          key="1"
        >
          <OrgInfo orgId={orgId} />
        </TabPane>
        <TabPane
          tab={
            <span>
              <UserOutlined />
              员工资料 ({employees})
            </span>
          }
          key="2"
        >
          <OrgPeople orgId={orgId} />
        </TabPane>
        <TabPane
          tab={
            <span>
              <MailOutlined />
              精准邮箱 ({personal})
            </span>
          }
          key="3"
        >
          <OrgPersonal orgId={orgId} ref={personslRef} />
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
          <OrgEmails orgId={orgId} ref={genericRef} />
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

export default OrgDetails;
