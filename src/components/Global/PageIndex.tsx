import React, { useEffect } from 'react';
import { Button, Result, Spin } from 'antd';
import { history, useModel } from '@umijs/max';

export type PageProps = {
  pageGroup: string;
};

const PageIndex: React.FC<PageProps> = (props) => {
  const { pageGroup } = props;
  const { initialState } = useModel('@@initialState');
  if (!initialState) {
    return <Spin size="large">未登录</Spin>;
  }
  const checkJumpUrl = () => {
    const { pageAuth } = initialState;
    if (!pageAuth) {
      history.push('/');
      return;
    }
    let redirectPath = '/';
    // eslint-disable-next-line guard-for-in
    for (const key in pageAuth) {
      const { path } = pageAuth[key];
      if (key && path && key.split('.')[0] === pageGroup) {
        redirectPath = path;
        break;
      }
    }
    history.push(redirectPath);
  };
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    checkJumpUrl();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Result
      status="403"
      title="403"
      subTitle="对不起，您没有权限访问该项目。"
      extra={
        <Button type="primary" onClick={() => history.push('/')}>
          返回主页
        </Button>
      }
    />
  );
};

export default PageIndex;
