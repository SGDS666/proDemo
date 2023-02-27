import React from 'react';
import { Spin } from 'antd';
import { useModel, Access } from '@umijs/max';

export type AccessProps = {
  children: React.ReactNode;
  accessKey: string;
};

export default ({ children, accessKey }: AccessProps) => {
  const { initialState } = useModel('@@initialState');
  if (!initialState) {
    return <Spin size="large">未登录</Spin>;
  }
  const { userPermissions, currentUser } = initialState;

  const canAccess = () => {
    const { uid, orgId } = currentUser ?? {};
    if (!orgId) return true;
    if (uid === orgId) return true;
    if (!accessKey) return true;
    if (userPermissions?.[accessKey]?.checked) return true;
    return false;
  };

  return <Access accessible={canAccess()}>{children}</Access>;
};
