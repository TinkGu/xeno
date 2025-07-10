import React, { useContext, useState } from 'react';
import type { IRouteComponentProps } from '@umijs/types';
import Navbar from 'dumi-theme-default/es/components/Navbar';
import SearchBar from 'dumi-theme-default/es/components/SearchBar';
import SlugList from 'dumi-theme-default/es/components/SlugList';
import 'dumi-theme-default/es/style/layout.less';
import { context, Link } from 'dumi/theme';
import SideMenu from '../components/side-menu';
import '../styles/markdown.less';
import '../styles/typedoc.less';
import './layout.less';

const Hero = (hero) => (
  <>
    <div className="__dumi-default-layout-hero">
      {hero.image && <img src={hero.image} />}
      <h1>{hero.title}</h1>
      <div dangerouslySetInnerHTML={{ __html: hero.desc }} />
      {hero.actions &&
        hero.actions.map((action) => (
          <Link to={action.link} key={action.text}>
            <button type="button">{action.text}</button>
          </Link>
        ))}
    </div>
  </>
);

const Layout: React.FC<IRouteComponentProps> = ({ children, location }) => {
  const {
    config: { mode },
    nav: navItems,
    meta,
  } = useContext(context);
  const [menuCollapsed, setMenuCollapsed] = useState<boolean>(true);
  const isSiteMode = mode === 'site';
  const showHero = isSiteMode && meta.hero;
  const showSideMenu = meta.sidemenu !== false && !showHero && !meta.gapless;
  const showSlugs = !showHero && Boolean(meta.slugs?.length) && (meta.toc === 'content' || meta.toc === undefined) && !meta.gapless;
  const updatedTimeIns = new Date(meta.updatedTime);
  const updatedTime: any = `${updatedTimeIns.toLocaleDateString([], { hour12: false })} ${updatedTimeIns.toLocaleTimeString([], {
    hour12: false,
  })}`;

  return (
    <div
      className="__dumi-default-layout __xeno-dumi-default-layout"
      data-route={location.pathname}
      data-show-sidemenu={String(showSideMenu)}
      data-show-slugs={String(showSlugs)}
      data-site-mode={isSiteMode}
      data-gapless={String(!!meta.gapless)}
      onClick={() => {
        if (menuCollapsed) return;
        setMenuCollapsed(true);
      }}
    >
      <Navbar
        location={location}
        navPrefix={<SearchBar />}
        onMobileMenuClick={(ev) => {
          setMenuCollapsed((val) => !val);
          ev.stopPropagation();
        }}
      />
      <SideMenu location={location} />
      {showSlugs && <SlugList slugs={meta.slugs} className="__dumi-default-layout-toc" />}
      {showHero && Hero(meta.hero)}
      <div className="__dumi-default-layout-content">
        {children}
        {!showHero && meta.filePath && !meta.gapless && (
          <div className="__dumi-default-layout-footer-meta">
            <span data-updated-text="最后更新时间：">{updatedTime}</span>
          </div>
        )}
        {showHero && meta.footer && <div className="__dumi-default-layout-footer" dangerouslySetInnerHTML={{ __html: meta.footer }} />}
      </div>
    </div>
  );
};

export default Layout;
