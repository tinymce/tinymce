import Behaviour from '../../api/behaviour/Behaviour';
import Coupling from '../../api/behaviour/Coupling';
import Focusing from '../../api/behaviour/Focusing';
import Keying from '../../api/behaviour/Keying';
import Toggling from '../../api/behaviour/Toggling';
import SketchBehaviours from '../../api/component/SketchBehaviours';
import AlloyTriggers from '../../api/events/AlloyTriggers';
import Button from '../../api/ui/Button';
import Fields from '../../data/Fields';
import InternalSink from '../../parts/InternalSink';
import PartType from '../../parts/PartType';
import { FieldSchema } from '@ephox/boulder';
import { Fun } from '@ephox/katamari';

var schema = [
  FieldSchema.strict('toggleClass'),
  FieldSchema.strict('fetch'),

  Fields.onStrictHandler('onExecute'),
  Fields.onStrictHandler('onItemExecute'),
  FieldSchema.option('lazySink'),
  FieldSchema.strict('dom'),
  Fields.onHandler('onOpen'),
  SketchBehaviours.field('splitDropdownBehaviours', [ Coupling, Keying, Focusing ]),
  FieldSchema.defaulted('matchWidth', false)
];

var arrowPart = PartType.required({
  factory: Button,
  schema: [ FieldSchema.strict('dom') ],
  name: 'arrow',
  defaults: function (detail) {
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
  overrides: function (detail) {
    return {
      action: function (arrow) {
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

var buttonPart = PartType.required({
  factory: Button,
  schema: [ FieldSchema.strict('dom') ],
  name: 'button',
  defaults: function (detail) {
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
  overrides: function (detail) {
    return {
      action: function (btn) {
        btn.getSystem().getByUid(detail.uid()).each(function (splitDropdown) {
          detail.onExecute()(splitDropdown, btn);
        });
      }
    };
  }
});

var partTypes = [
  arrowPart,
  buttonPart,

  PartType.external({
    schema: [
      Fields.tieredMenuMarkers()
    ],
    name: 'menu',
    defaults: function (detail) {
      return {
        onExecute: function (tmenu, item) {
          tmenu.getSystem().getByUid(detail.uid()).each(function (splitDropdown) {
            detail.onItemExecute()(splitDropdown, tmenu, item);
          });
        }
      };
    }
  }),

  InternalSink.partType()
];

export default <any> {
  name: Fun.constant('SplitDropdown'),
  schema: Fun.constant(schema),
  parts: Fun.constant(partTypes)
};