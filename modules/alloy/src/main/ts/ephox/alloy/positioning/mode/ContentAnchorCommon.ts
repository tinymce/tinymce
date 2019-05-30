import { nu as NuAnchor, SelectionAnchor, NodeAnchor } from './Anchoring';
import { Option, Fun } from '@ephox/katamari';
import * as Boxes from '../../alien/Boxes';
import * as Bubble from '../layout/Bubble';
import * as CssPosition from '../../alien/CssPosition';
import * as Layout from '../layout/Layout';
import * as LayoutTypes from '../layout/LayoutTypes';
import * as Origins from '../layout/Origins';
import * as AnchorLayouts from './AnchorLayouts';
import { Element, Position } from '@ephox/sugar';

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
  const point = CssPosition.screen(Position(newLeft, newTop));
  return Option.some(Boxes.pointed(point, newWidth, newHeight));
};

const calcNewAnchor = (optBox: Option<Boxes.BoxByPoint>, rootPoint: CssPosition.CssPositionAdt, anchorInfo: SelectionAnchor | NodeAnchor, origin: Origins.OriginAdt, elem: Element) => {
  return optBox.map((box) => {
    const points = [rootPoint, box.point()];
    const topLeft = Origins.cata(origin,
      () => {
        return CssPosition.sumAsAbsolute(points);
      },
      () => {
        return CssPosition.sumAsAbsolute(points);
      },
      () => {
        return CssPosition.sumAsFixed(points);
      }
    );

    const anchorBox = Boxes.rect(
      topLeft.left(),
      topLeft.top(),
      box.width(),
      box.height()
    );

    const layoutsLtr = (): LayoutTypes.AnchorLayout[] => {
      return anchorInfo.showAbove ?
        [Layout.northeast, Layout.northwest, Layout.southeast, Layout.southwest, Layout.north, Layout.south] :
        [Layout.southeast, Layout.southwest, Layout.northeast, Layout.northwest, Layout.south, Layout.south];
    };

    const layoutsRtl = (): LayoutTypes.AnchorLayout[] => {
      return anchorInfo.showAbove ?
        [Layout.northwest, Layout.northeast, Layout.southwest, Layout.southeast, Layout.north, Layout.south] :
        [Layout.southwest, Layout.southeast, Layout.northwest, Layout.northeast, Layout.south, Layout.north];
    };

    const layouts = AnchorLayouts.get(elem, anchorInfo, layoutsLtr(), layoutsRtl());

    return NuAnchor({
      anchorBox,
      bubble: anchorInfo.bubble.getOr(Bubble.fallback()),
      overrides: anchorInfo.overrides,
      layouts,
      placer: Option.none()
    });
  });
};

export default {
  capRect,
  calcNewAnchor
};