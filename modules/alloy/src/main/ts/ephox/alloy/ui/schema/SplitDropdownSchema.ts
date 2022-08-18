import { FieldSchema } from '@ephox/boulder';
import { Fun, Optional } from '@ephox/katamari';

import * as Behaviour from '../../api/behaviour/Behaviour';
import { Coupling } from '../../api/behaviour/Coupling';
import { Focusing } from '../../api/behaviour/Focusing';
import { Keying } from '../../api/behaviour/Keying';
import { Toggling } from '../../api/behaviour/Toggling';
import { AlloyComponent } from '../../api/component/ComponentApi';
import * as SketchBehaviours from '../../api/component/SketchBehaviours';
import * as AlloyTriggers from '../../api/events/AlloyTriggers';
import { Button } from '../../api/ui/Button';
import * as Fields from '../../data/Fields';
import * as SketcherFields from '../../data/SketcherFields';
import * as InternalSink from '../../parts/InternalSink';
import * as PartType from '../../parts/PartType';
import * as AnchorLayouts from '../../positioning/mode/AnchorLayouts';
import { ButtonSpec } from '../types/ButtonTypes';
import { SplitDropdownDetail } from '../types/SplitDropdownTypes';
import { TieredMenuSpec } from '../types/TieredMenuTypes';

const schema = Fun.constant([
  FieldSchema.required('toggleClass'),
  FieldSchema.required('fetch'),
  Fields.onStrictHandler('onExecute'),
  FieldSchema.defaulted('getHotspot', Optional.some),
  FieldSchema.defaulted('getAnchorOverrides', Fun.constant({ })),
  AnchorLayouts.schema(),
  Fields.onStrictHandler('onItemExecute'),
  FieldSchema.option('lazySink'),
  FieldSchema.required('dom'),
  Fields.onHandler('onOpen'),
  SketchBehaviours.field('splitDropdownBehaviours', [ Coupling, Keying, Focusing ]),
  FieldSchema.defaulted('matchWidth', false),
  FieldSchema.defaulted('useMinWidth', false),
  FieldSchema.defaulted('eventOrder', {}),
  FieldSchema.option('role')
].concat(
  SketcherFields.sandboxFields()
));

const arrowPart = PartType.required<SplitDropdownDetail, ButtonSpec>({
  factory: Button,
  schema: [ FieldSchema.required('dom') ],
  name: 'arrow',
  defaults: () => {
    return {
      buttonBehaviours: Behaviour.derive([
        // TODO: Remove all traces of revoking
        Focusing.revoke()
      ])
    };
  },
  overrides: (detail) => {
    return {
      dom: {
        tag: 'span',
        attributes: {
          role: 'presentation'
        }
      },
      action: (arrow: AlloyComponent) => {
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

const buttonPart = PartType.required<SplitDropdownDetail, ButtonSpec>({
  factory: Button,
  schema: [ FieldSchema.required('dom') ],
  name: 'button',
  defaults: () => {
    return {
      buttonBehaviours: Behaviour.derive([
        // TODO: Remove all traces of revoking
        Focusing.revoke()
      ])
    };
  },
  overrides: (detail) => {
    return {
      dom: {
        tag: 'span',
        attributes: {
          role: 'presentation'
        }
      },
      action: (btn: AlloyComponent) => {
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
      sketch: (spec) => {
        return {
          uid: spec.uid,
          dom: {
            tag: 'span',
            styles: {
              display: 'none'
            },
            attributes: {
              'aria-hidden': 'true'
            },
            innerHtml: spec.text
          }
        };
      }
    },
    schema: [ FieldSchema.required('text') ],
    name: 'aria-descriptor'
  }),

  PartType.external<SplitDropdownDetail, TieredMenuSpec>({
    schema: [
      Fields.tieredMenuMarkers()
    ],
    name: 'menu',
    defaults: (detail) => {
      return {
        onExecute: (tmenu: AlloyComponent, item: AlloyComponent) => {
          // CAUTION: This won't work if the splitDropdown and the tmenu aren't
          // in the same mothership. It is just a default, though.
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
