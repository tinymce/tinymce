import type { FunctionComponent, HTMLAttributes, PropsWithChildren, ReactNode } from 'react';

import * as Bem from '../../../utils/Bem';
import { Spinner } from '../spinner/Spinner';

interface PreviewLoaderProps extends PropsWithChildren, HTMLAttributes<HTMLDivElement> {
  text?: ReactNode;
}

export const PreviewLoader: FunctionComponent<PreviewLoaderProps> = ({ text, children, className, ...props }) => {
  const baseClass = Bem.block('tox-ai-previewloader');
  const mergedClassName = [ baseClass, className ].filter(Boolean).join(' ');

  return (
    <div className={mergedClassName} {...props}>
      <div className={Bem.element('tox-ai-previewloader', 'content')}>
        <Spinner type="dots" /> { text }
      </div>
      { children }
    </div>
  );
};
