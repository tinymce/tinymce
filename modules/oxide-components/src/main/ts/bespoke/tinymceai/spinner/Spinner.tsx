import type { Property } from 'csstype';
import type { FunctionComponent } from 'react';

import * as Bem from '../../../utils/Bem';

interface SpinnerProps {
  type?: 'circle' | 'dots';
  size?: 'normal' | 'small';
  color?: Property.Color;
};

export const Spinner: FunctionComponent<SpinnerProps> = ({ type = 'circle', size = 'normal', color }) =>
  <div className={Bem.element('tox-ai', 'spinner', { dots: type === 'dots', circle: type === 'circle', small: size === 'small' })}
    style={color ? { '--tox-private-spinner-color': color } as React.CSSProperties : undefined}>
    { type === 'dots' && (
      <>
        <div></div>
        <div></div>
        <div></div>
      </>
    )}
  </div>;
