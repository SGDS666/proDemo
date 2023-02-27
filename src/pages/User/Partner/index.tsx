import { Card, Button, Col, Row, message, Space } from 'antd';
import React from 'react';
import { ArrowRightOutlined } from '@ant-design/icons';
import { Link } from 'umi';
import copy from 'copy-to-clipboard';

const disStyle = { xs: 24, sm: 24, md: 12, lg: 12, xl: 12 };

const Partner: React.FC = ({}) => {
  const url = window.location.href;
  const code = url.split('/').pop();

  const onCopy = () => {
    copy(code ? code : '');
    message.success('复制成功');
  };

  return (
    <div style={{ paddingTop: 48, width: 900, margin: '0 auto' }}>
      <Row>
        <Col {...disStyle}>
          <a onClick={onCopy}>
            <Card bodyStyle={{ height: 420, textAlign: 'center', paddingTop: 100 }}>
              <div style={{ fontSize: 24, color: '#2d2d2d' }}>
                <span>填写我的邀请码</span>
              </div>
              <div style={{ fontSize: 40, fontWeight: 700, color: '#5189ff', marginTop: 24 }}>
                领取免费营销特权
              </div>
              <div style={{ marginTop: 24 }}>
                <Space size="middle">
                  <div style={{ fontSize: 42, fontWeight: 700, color: '#5189ff' }}>{code}</div>
                  <Button type="primary" shape="round">
                    复制
                  </Button>
                </Space>
              </div>
            </Card>
          </a>
        </Col>
        <Col {...disStyle}>
          <Link to={`/regist/${code}`}>
            <Card
              bodyStyle={{
                height: 420,
                backgroundColor: '#558cff',
                color: '#fff',
                paddingTop: 60,
                paddingLeft: 40,
              }}
            >
              <div style={{ fontWeight: 700, fontSize: 36 }}>
                <span>云端营销</span>
              </div>
              <div style={{ fontWeight: 700, fontSize: 36 }}>
                <span>一键搜索全球企业</span>
              </div>
              <div style={{ fontWeight: 500, fontSize: 24, marginTop: 24 }}>
                <span>客户管理 ★ 邮件营销 </span>
              </div>
              <div style={{ fontWeight: 500, fontSize: 24 }}>
                <span>邮件验证 ★ 邮件追踪</span>
              </div>
              <div style={{ marginTop: 36 }}>
                <Button shape="round">
                  免费领取 <ArrowRightOutlined />
                </Button>
              </div>
            </Card>
          </Link>
        </Col>
      </Row>
    </div>
  );
};
export default Partner;
