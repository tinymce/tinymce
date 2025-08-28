import { FieldSchema } from '@ephox/boulder';
import { Fun } from '@ephox/katamari';

import * as SketchBehaviours from '../../api/component/SketchBehaviours';
import { Tabbar } from '../../api/ui/Tabbar';
import { Tabview } from '../../api/ui/Tabview';
import * as Fields from '../../data/Fields';
import * as PartType from '../../parts/PartType';
import { TabbarSpec } from '../types/TabbarTypes';
import { TabSectionDetail } from '../types/TabSectionTypes';
import { TabviewSpec } from '../types/TabviewTypes';

const schema = Fun.constant([
  FieldSchema.defaulted('selectFirst', true),
  Fields.onHandler('onChangeTab'),
  Fields.onHandler('onDismissTab'),
  FieldSchema.defaulted('tabs', [ ]),
  SketchBehaviours.field('tabSectionBehaviours', [ ])
]);

const barPart = PartType.required<TabSectionDetail, TabbarSpec>({
  factory: Tabbar,
  schema: [
    FieldSchema.required('dom'),
    FieldSchema.requiredObjOf('markers', [
      FieldSchema.required('tabClass'),
      FieldSchema.required('selectedClass')
    ])
  ],
  name: 'tabbar',
  defaults: (detail: TabSectionDetail) => {
    return {
      tabs: detail.tabs
    };
  }
});

const viewPart = PartType.required<TabSectionDetail, TabviewSpec>({
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
