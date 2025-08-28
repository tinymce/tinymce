import { Optional } from '@ephox/katamari';
import { Css, SugarElement } from '@ephox/sugar';

export interface PositionCss {
  readonly position: string;
  readonly left: Optional<string>;
  readonly top: Optional<string>;
  readonly right: Optional<string>;
  readonly bottom: Optional<string>;
}

const NuPositionCss = (
  position: string,
  left: Optional<number>,
  top: Optional<number>,
  right: Optional<number>,
  bottom: Optional<number>
): PositionCss => {
  const toPx = (num: number) => num + 'px';
  return {
    position,
    left: left.map(toPx),
    top: top.map(toPx),
    right: right.map(toPx),
    bottom: bottom.map(toPx)
  };
};

const toOptions = (position: PositionCss): Record<string, Optional<string>> => ({
  ...position,
  position: Optional.some(position.position)
});

const applyPositionCss = (element: SugarElement<HTMLElement>, position: PositionCss): void => {
  Css.setOptions(element, toOptions(position));
};

export {
  NuPositionCss,
  applyPositionCss
};
