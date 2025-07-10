import React, { useState, useContext, useRef } from 'react';
// @ts-ignore
import { history } from 'dumi';
import SourceCode from 'dumi-theme-default/es/builtins/SourceCode';
import type { IPreviewerProps } from 'dumi-theme-default/src/builtins/Previewer';
import type { ICodeBlockProps } from 'dumi-theme-default/src/builtins/SourceCode';
import type { IPreviewerComponentProps } from 'dumi/theme';
import { context, useMotions, useCopy, useLocaleProps, AnchorLink, useDemoUrl } from 'dumi/theme';
import Tabs, { TabPane } from 'rc-tabs';
import { Device } from '../../components/device';
import './Previewer.less';

/**
 * get source code type for file
 * @param file    file path
 * @param source  file source object
 */
function getSourceType(file: string, source: IPreviewerComponentProps['sources']['_']) {
  // use file extension as source type first
  let type = file.match(/\.(\w+)$/)?.[1];

  if (!type) {
    type = source.tsx ? 'tsx' : 'jsx';
  }

  return type as ICodeBlockProps['lang'];
}

const Previewer: React.FC<IPreviewerProps> = (oProps) => {
  const demoRef = useRef<HTMLDivElement>(null);
  const { locale } = useContext(context);
  const props = useLocaleProps<IPreviewerProps>(locale, oProps);
  const isActive = history?.location.hash === `#${props.identifier}`;
  const isSingleFile = Object.keys(props.sources).length === 1;
  const [execMotions, isMotionRunning] = useMotions(props.motions || [], demoRef.current);
  const [copyCode, copyStatus] = useCopy();
  const [currentFile, setCurrentFile] = useState('_');
  const [sourceType, setSourceType] = useState(getSourceType(currentFile, props.sources[currentFile]));
  const currentFileCode = props.sources[currentFile][sourceType] || props.sources[currentFile].content;

  function handleFileChange(filename: string) {
    setCurrentFile(filename);
    setSourceType(getSourceType(filename, props.sources[filename]));
  }

  return (
    <div
      style={props.style}
      className={[props.className, '__dumi-default-previewer', isActive ? '__dumi-default-previewer-target' : ''].filter(Boolean).join(' ')}
      id={props.identifier}
      data-debug={props.debug || undefined}
    >
      <div className="__dumi-default-previewer-desc" data-title={props.title}>
        {props.title && <AnchorLink to={`#${props.identifier}`}>{props.title}</AnchorLink>}
        {props.description && <div dangerouslySetInnerHTML={{ __html: props.description }} />}
      </div>
      <div className="__dumi-default-previewer-actions">
        {props.debug && <span className="debug-badge">Debug Only</span>}
        {props.motions && (
          <button
            title="Execute motions"
            className="__dumi-default-icon"
            role="motions"
            disabled={isMotionRunning}
            onClick={() => execMotions()}
          />
        )}
        <div className="spacer" />
        <button
          title="Copy source code"
          className="__dumi-default-icon"
          role="copy"
          data-status={copyStatus}
          onClick={() => copyCode(currentFileCode)}
        />
      </div>
      <div className="__dumi-default-previewer-source-wrapper">
        {!isSingleFile && (
          <Tabs
            className="__dumi-default-previewer-source-tab"
            prefixCls="__dumi-default-tabs"
            moreIcon="···"
            defaultActiveKey={currentFile}
            onChange={handleFileChange}
          >
            {Object.keys(props.sources).map((filename) => (
              <TabPane tab={filename === '_' ? `index.${getSourceType(filename, props.sources[filename])}` : filename} key={filename} />
            ))}
          </Tabs>
        )}
        <div className="__dumi-default-previewer-source">
          <SourceCode code={currentFileCode} lang={sourceType} showCopy={false} />
        </div>
      </div>
    </div>
  );
};

export const MobilePreviewer = (props: IPreviewerProps) => {
  const builtinDemoUrl = useDemoUrl(props.identifier);

  return (
    <div className="adm-doc-previewer" data-debug={props.debug || undefined}>
      <div className="adm-doc-previewer-source">
        <Previewer {...props} />
      </div>
      <div className="adm-doc-previewer-device">
        <Device url={props.demoUrl ?? builtinDemoUrl} />
      </div>
    </div>
  );
};
