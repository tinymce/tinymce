import { Fun } from '@ephox/katamari';
import { Attribute, Class, Css, Remove, SugarElement } from '@ephox/sugar';

import * as Styles from '../style/Styles';

export interface BlockerOptions {
  readonly layerClass: string;
}

export interface Blocker {
  readonly element: () => SugarElement<HTMLElement>;
  readonly destroy: () => void;
}

export const Blocker = (options: Partial<BlockerOptions>): Blocker => {
  const settings: BlockerOptions = {
    layerClass: Styles.resolve('blocker'),
    ...options
  };

  const div = SugarElement.fromTag('div');
  Attribute.set(div, 'role', 'presentation');
  Css.setAll(div, {
    position: 'fixed',
    left: '0px',
    top: '0px',
    width: '100%',
    height: '100%'
  });

  Class.add(div, Styles.resolve('blocker'));
  Class.add(div, settings.layerClass);

  const element = Fun.constant(div);

  const destroy = () => {
    Remove.remove(div);
  };

  return {
    element,
    destroy
  };
};
