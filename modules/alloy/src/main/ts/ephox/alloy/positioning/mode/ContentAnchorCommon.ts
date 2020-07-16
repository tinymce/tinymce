import { Option } from '@ephox/katamari';
import { SugarElement, SugarPosition } from '@ephox/sugar';

import * as Boxes from '../../alien/Boxes';
import * as CssPosition from '../../alien/CssPosition';
import * as Bubble from '../layout/Bubble';
import * as Layout from '../layout/Layout';
import * as Origins from '../layout/Origins';
import { NodeAnchor, nu as NuAnchor, SelectionAnchor } from './Anchoring';
import * as AnchorLayouts from './AnchorLayouts';

const capRect = (left: number, top: number, width: number, height: number): Option<Boxes.BoxByPoint> => {
  let newLeft = left, newTop = top, newWidth = width, newHeight = height;
  // Try to prevent the context toolbar from getting above the editor toolbar
  if (left < 0) {
    newLeft = 0;
    newWidth = width + left;
  }
  if (top < 0) {
    newTop = 0;
    newHeight = height + top;
  }
  const point = CssPosition.screen(SugarPosition(newLeft, newTop));
  return Option.some(Boxes.pointed(point, newWidth, newHeight));
};

const calcNewAnchor = (optBox: Option<Boxes.BoxByPoint>, rootPoint: CssPosition.CssPositionAdt, anchorInfo: SelectionAnchor | NodeAnchor, origin: Origins.OriginAdt, elem: SugarElement) => optBox.map((box) => {
  const points = [ rootPoint, box.point ];
  const topLeft = Origins.cata(origin,
    () => CssPosition.sumAsAbsolute(points),
    () => CssPosition.sumAsAbsolute(points),
    () => CssPosition.sumAsFixed(points)
  );

  const anchorBox = Boxes.rect(
    topLeft.left(),
    topLeft.top(),
    box.width,
    box.height
  );

  const layoutsLtr = anchorInfo.showAbove ?
    Layout.aboveOrBelow() :
    Layout.belowOrAbove();

  const layoutsRtl = anchorInfo.showAbove ?
    Layout.belowOrAboveRtl() :
    Layout.belowOrAboveRtl();

  const layouts = AnchorLayouts.get(
    elem,
    anchorInfo,
    layoutsLtr,
    layoutsRtl,
    layoutsLtr,
    layoutsRtl,
    Option.none()
  );

  return NuAnchor({
    anchorBox,
    bubble: anchorInfo.bubble.getOr(Bubble.fallback()),
    overrides: anchorInfo.overrides,
    layouts,
    placer: Option.none()
  });
});

export {
  capRect,
  calcNewAnchor
};
