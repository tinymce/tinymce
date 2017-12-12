import Coupling from '../../api/behaviour/Coupling';
import Focusing from '../../api/behaviour/Focusing';
import Keying from '../../api/behaviour/Keying';
import Toggling from '../../api/behaviour/Toggling';
import SketchBehaviours from '../../api/component/SketchBehaviours';
import Fields from '../../data/Fields';
import InternalSink from '../../parts/InternalSink';
import PartType from '../../parts/PartType';
import { FieldSchema } from '@ephox/boulder';
import { Fun } from '@ephox/katamari';

var schema = [
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
];

var partTypes = [
  PartType.external({
    schema: [
      Fields.tieredMenuMarkers()
    ],
    name: 'menu',
    defaults: function (detail) {
      return {
        onExecute: detail.onExecute()
      };
    }
  }),

  InternalSink.partType()
];

export default <any> {
  name: Fun.constant('Dropdown'),
  schema: Fun.constant(schema),
  parts: Fun.constant(partTypes)
};