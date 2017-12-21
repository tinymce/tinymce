import SketchBehaviours from '../../api/component/SketchBehaviours';
import Tabbar from '../../api/ui/Tabbar';
import Tabview from '../../api/ui/Tabview';
import Fields from '../../data/Fields';
import PartType from '../../parts/PartType';
import { FieldSchema } from '@ephox/boulder';
import { Fun } from '@ephox/katamari';

var schema = [
  FieldSchema.defaulted('selectFirst', true),
  Fields.onHandler('onChangeTab'),
  Fields.onHandler('onDismissTab'),
  FieldSchema.defaulted('tabs', [ ]),
  SketchBehaviours.field('tabSectionBehaviours', [ ])
];

var barPart = PartType.required({
  factory: Tabbar,
  schema: [
    FieldSchema.strict('dom'),
    FieldSchema.strictObjOf('markers', [
      FieldSchema.strict('tabClass'),
      FieldSchema.strict('selectedClass')
    ])
  ],
  name: 'tabbar',
  defaults: function (detail) {
    return {
      tabs: detail.tabs()
    };
  }
});

var viewPart = PartType.required({
  factory: Tabview,
  name: 'tabview'
});

var partTypes = [
  barPart,
  viewPart
];

export default <any> {
  name: Fun.constant('TabSection'),
  schema: Fun.constant(schema),
  parts: Fun.constant(partTypes)
};