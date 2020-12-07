import { FieldProcessorAdt, FieldSchema } from '@ephox/boulder';
import { Fun, Optional } from '@ephox/katamari';

import { Coupling } from '../../api/behaviour/Coupling';
import { Focusing } from '../../api/behaviour/Focusing';
import { Keying } from '../../api/behaviour/Keying';
import { Toggling } from '../../api/behaviour/Toggling';
import * as SketchBehaviours from '../../api/component/SketchBehaviours';
import * as Fields from '../../data/Fields';
import * as SketcherFields from '../../data/SketcherFields';
import * as InternalSink from '../../parts/InternalSink';
import * as PartType from '../../parts/PartType';
import * as AnchorLayouts from '../../positioning/mode/AnchorLayouts';
import { DropdownDetail, DropdownSpec } from '../types/DropdownTypes';

const schema: () => FieldProcessorAdt[] = Fun.constant([
  FieldSchema.strict('dom'),
  FieldSchema.strict('fetch'),
  Fields.onHandler('onOpen'),
  Fields.onKeyboardHandler('onExecute'),
  FieldSchema.defaulted('getHotspot', Optional.some),
  FieldSchema.defaulted('getAnchorOverrides', Fun.constant({ })),
  AnchorLayouts.schema(),
  SketchBehaviours.field('dropdownBehaviours', [ Toggling, Coupling, Keying, Focusing ]),
  FieldSchema.strict('toggleClass'),
  FieldSchema.defaulted('eventOrder', { }),
  FieldSchema.option('lazySink'),
  FieldSchema.defaulted('matchWidth', false),
  FieldSchema.defaulted('useMinWidth', false),
  FieldSchema.option('role')
].concat(
  SketcherFields.sandboxFields()
));

const parts: () => PartType.PartTypeAdt[] = Fun.constant([
  PartType.external<DropdownDetail, DropdownSpec>({
    schema: [
      Fields.tieredMenuMarkers()
    ],
    name: 'menu',
    defaults(detail) {
      return {
        onExecute: detail.onExecute
      };
    }
  }),

  InternalSink.partType()
]);

const name = Fun.constant('Dropdown');

export {
  name,
  schema,
  parts
};
