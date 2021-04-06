import { Optional } from '@ephox/katamari';
import { Css, SugarElement } from '@ephox/sugar';

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

const applyPositionCss = (element: SugarElement, position: PositionCss): void => {
  const addPx = (num: number) => num + 'px';

  /*
   * Approach
   *
   * - if our current styles have a 'top', and we are moving to a bottom, then firstly convert
   * our top value to a bottom value. Then, reflow. This should allow the transition to animate from
   * a CSS top to a CSS bottom
   *
   * NOTE: You'll need code for finding the equivalent bottom from a top and vice versa. It isn't as
   * simple as just adding and subtracting element heights. You might need to know the offset parent.
   *
   * TODO: Implement ....
   */

  Css.setOptions(element, {
    position: Optional.some(position.position),
    left: position.left.map(addPx),
    top: position.top.map(addPx),
    right: position.right.map(addPx),
    bottom: position.bottom.map(addPx)
  });
};

export {
  NuPositionCss,
  applyPositionCss
};
