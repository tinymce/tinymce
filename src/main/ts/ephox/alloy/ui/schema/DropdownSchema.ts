import { FieldSchema } from '@ephox/boulder';
import { Fun } from '@ephox/katamari';

import { Coupling } from '../../api/behaviour/Coupling';
import Focusing from '../../api/behaviour/Focusing';
import Keying from '../../api/behaviour/Keying';
import Toggling from '../../api/behaviour/Toggling';
import SketchBehaviours from '../../api/component/SketchBehaviours';
import * as Fields from '../../data/Fields';
import * as InternalSink from '../../parts/InternalSink';
import PartType from '../../parts/PartType';

const schema = Fun.constant([
  FieldSchema.strict('dom'),
  FieldSchema.strict('fetch'),
  Fields.onHandler('onOpen'),
  Fields.onKeyboardHandler('onExecute'),
  SketchBehaviours.field('dropdownBehaviours', [ Toggling, Coupling, Keying, Focusing ]),
  FieldSchema.strict('toggleClass'),
  FieldSchema.defaulted('displayer', Fun.identity),
  FieldSchema.option('lazySink'),
  FieldSchema.defaulted('matchWidth', false),
  FieldSchema.option('role')
]);

const parts = Fun.constant([
  PartType.external({
    schema: [
      Fields.tieredMenuMarkers()
    ],
    name: 'menu',
    defaults (detail) {
      return {
        onExecute: detail.onExecute()
      };
    }
  }),

  InternalSink.partType()
]);

const name = Fun.constant('Dropdown');
export default <any> {
  name,
  schema,
  parts
};