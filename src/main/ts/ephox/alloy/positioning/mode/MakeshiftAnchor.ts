import { FieldSchema } from '@ephox/boulder';
import { Fun, Option } from '@ephox/katamari';
import { Direction } from '@ephox/sugar';

import * as Fields from '../../data/Fields';
import Bounds from '../layout/Bounds';
import Bubble from '../layout/Bubble';
import * as Layout from '../layout/Layout';
import Anchoring from './Anchoring';

const placement = (component, posInfo, anchorInfo, origin) => {
  const anchorBox = Bounds(anchorInfo.x(), anchorInfo.y(), anchorInfo.width(), anchorInfo.height());

  const layouts = anchorInfo.layouts().getOrThunk(() => {
    return Direction.onDirection(Layout.all(), Layout.allRtl())(component.element());
  });

  return Option.some(
    Anchoring({
      anchorBox: Fun.constant(anchorBox),
      bubble: anchorInfo.bubble,
      // maxHeightFunction: Fun.constant(MaxHeight.available()),
      overrides: Fun.constant({ }),
      layouts: Fun.constant(layouts),
      placer: Option.none
    })
  );
};

export default <any> [
  FieldSchema.strict('x'),
  FieldSchema.strict('y'),
  FieldSchema.defaulted('height', 0),
  FieldSchema.defaulted('width', 0),
  FieldSchema.defaulted('bubble', Bubble(0, 0)),
  FieldSchema.option('layouts'),
  Fields.output('placement', placement)
];