import { Optional } from '@ephox/katamari';
import { Class, Css, SugarElement } from '@ephox/sugar';
import { isDecisionBottomAligned, isDecisionTopAligned, isElementBottomAligned, isElementTopAligned } from '../../api/behaviour/PositionUtils';
import { contextBarTransitionClass } from '../layout/LayoutLabels';
import { RepositionDecision } from './Reposition';

export interface PositionCss {
  readonly position: string;
  readonly left: Optional<number>;
  readonly top: Optional<number>;
  readonly right: Optional<number>;
  readonly bottom: Optional<number>;
}

const NuPositionCss = (
  position: string,
  left: Optional<number>,
  top: Optional<number>,
  right: Optional<number>,
  bottom: Optional<number>
): PositionCss => ({
  position,
  left,
  top,
  right,
  bottom
});

const applyPositionCss = (element: SugarElement, position: PositionCss, decision: Optional<RepositionDecision>): void => {
  const addPx = (num: number) => num + 'px';

  const cssOptions = {
    position: Optional.some(position.position),
    left: position.left.map(addPx),
    top: position.top.map(addPx),
    right: position.right.map(addPx),
    bottom: position.bottom.map(addPx)
  };

  const changedFromTopToBottom = isElementTopAligned(element) && isDecisionBottomAligned(decision);
  const changedFromBottomToTop = isElementBottomAligned(element) && isDecisionTopAligned(decision);

  if (changedFromTopToBottom || changedFromBottomToTop) {
    Css.set(element, 'position', 'absolute');

    const getValue = (key: 'top' | 'left' | 'bottom' | 'right') => {
      if (cssOptions[key].isSome()) {
        return Optional.some(Css.get(element, key));
      } else {
        return Optional.none<string>();
      }
    };

    const intermediateCssOptions = {
      position: cssOptions.position,
      top: getValue('top'),
      right: getValue('right'),
      bottom: getValue('bottom'),
      left: getValue('left'),
    };

    Css.setOptions(element, intermediateCssOptions);
    Class.add(element, contextBarTransitionClass);
    Css.reflow(element);
  }

  Css.setOptions(element, cssOptions);
};

export {
  NuPositionCss,
  applyPositionCss
};
