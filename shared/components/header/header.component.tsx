import React, { FunctionComponent } from 'react';
import Link from 'next/link';

import styles from './header.module.scss';

const Header: FunctionComponent = () => {
  return (
    
    <div className={styles.nav}>
      <div className={styles.brand}>
        <Link href="/">
          <img
            className={styles.brand__logo}
            src="https://www.techhive.io/static/brand/logo-masterclass.svg"
            alt="logo"
          />
        </Link>

        <h3 className={styles.brand__name}>
          Hai Con Meo
        </h3>
      </div>
    </div>
  );
};

export default Header;
