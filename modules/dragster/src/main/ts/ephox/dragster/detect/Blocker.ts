import { Attribute, Class, Css, Remove, SugarElement } from '@ephox/sugar';
import * as Styles from '../style/Styles';

export interface BlockerOptions {
  layerClass: string;
}

export interface Blocker {
  element: () => SugarElement;
  destroy: () => void;
}

export const Blocker = function (options: Partial<BlockerOptions>): Blocker {
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

  const element = function () {
    return div;
  };

  const destroy = function () {
    Remove.remove(div);
  };

  return {
    element,
    destroy
  };
};
