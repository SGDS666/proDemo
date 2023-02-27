import React from 'react';
import { Modal, Button, List, Popover, Image } from 'antd';
import { FormOutlined, UserAddOutlined, QrcodeOutlined } from '@ant-design/icons';
import { useSetState } from 'ahooks';
import CopyModal from './CopyModal';
import WriteModal from './WriteModal';
import { apiPartnerHide } from '@/services/partner';
import { useRequest } from '@umijs/max';

interface FormProps {
  uid: string;
  pid: string;
  inviteCount: number;
  inviteLink: string;
  visible: boolean;
  onCancel: () => void;
}

const PartnerModal: React.FC<FormProps> = (props) => {
  const { uid, pid, inviteCount, inviteLink, visible, onCancel } = props;
  const [state, setState] = useSetState({
    copyVisible: false,
    writeVisible: false,
  });

  const { run: hideRun } = useRequest(apiPartnerHide, {
    manual: true,
    onSuccess: () => onCancel(),
  });

  const onClickHideForever = async () => {
    hideRun();
  };

  const header = () => {
    return (
      <>
        <div>
          <div style={{ fontSize: 36, marginTop: 12 }}>不限量特权领取</div>
          <div style={{ fontSize: 20, marginTop: 12, marginBottom: 12 }}>
            简单几步，获取无限邮箱验证、邮件群发、邮件追踪
          </div>
        </div>
      </>
    );
  };

  const qrcodeContent = (
    <div style={{ textAlign: 'center' }}>
      <Image width={240} src="https://files.laifaxin.com/www/apan.png" />
      <p>使用微信扫码加入交流群</p>
    </div>
  );

  const getData = () => [
    {
      title: `邀请3名用户 (${inviteCount}/3)`,
      description: '领取无限邮箱验证',
      actions:
        inviteCount >= 3
          ? [
              <a style={{ marginRight: 16 }} key="finishKey">
                已完成
              </a>,
            ]
          : [
              <Button
                type="primary"
                shape="round"
                onClick={() => setState({ copyVisible: true })}
                key="inviteKey"
              >
                去邀请
              </Button>,
            ],
      avatar: (
        <UserAddOutlined
          className="invite"
          style={{ fontSize: '48px', color: '#2eabff', marginTop: 16 }}
        />
      ),
    },
    {
      title: '填写他人的邀请码',
      description: '领取无限邮件追踪',
      actions: pid
        ? [
            <a style={{ marginRight: 16 }} key="fKey">
              已完成
            </a>,
          ]
        : [
            <Button
              type="primary"
              shape="round"
              onClick={() => setState({ writeVisible: true })}
              key="wKey"
            >
              去填写
            </Button>,
          ],
      avatar: (
        <FormOutlined
          className="invite"
          style={{ fontSize: '48px', color: '#2eabff', marginTop: 16 }}
        />
      ),
    },
    {
      title: '扫码加入交流群',
      description: '获取更多优惠信息',
      actions: [
        <Popover content={qrcodeContent} title={null} key="sKey">
          <Button type="primary" shape="round">
            扫 码
          </Button>
        </Popover>,
      ],
      avatar: (
        <QrcodeOutlined
          className="invite"
          style={{ fontSize: '48px', color: '#2eabff', marginTop: 16 }}
        />
      ),
    },
  ];

  const footer = () => {
    return (
      <div style={{ textAlign: 'right' }}>
        <Button type="dashed" size="small" onClick={onCancel} style={{ marginRight: 12 }}>
          关闭
        </Button>
        <Button type="dashed" size="small" onClick={onClickHideForever}>
          不再提示
        </Button>
      </div>
    );
  };

  return (
    <Modal
      destroyOnClose
      width={640}
      title={null}
      open={visible}
      onCancel={() => onCancel()}
      closable={false}
      footer={footer()}
      bodyStyle={{ padding: '0px 0px' }}
    >
      <div
        style={{
          color: '#fff',
          background: '#5b8efd',
          padding: '12px 12px',
          textAlign: 'center',
          borderRadius: 6,
        }}
      >
        {header()}
      </div>
      <div style={{ padding: '24px 24px' }}>
        <List
          itemLayout="horizontal"
          dataSource={getData()}
          renderItem={(item) => (
            <List.Item actions={item.actions}>
              <List.Item.Meta
                avatar={item.avatar}
                title={item.title}
                description={item.description}
              />
            </List.Item>
          )}
        />
      </div>

      <CopyModal
        onCancel={() => setState({ copyVisible: false })}
        visible={state.copyVisible}
        inviteCode={uid.toUpperCase()}
        inviteCount={inviteCount}
        inviteLink={inviteLink}
      />
      <WriteModal onCancel={() => setState({ writeVisible: false })} visible={state.writeVisible} />
    </Modal>
  );
};

export default PartnerModal;
