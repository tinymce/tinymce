import { FieldSchema } from '@ephox/boulder';
import { Fun } from '@ephox/katamari';

import { AlloyComponent } from '../../api/component/ComponentApi';
import * as Fields from '../../data/Fields';
import * as Layout from '../../positioning/layout/Layout';

export default [
  FieldSchema.strict('lazySink'),
  FieldSchema.strict('tooltipDom'),
  FieldSchema.defaulted('exclusive', true),
  FieldSchema.defaulted('tooltipComponents', []),
  FieldSchema.defaulted('delay', 300),
  FieldSchema.defaultedStringEnum('mode', 'normal', [ 'normal', 'follow-highlight' ]),
  FieldSchema.defaulted('anchor', (comp: AlloyComponent) => ({
    anchor: 'hotspot',
    hotspot: comp,
    layouts: {
      onLtr: Fun.constant([ Layout.south, Layout.north, Layout.southeast, Layout.northeast, Layout.southwest, Layout.northwest ]),
      onRtl: Fun.constant([ Layout.south, Layout.north, Layout.southeast, Layout.northeast, Layout.southwest, Layout.northwest ])
    }
  })),
  Fields.onHandler('onHide'),
  Fields.onHandler('onShow')
];
