import { FieldSchema } from '@ephox/boulder';
import { Fun, Option } from '@ephox/katamari';
import { Position } from '@ephox/sugar';

import * as Boxes from '../../alien/Boxes';
import * as CssPosition from '../../alien/CssPosition';
import * as Fields from '../../data/Fields';
import * as Bubble from '../layout/Bubble';
import * as Layout from '../layout/Layout';
import * as Origins from '../layout/Origins';
import { NodeAnchor, nu as NuAnchor, Anchoring } from './Anchoring';
import * as ContainerOffsets from './ContainerOffsets';
import { AlloyComponent } from '../../api/component/ComponentApi';
import * as AnchorLayouts from './AnchorLayouts';

const placement = (component: AlloyComponent, anchorInfo: NodeAnchor, origin: Origins.OriginAdt): Option<Anchoring> => {
  const rootPoint = ContainerOffsets.getRootPoint(component, origin, anchorInfo);

  return anchorInfo.node().bind((target) => {
    const rect = target.dom().getBoundingClientRect();
    const point = CssPosition.screen(Position(rect.left, rect.top));
    const nodeBox = Option.some(Boxes.pointed(point, rect.width, rect.height));
    return nodeBox.map((box) => {
    const points = [ rootPoint, box.point() ];
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
        [ Layout.northeast, Layout.northwest, Layout.southeast, Layout.southwest, Layout.north, Layout.south ] :
        [ Layout.southeast, Layout.southwest, Layout.northeast, Layout.northwest, Layout.south, Layout.south ];
    };

    const layoutsRtl = (): Layout.AnchorLayout[] => {
      return anchorInfo.showAbove() ?
        [ Layout.northwest, Layout.northeast, Layout.southwest, Layout.southeast, Layout.north, Layout.south ] :
        [ Layout.southwest, Layout.southeast, Layout.northwest, Layout.northeast, Layout.south, Layout.north ];
    };

    const elem = anchorInfo.node().getOr(component.element());

    const layouts = AnchorLayouts.get(elem, anchorInfo, layoutsLtr(), layoutsRtl());

    return NuAnchor({
      anchorBox: Fun.constant(anchorBox),
      bubble: Fun.constant(anchorInfo.bubble().getOr(Bubble.fallback())),
      overrides: anchorInfo.overrides,
      layouts: Fun.constant(layouts),
      placer: Option.none
    });
  });
});
};

export default [
  FieldSchema.strict('node'),
  FieldSchema.strict('root'),
  FieldSchema.option('bubble'),
  AnchorLayouts.schema(),
  // chiefly MaxHeight.expandable()
  FieldSchema.defaulted('overrides', { }),
  FieldSchema.defaulted('showAbove', false),
  Fields.output('placement', placement)
];