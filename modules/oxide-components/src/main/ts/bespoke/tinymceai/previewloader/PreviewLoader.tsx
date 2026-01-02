import type { FunctionComponent, PropsWithChildren, ReactNode } from 'react';

import * as Bem from '../../../utils/Bem';
import { Spinner } from '../spinner/Spinner';

interface PreviewLoaderProps extends PropsWithChildren {
  text: ReactNode;
}

export const PreviewLoader: FunctionComponent<PreviewLoaderProps> = ({ text, children }) =>
  (
    <div className={Bem.block('tox-ai-previewloader')}>
      <div className={Bem.element('tox-ai-previewloader', 'content')}>
        <Spinner type="dots" /> { text }
      </div>
      { children }
    </div>
  );
