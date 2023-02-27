import React from 'react';
import { PageContainer } from '@ant-design/pro-components';

export type RightProps = {
  children: React.ReactNode;
  pageGroup: string;
  pageTitle: string | boolean;
  pageActive: string;
  style?: React.CSSProperties
  className?: string;
};

export default (props: RightProps) => {
  const { children, pageTitle } = props
  return (
    <>
      <PageContainer
        header={{
          title: pageTitle,
          breadcrumb: {},
        }}

        {...props}
      >
        {children}
      </PageContainer>
    </>
  );
};
