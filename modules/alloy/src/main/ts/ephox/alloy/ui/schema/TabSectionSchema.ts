import { FieldProcessorAdt, FieldSchema } from '@ephox/boulder';
import { Fun } from '@ephox/katamari';

import * as SketchBehaviours from '../../api/component/SketchBehaviours';
import { Tabbar } from '../../api/ui/Tabbar';
import { Tabview } from '../../api/ui/Tabview';
import * as Fields from '../../data/Fields';
import * as PartType from '../../parts/PartType';
import { TabSectionDetail } from '../../ui/types/TabSectionTypes';

const schema: () => FieldProcessorAdt[] = Fun.constant([
  FieldSchema.defaulted('selectFirst', true),
  Fields.onHandler('onChangeTab'),
  Fields.onHandler('onDismissTab'),
  FieldSchema.defaulted('tabs', [ ]),
  SketchBehaviours.field('tabSectionBehaviours', [ ])
]);

const barPart = PartType.required({
  factory: Tabbar,
  schema: [
    FieldSchema.strict('dom'),
    FieldSchema.strictObjOf('markers', [
      FieldSchema.strict('tabClass'),
      FieldSchema.strict('selectedClass')
    ])
  ],
  name: 'tabbar',
  defaults (detail: TabSectionDetail) {
    return {
      tabs: detail.tabs
    };
  }
});

const viewPart = PartType.required({
  factory: Tabview,
  name: 'tabview'
});

const parts: () => PartType.PartTypeAdt[] = Fun.constant([
  barPart,
  viewPart
]);
const name = Fun.constant('TabSection');

export {
  name,
  schema,
  parts
};