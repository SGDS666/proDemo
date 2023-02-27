import { InfoCircleFilled } from '@ant-design/icons';
import { Button, Result, Typography } from 'antd';
import { ReactNode } from 'react';

const { Paragraph, Text, } = Typography;
const Icon = <InfoCircleFilled style={{ marginRight: "10px" }} />
const ErrorUI: React.FC<{ code?: ReactNode }> = ({ code }) => (
  <Result
    status="info"
    title="你的浏览器出了一些问题"
    subTitle="一般出现这个页面都是浏览器插件导致"
    extra={[
      <Button type="primary" key="console" onClick={() => window.location.assign("/")}>
        刷新页面
      </Button>,
    ]}
  >
    <div style={{ fontWeight: "bold" }}>
      <Paragraph strong code>错误代码:{code}</Paragraph>
      <Paragraph>
        <Text
          strong
          style={{
            fontSize: 26,
          }}
        >
          这是一些常见的错误自检流程
        </Text>
      </Paragraph>
      <Paragraph >
        {Icon}
        请尝试关闭会影响页面的浏览器插件
      </Paragraph>
      <Paragraph>
        {Icon}
        请尝试升级插件到最新版本
      </Paragraph>
      <Paragraph>
        {Icon}
        请尝试使用最新版本的 chrome 或者 edge浏览器
      </Paragraph>
      <Paragraph>
        {Icon}
        请尝试清空浏览器缓存
      </Paragraph>
    </div>
  </Result>
);

export default ErrorUI