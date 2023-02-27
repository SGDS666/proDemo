import React from 'react';
import { Link } from 'umi';
import styles from './UserLayout.less';

export type Props = {
  children: React.ReactNode;
};

export default ({ children }: Props) => {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.top}>
          <div className={styles.header}>
            <Link to="/">
              <img
                alt="logo"
                className={styles.logo}
                src="https://files.laifaxin.com/www/logo.png"
              />
              <span className={styles.title}>来发信</span>
            </Link>
          </div>
          <div className={styles.desc}>让营销更容易，获客更轻松，询盘更简单！</div>
        </div>
        {children}
      </div>
    </div>
  );
};
