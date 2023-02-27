import React, { useEffect } from 'react';
import { Modal, Card, Divider, Button, Space } from 'antd';
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import PayQrocde from '../PayQrcode';
import PayVip from '../PayVip';
import { useSetState } from 'ahooks';

interface OperationModalProps {
  visible: boolean;
  onCancel: () => void;
}

const priList = [
  { name: '客户管理', normal: '不限量', vip: '不限量', svip: '不限量' },
  { name: '日导入数', normal: '10000', vip: '100000', svip: '1000000' },
  { name: '日导出数', normal: '500', vip: '5000', svip: '50000' },
  { name: '验证数量', normal: '1000', vip: '2000', svip: '10000' },
  { name: '验证速度', normal: '360/小时', vip: '3600/小时', svip: '36000/小时' },
  { name: '邮件追踪', normal: '无', vip: '有', svip: '有' },
  { name: '点击追踪', normal: '无', vip: '有', svip: '有' },
  { name: '附件追踪', normal: '无', vip: '有', svip: '有' },
  { name: '退订追踪', normal: '强制插入', vip: '可关闭', svip: '可关闭' },
  { name: '追踪提醒', normal: '无', vip: '有', svip: '有' },
  { name: '阅读详情', normal: '无', vip: '有', svip: '有' },
  { name: '阅读来源', normal: '无', vip: '有', svip: '有' },
  { name: '位置精度', normal: '国家级', vip: '城市级', svip: '城市级' },
  { name: '设置精度', normal: '设备级', vip: '系统级', svip: '系统级' },
  { name: '系统邮箱', normal: '5', vip: '10', svip: '20' },
  { name: '我的邮箱', normal: '5', vip: '10', svip: '20' },
  { name: '存储容量', normal: '1G', vip: '5G', svip: '10G' },
  { name: '附件大小', normal: '1M', vip: '10M', svip: '20M' },
  { name: '自有邮箱群发速度', normal: '1封/分钟', vip: '5封/分钟', svip: '10封/分钟' },
  { name: '自有邮箱最大任务', normal: '2', vip: '5', svip: '10' },
];

const renderItemvalue = (value: string) => {
  if (value === '有') {
    return <CheckOutlined style={{ color: '#52c41a' }} />;
  }
  if (value === '无') {
    return <CloseOutlined style={{ color: '#eb2f96' }} />;
  }
  return value;
};

const renderPrivilegeList = (name: string) => {
  const itemList = priList.map((item: any) => {
    const value = item[name];
    return (
      <div key={value}>
        <Divider style={{ margin: 0 }} />
        <div
          style={{ height: 36, paddingTop: 12, borderColor: '#f2ddaf', backgroundColor: '#fffae' }}
        >
          {renderItemvalue(value)}
        </div>
      </div>
    );
  });
  return itemList;
};

const VipInfo: React.FC<OperationModalProps> = (props) => {
  const { visible, onCancel } = props;
  const [state, setState] = useSetState({
    payVipVisible: false,
    qrcodeVisible: false,
    codeUrl: '',
    app: 'wechat',
    id: '',
  });

  const getData = async () => {};

  const openQrcode = (id: string, app: string, codeUrl: string) => {
    setState({ id, app, codeUrl, qrcodeVisible: true });
  };

  useEffect(() => {}, [props.visible]);

  return (
    <Modal
      title="会员中心"
      width={820}
      bodyStyle={{ padding: '28px' }}
      destroyOnClose
      open={visible}
      onCancel={onCancel}
      footer={false}
    >
      <div style={{ textAlign: 'center' }}>
        <Card title={false} style={{ textAlign: 'center' }}>
          <Card.Grid style={{ width: '25%', padding: 0, textAlign: 'center' }}>
            <div style={{ height: 58, fontSize: 20, fontWeight: 700, paddingTop: 32 }}>
              功能特权
            </div>
            {renderPrivilegeList('name')}
          </Card.Grid>
          <Card.Grid style={{ width: '25%', padding: 0, textAlign: 'center' }}>
            <div style={{ height: 90 }}>
              <Space style={{ marginTop: 32 }}>
                <img width={30} src="https://files.laifaxin.com/www/normal.jpg" />
                <span style={{ fontSize: 20, fontWeight: 700 }}>普通会员</span>
              </Space>
            </div>
            {renderPrivilegeList('normal')}
          </Card.Grid>
          <Card.Grid style={{ width: '25%', padding: 0 }}>
            <div style={{ height: 90 }}>
              <Space style={{ marginTop: 16 }}>
                <img width={30} src="https://files.laifaxin.com/www/vip.jpg" />
                <span style={{ fontSize: 20, fontWeight: 700 }}>VIP会员</span>
              </Space>
              <div>
                <Button
                  size="small"
                  shape="round"
                  style={{
                    color: '#64360d',
                    background: '#e9b966',
                    backgroundColor: '#e9b966',
                    borderColor: '#e9b966',
                    borderRadius: '100px',
                  }}
                  onClick={() => setState({ payVipVisible: true })}
                >
                  开通VIP
                </Button>
              </div>
            </div>
            {renderPrivilegeList('vip')}
          </Card.Grid>
          <Card.Grid
            style={{
              width: '25%',
              padding: 0,
              color: '#ca963b',
              backgroundColor: '#fbf4e4',
              borderColor: '#e9b966',
            }}
          >
            <div style={{ height: 90 }}>
              <Space style={{ marginTop: 16 }}>
                <img width={30} src="https://files.laifaxin.com/www/svip.jpg" />
                <span style={{ fontSize: 20, fontWeight: 700 }}>SVIP会员</span>
              </Space>
              <div>
                <Button
                  size="small"
                  shape="round"
                  style={{
                    color: '#64360d',
                    background: '#e9b966',
                    backgroundColor: '#e9b966',
                    borderColor: '#e9b966',
                    borderRadius: '100px',
                  }}
                  onClick={() => setState({ payVipVisible: true })}
                >
                  开通SVIP
                </Button>
              </div>
            </div>
            {renderPrivilegeList('svip')}
          </Card.Grid>
        </Card>
      </div>
      <PayVip
        visible={state.payVipVisible}
        onCancel={() => setState({ payVipVisible: false })}
        openQrcode={(id, app, url) => openQrcode(id, app, url)}
        actionReload={() => {}}
      />
      <PayQrocde
        visible={state.qrcodeVisible}
        codeUrl={state.codeUrl}
        app={state.app}
        id={state.id}
        onCancel={() => setState({ qrcodeVisible: false })}
        actionReload={() => getData()}
      />
    </Modal>
  );
};

export default VipInfo;
