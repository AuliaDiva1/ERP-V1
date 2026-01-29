/* eslint-disable @next/next/no-img-element */

import React, { useContext } from 'react';
import AppMenuitem from './AppMenuitem';
import { LayoutContext } from './context/layoutcontext';
import { MenuProvider } from './context/menucontext';
import Link from 'next/link';
import { AppMenuItem } from '@/types';

const AppMenu = () => {
    const { layoutConfig } = useContext(LayoutContext);

    const model: AppMenuItem[] = [
        {
            label: 'Home',
            items: [{ label: 'Dashboard', icon: 'pi pi-fw pi-home', to: '/' }]
        },
        {
            label: 'Master',
            // icon: 'pi pi-fw pi-briefcase',
            to: '/pages',
            items: [
                {
                    label: 'Master',
                    icon: 'pi pi-fw pi-circle',
                    items: [
                        {
                            label: 'Mesin',
                            icon: 'pi pi-fw pi-cog',
                            to: '/master/mesin'
                        },
                        {
                            label: 'User',
                            icon: 'pi pi-fw pi-user',
                            to: '/master/user'
                        }
                    ]
                }
            ]
        },
        {
            label: 'Monitor',
            // icon: 'pi pi-fw pi-briefcase',
            to: '/pages',
            items: [
                {
                    label: 'Monitor Suhu',
                    icon: 'pi pi-fw pi-circle',
                    items: [
                        {
                            label: 'Update Suhu Mesin',
                            icon: 'pi pi-fw pi-sync',
                            to: '/monitor/suhu'
                        }
                    ]
                }
            ]
        }
    ];

    return (
        <MenuProvider>
            <ul className="layout-menu">
                {model.map((item, i) => {
                    return !item?.seperator ? <AppMenuitem item={item} root={true} index={i} key={item.label} /> : <li className="menu-separator"></li>;
                })}
            </ul>
        </MenuProvider>
    );
};

export default AppMenu;
