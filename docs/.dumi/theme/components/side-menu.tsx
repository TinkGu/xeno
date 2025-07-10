import type { FC } from 'react';
import React, { useContext } from 'react';
import type { IMenuItem } from '@umijs/preset-dumi/lib/routes/getMenuFromRoutes';
import type { IThemeContext } from '@umijs/preset-dumi/lib/theme/context';
import { context, NavLink } from 'dumi/theme';
import fileMap from '../../../../scripts/file-map';
import './side-menu.less';

interface INavbarProps {
  location: any;
  darkPrefix?: React.ReactNode;
}

function getMenus(theContext: IThemeContext) {
  const { menu: menus, meta, routes } = theContext;
  if (!menus.length) {
    return [];
  }
  const modules = menus.find((x) => x.path === '/api/modules');
  if (!modules) {
    return menus;
  }

  const fileMapPathList = fileMap.map((x) => `/api/modules/${x}`);
  modules.title = '版本历史 ChangeLog';
  const indexModules = [];
  const subModules = [];
  modules.children.forEach((x) => {
    // 不展示概览
    if (x.path === '/api/modules') {
      return;
    }
    if (fileMapPathList.includes(x.path)) {
      subModules.push(x);
    } else {
      indexModules.push(x);
    }
  });
  const { children: _, ...overview } = modules;
  return [
    overview as IMenuItem,
    { title: '核心模块', isFamily: true, children: indexModules, path: undefined },
    { title: '子模块', isFamily: true, children: subModules, path: undefined },
  ];
}

const SideMenu: FC<INavbarProps> = ({ location }) => {
  const theContext = useContext(context);
  const { config, meta } = theContext;
  const { mode } = config;
  const isHiddenMenus = Boolean((meta.hero || meta.features || meta.gapless) && mode === 'site') || meta.sidemenu === false || undefined;

  if (isHiddenMenus) return null;
  const menu = getMenus(theContext);

  return (
    <div className="__dumi-default-menu">
      <div className="__dumi-default-menu-inner">
        {/* menu list */}
        <ul className="__dumi-default-menu-list">
          {menu.map((item) => {
            // always use meta from routes to reduce menu data size
            const hasChildren = item.children && Boolean(item.children.length);
            const menuPaths = hasChildren
              ? item.children?.map((i) => i.path)
              : [
                  item.path,
                  // handle menu group which has no index route and no valid children
                  location.pathname.startsWith(`${item.path}/`) ? location.pathname : null,
                ];

            if (hasChildren) {
              return (
                <li key={item.path || item.title}>
                  <NavLink to={item.path} isActive={() => menuPaths?.includes(location.pathname) ?? false}>
                    <span className="adm-doc-group-title">{item.title}</span>
                  </NavLink>
                  <ul>
                    {item.children?.map((child) => {
                      if (child.isFamily) {
                        return (
                          <li key={child.name}>
                            <span className="xeno-doc-menu-family">{child.name}</span>
                          </li>
                        );
                      }

                      const [enTitle, ...zhTitles] = child.title?.split(' ') || [];
                      const zhTitle = zhTitles.join(' ');
                      return (
                        <li key={child.path}>
                          <NavLink to={child.path} exact>
                            <span className="xeno-doc-menu-child">
                              {enTitle}
                              <span className="xeno-doc-title-zh">{zhTitle}</span>
                            </span>
                          </NavLink>
                        </li>
                      );
                    })}
                  </ul>
                </li>
              );
            } else {
              return (
                <li key={item.path}>
                  <NavLink to={item.path} exact>
                    <span>{item.title}</span>
                  </NavLink>
                </li>
              );
            }
          })}
        </ul>
      </div>
    </div>
  );
};

export default SideMenu;
