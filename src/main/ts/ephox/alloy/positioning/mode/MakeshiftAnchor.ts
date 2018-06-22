import { FieldSchema, FieldProcessorAdt } from '@ephox/boulder';
import { Fun, Option } from '@ephox/katamari';
import { Direction } from '@ephox/sugar';

import * as Fields from '../../data/Fields';
import { nu as Bubble } from '../layout/Bubble';
import * as Layout from '../layout/Layout';
import { nu as NuAnchoring, MakeshiftAnchor } from './Anchoring';
import { AlloyBehaviour } from '../../api/behaviour/Behaviour';
import { PositioningConfig } from '../../behaviour/positioning/PositioningTypes';
import { OriginAdt } from '../../positioning/layout/Origins';
import { bounds } from '../../alien/Boxes';
import { AlloyComponent } from '../../api/component/ComponentApi';

const placement = (component: AlloyComponent, posInfo: PositioningConfig, anchorInfo: MakeshiftAnchor, origin: OriginAdt) => {
  const anchorBox = bounds(anchorInfo.x(), anchorInfo.y(), anchorInfo.width(), anchorInfo.height());

  const layouts = anchorInfo.layouts().fold(() => {
    return Direction.onDirection(Layout.all(), Layout.allRtl())(component.element());
  }, (layoutChooser) => {
    const dirChooser = Direction.onDirection(layoutChooser.onLtr(), layoutChooser.onRtl());
    const getLayouts = dirChooser(component.element());
    return getLayouts(component.element());
  });

  return Option.some(
    NuAnchoring({
      anchorBox: Fun.constant(anchorBox),
      bubble: anchorInfo.bubble,
      // maxHeightFunction: Fun.constant(MaxHeight.available()),
      overrides: Fun.constant({ }),
      layouts: Fun.constant(layouts),
      placer: Option.none
    })
  );
};

export default [
  FieldSchema.strict('x'),
  FieldSchema.strict('y'),
  FieldSchema.defaulted('height', 0),
  FieldSchema.defaulted('width', 0),
  FieldSchema.defaulted('bubble', Bubble(0, 0)),
  FieldSchema.option('layouts'),
  Fields.output('placement', placement)
];