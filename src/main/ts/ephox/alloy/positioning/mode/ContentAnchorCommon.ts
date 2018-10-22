import { nu as NuAnchor } from './Anchoring';
import { Option, Fun } from '@ephox/katamari';
import * as Boxes from '../../alien/Boxes';
import * as Bubble from '../layout/Bubble';
import * as CssPosition from '../../alien/CssPosition';
import * as Layout from '../layout/Layout';
import * as Origins from '../layout/Origins';
import * as AnchorLayouts from './AnchorLayouts';

const calcNewAnchor = (optBox, rootPoint, anchorInfo, origin, elem) => {
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

    const layoutsLtr = (): Layout.AnchorLayout[] => {
      return anchorInfo.showAbove() ?
        [Layout.northeast, Layout.northwest, Layout.southeast, Layout.southwest, Layout.north, Layout.south] :
        [Layout.southeast, Layout.southwest, Layout.northeast, Layout.northwest, Layout.south, Layout.south];
    };

    const layoutsRtl = (): Layout.AnchorLayout[] => {
      return anchorInfo.showAbove() ?
        [Layout.northwest, Layout.northeast, Layout.southwest, Layout.southeast, Layout.north, Layout.south] :
        [Layout.southwest, Layout.southeast, Layout.northwest, Layout.northeast, Layout.south, Layout.north];
    };

    const layouts = AnchorLayouts.get(elem, anchorInfo, layoutsLtr(), layoutsRtl());

    return NuAnchor({
      anchorBox: Fun.constant(anchorBox),
      bubble: Fun.constant(anchorInfo.bubble().getOr(Bubble.fallback())),
      overrides: anchorInfo.overrides,
      layouts: Fun.constant(layouts),
      placer: Option.none
    });
  });
};

export default {
  calcNewAnchor
};