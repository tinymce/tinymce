import Fields from '../../data/Fields';
import Bubble from '../layout/Bubble';
import Layout from '../layout/Layout';
import Origins from '../layout/Origins';
import Anchoring from './Anchoring';
import AnchorLayouts from './AnchorLayouts';
import { FieldSchema } from '@ephox/boulder';
import { Fun } from '@ephox/katamari';
import { Option } from '@ephox/katamari';

var placement = function (component, posInfo, anchorInfo, origin) {
  var hotspot = anchorInfo.hotspot();
  var anchorBox = Origins.toBox(origin, hotspot.element());

  var layouts = AnchorLayouts.get(component, anchorInfo, Layout.all(), Layout.allRtl());

  return Option.some(
    Anchoring({
      anchorBox: Fun.constant(anchorBox),
      bubble: Fun.constant(Bubble(0, 0)),
      // maxHeightFunction: Fun.constant(MaxHeight.available()),
      overrides: Fun.constant({ }),
      layouts: Fun.constant(layouts),
      placer: Option.none
    })
  );
};

export default <any> [
  FieldSchema.strict('hotspot'),
  AnchorLayouts.schema(),
  Fields.output('placement', placement)
];