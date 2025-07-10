import React from 'react';
import Previewer from 'dumi-theme-default/es/builtins/Previewer';
import type { IPreviewerProps } from 'dumi-theme-default/src/builtins/Previewer';
import { MobilePreviewer } from './preview-mobile/Previewer';

export const ACTIVE_MSG_TYPE = 'dumi:scroll-into-demo';

export default (props: IPreviewerProps) => {
  if (props.mobile) {
    return <MobilePreviewer {...props} />;
  }

  return <Previewer {...props} />;
};
