import ProCard from '@ant-design/pro-card';
import { Divider, Row, Col, Progress } from 'antd';
import React from 'react';

interface ParamProps {
  delivered: object;
  opened: object;
  clicked: object;
  sended: object;
  downed: object;
}

const NewQuotaCard = (data: any) => {
  const { title, per, sub1Title, sub1Value, sub2Title, sub2Value } = data;
  return (
    <Row gutter={24}>
      <Col sm={12} xs={12}>
        <div style={{ fontSize: 24 }}>
          <span style={{ marginRight: 10, fontWeight: 500 }}>
            {title} <a>{per}%</a>
          </span>
        </div>
        <div style={{ marginTop: 24, fontSize: 16 }}>
          <Row>
            <Col span={18}>
              <span>{sub1Title}</span>
            </Col>
            <Col span={6}>
              <span>{sub1Value}</span>
            </Col>
          </Row>
        </div>
        <Divider style={{ marginTop: 10 }} />
        <div style={{ marginTop: 24, fontSize: 16 }}>
          <Row>
            <Col span={18}>
              <span>{sub2Title}</span>
            </Col>
            <Col span={6}>
              <span>{sub2Value}</span>
            </Col>
          </Row>
        </div>
        <Divider style={{ marginTop: 10 }} />
      </Col>
      <Col sm={12} xs={12}>
        <div style={{ marginTop: 24, textAlign: 'center' }}>
          <Progress type="circle" percent={per} status="normal" />
        </div>
      </Col>
    </Row>
  );
};

const Performance: React.FC<ParamProps> = (props) => {
  const { delivered, opened, clicked, sended, downed } = props;

  return (
    <>
      <ProCard gutter={8} title={false}>
        <ProCard colSpan={{ xs: 24, sm: 8 }} layout="center" bordered>
          {NewQuotaCard(sended)}
        </ProCard>
        <ProCard colSpan={{ xs: 24, sm: 8 }} layout="center" bordered>
          {NewQuotaCard(delivered)}
        </ProCard>
        <ProCard colSpan={{ xs: 24, sm: 8 }} layout="center" bordered>
          {NewQuotaCard(opened)}
        </ProCard>
      </ProCard>
      <ProCard style={{ marginTop: 12 }} gutter={8} title={false}>
        <ProCard colSpan={{ xs: 24, sm: 8 }} layout="center" bordered>
          {NewQuotaCard(clicked)}
        </ProCard>
        <ProCard colSpan={{ xs: 24, sm: 8 }} layout="center" bordered>
          {NewQuotaCard(downed)}
        </ProCard>
      </ProCard>
    </>
  );
};

export default Performance;
