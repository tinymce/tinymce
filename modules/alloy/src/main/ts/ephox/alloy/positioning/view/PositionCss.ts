import { Option, Struct } from '@ephox/katamari';
import { Element, Css } from '@ephox/sugar';

export interface PositionCss {
  position: () => string;
  left: () => Option<number>;
  top: () => Option<number>;
  right: () => Option<number>;
  bottom: () => Option<number>;
}

const NuPositionCss: (
  position: string,
  left: Option<number>,
  top: Option<number>,
  right: Option<number>,
  bottom: Option<number>
) => PositionCss = Struct.immutable('position', 'left', 'top', 'right', 'bottom');

const applyPositionCss = (element: Element, position: PositionCss) => {
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
