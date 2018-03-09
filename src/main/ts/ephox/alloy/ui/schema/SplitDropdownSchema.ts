import { FieldSchema } from '@ephox/boulder';
import { Fun } from '@ephox/katamari';

import * as Behaviour from '../../api/behaviour/Behaviour';
import { Coupling } from '../../api/behaviour/Coupling';
import { Focusing } from '../../api/behaviour/Focusing';
import { Keying } from '../../api/behaviour/Keying';
import { Toggling } from '../../api/behaviour/Toggling';
import SketchBehaviours from '../../api/component/SketchBehaviours';
import * as AlloyTriggers from '../../api/events/AlloyTriggers';
import Button from '../../api/ui/Button';
import * as Fields from '../../data/Fields';
import * as InternalSink from '../../parts/InternalSink';
import PartType from '../../parts/PartType';

const schema = Fun.constant([
  FieldSchema.strict('toggleClass'),
  FieldSchema.strict('fetch'),

  Fields.onStrictHandler('onExecute'),
  Fields.onStrictHandler('onItemExecute'),
  FieldSchema.option('lazySink'),
  FieldSchema.strict('dom'),
  Fields.onHandler('onOpen'),
  SketchBehaviours.field('splitDropdownBehaviours', [ Coupling, Keying, Focusing ]),
  FieldSchema.defaulted('matchWidth', false)
]);

const arrowPart = PartType.required({
  factory: Button,
  schema: [ FieldSchema.strict('dom') ],
  name: 'arrow',
  defaults (detail) {
    return {
      dom: {
        attributes: {
          role: 'button'
        }
      },
      buttonBehaviours: Behaviour.derive([
        // TODO: Remove all traces of revoking
        Focusing.revoke()
      ])
    };
  },
  overrides (detail) {
    return {
      action (arrow) {
        arrow.getSystem().getByUid(detail.uid()).each(AlloyTriggers.emitExecute);
      },
      buttonBehaviours: Behaviour.derive([
        Toggling.config({
          toggleOnExecute: false,
          toggleClass: detail.toggleClass(),
          aria: {
            mode: 'pressed'
          }
        })
      ])
    };
  }
});

const buttonPart = PartType.required({
  factory: Button,
  schema: [ FieldSchema.strict('dom') ],
  name: 'button',
  defaults (detail) {
    return {
      dom: {
        attributes: {
          role: 'button'
        }
      },
      buttonBehaviours: Behaviour.derive([
        // TODO: Remove all traces of revoking
        Focusing.revoke()
      ])
    };
  },
  overrides (detail) {
    return {
      action (btn) {
        btn.getSystem().getByUid(detail.uid()).each(function (splitDropdown) {
          detail.onExecute()(splitDropdown, btn);
        });
      }
    };
  }
});

const parts = Fun.constant([
  arrowPart,
  buttonPart,

  PartType.external({
    schema: [
      Fields.tieredMenuMarkers()
    ],
    name: 'menu',
    defaults (detail) {
      return {
        onExecute (tmenu, item) {
          tmenu.getSystem().getByUid(detail.uid()).each(function (splitDropdown) {
            detail.onItemExecute()(splitDropdown, tmenu, item);
          });
        }
      };
    }
  }),

  InternalSink.partType()
]);

const name = Fun.constant('SplitDropdown');
export {
  name,
  schema,
  parts
};