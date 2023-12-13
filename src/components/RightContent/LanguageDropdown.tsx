import React, { useCallback } from 'react';

import { Menu } from 'antd';
import { useIntl, setLocale } from 'umi';

import HeaderDropdown from '../HeaderDropdown';
import styles from './index.less';


export default () => {
    const intl = useIntl();
    const onMenuClick = useCallback(
        (event: {
        key: React.Key;
        keyPath: React.Key[];
        item: React.ReactInstance;
        domEvent: React.MouseEvent<HTMLElement>;
        }) => {
        },
        [],
    );
    const menuHeaderDropdown = (
        <Menu onClick={()=>onMenuClick}>
            <Menu.Item onClick={()=>setLocale('zh-CN', true)}>cn 中文</Menu.Item>
            <Menu.Item onClick={()=>setLocale('en-US', true)}>us English</Menu.Item>
        </Menu>
    );

    return (
        <HeaderDropdown overlay={menuHeaderDropdown}>
            <span className={`${styles.action} ${styles.account}`}>
                <span className={`${styles.name} anticon`}>{intl.formatMessage({id: 'navBar.lang'})}</span>
            </span>
        </HeaderDropdown>
    )
}
