import { Fun, Option } from '@ephox/katamari';
import { Css, SugarElement } from '@ephox/sugar';

export interface PositionCss {
  readonly position: () => string;
  readonly left: () => Option<number>;
  readonly top: () => Option<number>;
  readonly right: () => Option<number>;
  readonly bottom: () => Option<number>;
}

const NuPositionCss = (
  position: string,
  left: Option<number>,
  top: Option<number>,
  right: Option<number>,
  bottom: Option<number>
): PositionCss => ({
  position: Fun.constant(position),
  left: Fun.constant(left),
  top: Fun.constant(top),
  right: Fun.constant(right),
  bottom: Fun.constant(bottom)
});

const applyPositionCss = (element: SugarElement, position: PositionCss) => {
  const addPx = (num: number) => num + 'px';

  Css.setOptions(element, {
    position: Option.some(position.position()),
    left: position.left().map(addPx),
    top: position.top().map(addPx),
    right: position.right().map(addPx),
    bottom: position.bottom().map(addPx)
  });
};

export {
  NuPositionCss,
  applyPositionCss
};
