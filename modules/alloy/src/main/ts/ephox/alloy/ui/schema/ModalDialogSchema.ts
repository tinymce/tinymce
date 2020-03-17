import { FieldProcessorAdt, FieldSchema } from '@ephox/boulder';
import { Fun } from '@ephox/katamari';
import { SelectorFind } from '@ephox/sugar';

import * as Boxes from '../../alien/Boxes';
import * as Behaviour from '../../api/behaviour/Behaviour';
import { Dragging } from '../../api/behaviour/Dragging';
import { Keying } from '../../api/behaviour/Keying';
import * as SketchBehaviours from '../../api/component/SketchBehaviours';
import * as Fields from '../../data/Fields';
import * as PartType from '../../parts/PartType';
import { ModalDialogDetail } from '../types/ModalDialogTypes';

const schema: () => FieldProcessorAdt[] = Fun.constant([
  FieldSchema.strict('lazySink'),
  FieldSchema.option('dragBlockClass'),
  FieldSchema.defaultedFunction('getBounds', Boxes.win),
  FieldSchema.defaulted('useTabstopAt', Fun.constant(true)),
  FieldSchema.defaulted('eventOrder', {}),
  SketchBehaviours.field('modalBehaviours', [ Keying ]),

  Fields.onKeyboardHandler('onExecute'),
  Fields.onStrictKeyboardHandler('onEscape')
]);

const basic = { sketch: Fun.identity };

const parts: () => PartType.PartTypeAdt[] = Fun.constant([
  PartType.optional<ModalDialogDetail>({
    name: 'draghandle',
    overrides(detail: ModalDialogDetail, spec) {
      return {
        behaviours: Behaviour.derive([
          Dragging.config({
            mode: 'mouse',
            getTarget(handle) {
              return SelectorFind.ancestor(handle, '[role="dialog"]').getOr(handle);
            },
            blockerClass: detail.dragBlockClass.getOrDie(
              // TODO: Support errors in Option getOrDie.
              new Error(
                'The drag blocker class was not specified for a dialog with a drag handle: \n' +
                JSON.stringify(spec, null, 2)
              ).message
            ),
            getBounds: detail.getDragBounds
          })
        ])
      };
    }
  }),

  PartType.required<ModalDialogDetail>({
    schema: [ FieldSchema.strict('dom') ],
    name: 'title'
  }),

  PartType.required<ModalDialogDetail>({
    factory: basic,
    schema: [ FieldSchema.strict('dom') ],
    name: 'close'
  }),

  PartType.required<ModalDialogDetail>({
    factory: basic,
    schema:  [ FieldSchema.strict('dom') ],
    name: 'body'
  }),

  PartType.optional<ModalDialogDetail>({
    factory: basic,
    schema:  [ FieldSchema.strict('dom') ],
    name: 'footer'
  }),

  PartType.external<ModalDialogDetail>({
    factory: {
      sketch: (spec, detail) =>
        // Merging should take care of the uid
        ({
          ...spec,
          dom: detail.dom,
          components: detail.components
        })

    },
    schema: [
      FieldSchema.defaulted('dom', {
        tag: 'div',
        styles: {
          position: 'fixed',
          left: '0px',
          top: '0px',
          right: '0px',
          bottom: '0px'
        }
      }),
      FieldSchema.defaulted('components', [ ])
    ],
    name: 'blocker'
  })
]);

const name = Fun.constant('ModalDialog');

export {
  name,
  schema,
  parts
};
