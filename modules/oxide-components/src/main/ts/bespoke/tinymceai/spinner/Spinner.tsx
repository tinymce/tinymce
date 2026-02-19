import { Bem } from 'oxide-components/main';
import type { FunctionComponent } from 'react';

interface SpinnerProps {
  type?: 'circle' | 'dots';
  size?: 'normal' | 'small';
}

export const Spinner: FunctionComponent<SpinnerProps> = ({ type = 'circle', size = 'normal' }) =>
  <div className={Bem.element('tox-ai', 'spinner', { dots: type === 'dots', circle: type === 'circle', small: size === 'small' })}>
    { type === 'dots' && (
      <>
        <div></div>
        <div></div>
        <div></div>
      </>
    )}
  </div>;
