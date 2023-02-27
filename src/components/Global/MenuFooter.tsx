import React, { useEffect } from 'react';
import { useModel, useRequest } from '@umijs/max';
import { useSetState } from 'ahooks';
import { apiAccountBalnace } from '@/services/user';

export type FooterProps = {
  collapsed: boolean | undefined;
};

const MenuFooter: React.FC<FooterProps> = (props) => {
  const { initialState } = useModel('@@initialState');
  const { currentUser } = initialState ?? {};
  const [, setState] = useSetState({
    searchCount: 0,
    sendCount: 0,
  });
  const { collapsed } = props;

  const { run: balnaceRun } = useRequest(apiAccountBalnace, {
    manual: true,
    onSuccess: (data: any) => {
      if (!data) return;
      const { sendCount, searchCount } = data;
      setState({ sendCount, searchCount });
    },
  });

  useEffect(() => {
    if (currentUser) {
      balnaceRun();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]);

  if (collapsed) return null;

  return null;
};

export default MenuFooter;
