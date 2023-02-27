import React from 'react';
import { Alert } from 'antd';
const { userAgent } = window.navigator;

const BrowserAlert: React.FC = () => {
  let showAlert = true;
  if (userAgent.includes('Chrome/')) {
    const ver = userAgent.split('Chrome/')[1].split('.')[0];
    if (parseInt(ver) >= 90) {
      showAlert = false;
    }
  } else if (userAgent.includes('Firefox/')) {
    const ver = userAgent.split('Firefox/')[1].split('.')[0];
    if (parseInt(ver) >= 90) {
      showAlert = false;
    }
  }
  if (!showAlert) {
    return null;
  }
  return (
    <Alert
      showIcon={false}
      message={
        <div
          style={{
            color: 'white',
            height: 64,
            marginLeft: 48,
            paddingTop: 12,
          }}
        >
          <div>
            本网站提供的部分服务在你当前浏览器中无法使用，建议你更换为 Edge 或 Chrome
            浏览器查看本网站。
          </div>
          <div style={{ marginTop: 6 }}>
            <a
              href="https://www.microsoft.com/zh-cn/edge/download"
              target="_blank"
              rel="noreferrer"
            >
              Edge 浏览器下载地址
            </a>
            <a
              href="https://www.google.cn/intl/zh-CN/chrome"
              target="_blank"
              rel="noreferrer"
              style={{ marginLeft: 36 }}
            >
              Chrome 浏览器下载地址
            </a>
            <a
              href="https://browser.360.cn/se"
              target="_blank"
              rel="noreferrer"
              style={{ marginLeft: 36 }}
            >
              360 浏览器下载地址(版本SE14)
            </a>
          </div>
        </div>
      }
      banner
      style={{
        backgroundColor: 'black',
      }}
    />
  );
};

export default BrowserAlert;
