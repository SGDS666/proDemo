import { Button, Result } from 'antd';
import { Link } from '@umijs/max';
import React from 'react';
import UserLayout from '@/layouts/UserLayout';

import styles from './style.less';
import { getPageQuery } from '@/utils/common';

const actions = (
  <div className={styles.actions}>
    <Link to="/user/login">
      <Button size="large" type="primary">
        立即登录
      </Button>
    </Link>
    <Link to="/user/regist">
      <Button size="large">再次注册</Button>
    </Link>
  </div>
);

export type LocationState = Record<string, unknown>;

const RegistSuccess: React.FC<any> = () => {
  const params = getPageQuery();
  const account = params.account ? params.account : '';

  return (
    <UserLayout>
      <Result
        className={styles.registerResult}
        status="success"
        title={`你的账户：${account} 注册成功`}
        subTitle="欢迎注册来发信"
        extra={actions}
      />
    </UserLayout>
  );
};

export default RegistSuccess;
