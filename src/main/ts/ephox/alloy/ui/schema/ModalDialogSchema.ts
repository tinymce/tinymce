import Behaviour from '../../api/behaviour/Behaviour';
import Dragging from '../../api/behaviour/Dragging';
import Keying from '../../api/behaviour/Keying';
import SketchBehaviours from '../../api/component/SketchBehaviours';
import Fields from '../../data/Fields';
import PartType from '../../parts/PartType';
import { FieldSchema } from '@ephox/boulder';
import { Fun } from '@ephox/katamari';
import { JSON as Json } from '@ephox/sand';
import { SelectorFind } from '@ephox/sugar';

var schema = [
  FieldSchema.strict('lazySink'),
  FieldSchema.option('dragBlockClass'),
  FieldSchema.defaulted('useTabstopAt', Fun.constant(true)),

  SketchBehaviours.field('modalBehaviours', [ Keying ]),

  Fields.onKeyboardHandler('onExecute'),
  Fields.onStrictKeyboardHandler('onEscape')
];

var basic = { sketch: Fun.identity };

var partTypes = [
  PartType.optional({
    name: 'draghandle',
    overrides: function (detail, spec) {
      return {
        behaviours: Behaviour.derive([
          Dragging.config({
            mode: 'mouse',
            getTarget: function (handle) {
              return SelectorFind.ancestor(handle, '[role="dialog"]').getOr(handle);
            },
            blockerClass: detail.dragBlockClass().getOrDie(
              new Error(
                'The drag blocker class was not specified for a dialog with a drag handle: \n' +
                Json.stringify(spec, null, 2)
              )
            )
          })
        ])
      };
    }
  }),

  PartType.required({
    schema:  [ FieldSchema.strict('dom') ],
    name: 'title'
  }),

  PartType.required({
    factory: basic,
    schema:  [ FieldSchema.strict('dom') ],
    name: 'close'
  }),

  PartType.required({
    factory: basic,
    schema:  [ FieldSchema.strict('dom') ],
    name: 'body'
  }),

  PartType.required({
    factory: basic,
    schema:  [ FieldSchema.strict('dom') ],
    name: 'footer'
  }),

  PartType.external({
    factory: basic,
    name: 'blocker',
    defaults: Fun.constant({
      dom: {
        tag: 'div',
        styles: {
          position: 'fixed',
          left: '0px',
          top: '0px',
          right: '0px',
          bottom: '0px'
        }
      }
    })
  })
];

export default <any> {
  name: Fun.constant('ModalDialog'),
  schema: Fun.constant(schema),
  parts: Fun.constant(partTypes)
};