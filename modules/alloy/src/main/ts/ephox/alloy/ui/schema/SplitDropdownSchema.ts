import { FieldProcessorAdt, FieldSchema } from '@ephox/boulder';
import { Fun, Option } from '@ephox/katamari';

import * as Behaviour from '../../api/behaviour/Behaviour';
import { Coupling } from '../../api/behaviour/Coupling';
import { Focusing } from '../../api/behaviour/Focusing';
import { Keying } from '../../api/behaviour/Keying';
import { Toggling } from '../../api/behaviour/Toggling';
import * as SketchBehaviours from '../../api/component/SketchBehaviours';
import * as AlloyTriggers from '../../api/events/AlloyTriggers';
import { Button } from '../../api/ui/Button';
import * as Fields from '../../data/Fields';
import * as SketcherFields from '../../data/SketcherFields';
import * as InternalSink from '../../parts/InternalSink';
import * as PartType from '../../parts/PartType';

const schema: () => FieldProcessorAdt[] = Fun.constant([
  FieldSchema.strict('toggleClass'),
  FieldSchema.strict('fetch'),
  Fields.onStrictHandler('onExecute'),
  FieldSchema.defaulted('getHotspot', Option.some),
  FieldSchema.defaulted('getAnchorOverrides', Fun.constant({ })),
  FieldSchema.defaulted('layouts', Option.none()),
  Fields.onStrictHandler('onItemExecute'),
  FieldSchema.option('lazySink'),
  FieldSchema.strict('dom'),
  Fields.onHandler('onOpen'),
  SketchBehaviours.field('splitDropdownBehaviours', [ Coupling, Keying, Focusing ]),
  FieldSchema.defaulted('matchWidth', false),
  FieldSchema.defaulted('useMinWidth', false),
  FieldSchema.defaulted('eventOrder', {}),
  FieldSchema.option('role')
].concat(
  SketcherFields.sandboxFields()
));

const arrowPart = PartType.required({
  factory: Button,
  schema: [ FieldSchema.strict('dom') ],
  name: 'arrow',
  defaults (detail) {
    return {
      buttonBehaviours: Behaviour.derive([
        // TODO: Remove all traces of revoking
        Focusing.revoke()
      ])
    };
  },
  overrides (detail) {
    return {
      dom: {
        tag: 'span',
        attributes: {
          role: 'presentation'
        }
      },
      action (arrow) {
        arrow.getSystem().getByUid(detail.uid).each(AlloyTriggers.emitExecute);
      },
      buttonBehaviours: Behaviour.derive([
        Toggling.config({
          toggleOnExecute: false,
          toggleClass: detail.toggleClass
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
      buttonBehaviours: Behaviour.derive([
        // TODO: Remove all traces of revoking
        Focusing.revoke()
      ])
    };
  },
  overrides (detail) {
    return {
      dom: {
        tag: 'span',
        attributes: {
          role: 'presentation'
        }
      },
      action (btn) {
        btn.getSystem().getByUid(detail.uid).each((splitDropdown) => {
          detail.onExecute(splitDropdown, btn);
        });
      }
    };
  }
});

const parts: () => PartType.PartTypeAdt[] = Fun.constant([
  arrowPart,
  buttonPart,

  PartType.optional({
    factory: {
      sketch (spec) {
        return {
          uid: spec.uid,
          dom: {
            tag: 'span',
            styles: {
              display: 'none',
            },
            attributes: {
              'aria-hidden': 'true'
            },
            innerHtml: spec.text
          }
        };
      }
    },
    schema: [ FieldSchema.strict('text') ],
    name: 'aria-descriptor'
  }),

  PartType.external({
    schema: [
      Fields.tieredMenuMarkers()
    ],
    name: 'menu',
    defaults (detail) {
      return {
        onExecute (tmenu, item) {
          tmenu.getSystem().getByUid(detail.uid).each((splitDropdown) => {
            detail.onItemExecute(splitDropdown, tmenu, item);
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