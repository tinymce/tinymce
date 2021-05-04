import { Optional } from '@ephox/katamari';
import { Class, Css, SugarElement } from '@ephox/sugar';
import { isDecisionBottomAligned, isDecisionTopAligned, isElementBottomAligned, isElementTopAligned } from '../../behaviour/positioning/PositionUtils';
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

const applyPositionCss = (element: SugarElement, position: PositionCss, decision: Optional<RepositionDecision>, transitionClass: Optional<string>): void => {
  const addPx = (num: number) => num + 'px';

  const cssOptions = {
    position: Optional.some(position.position),
    left: position.left.map(addPx),
    top: position.top.map(addPx),
    right: position.right.map(addPx),
    bottom: position.bottom.map(addPx)
  };

  transitionClass.each((transition) => {
    const changedFromTopToBottom = isElementTopAligned(element) && isDecisionBottomAligned(decision);
    const changedFromBottomToTop = isElementBottomAligned(element) && isDecisionTopAligned(decision);

    if (changedFromTopToBottom || changedFromBottomToTop) {
      Css.set(element, 'position', 'absolute');

      const getValue = (key: 'top' | 'left' | 'bottom' | 'right') => {
        return cssOptions[key].map(() => Css.get(element, key));
      };

      const intermediateCssOptions = {
        position: cssOptions.position,
        top: getValue('top'),
        right: getValue('right'),
        bottom: getValue('bottom'),
        left: getValue('left'),
      };

      Css.setOptions(element, intermediateCssOptions);
      Class.add(element, transition);
      Css.reflow(element);
    }
  });

  Css.setOptions(element, cssOptions);
};

export {
  NuPositionCss,
  applyPositionCss
};
