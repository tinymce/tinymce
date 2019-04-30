import { FieldProcessorAdt, FieldSchema } from '@ephox/boulder';
import { Cell, Fun, Option } from '@ephox/katamari';
import * as Behaviour from '../../api/behaviour/Behaviour';
import { Focusing } from '../../api/behaviour/Focusing';
import { Keying } from '../../api/behaviour/Keying';
import { Sliding } from '../../api/behaviour/Sliding';
import { Toggling } from '../../api/behaviour/Toggling';
import * as SketchBehaviours from '../../api/component/SketchBehaviours';
import { Toolbar } from '../../api/ui/Toolbar';
import * as Fields from '../../data/Fields';
import * as PartType from '../../parts/PartType';
import { SplitToolbarDetail } from '../types/SplitToolbarTypes';
import * as AlloyParts from '../../parts/AlloyParts';

const schema: () => FieldProcessorAdt[] = Fun.constant([
  Fields.markers([ 'closedClass', 'openClass', 'shrinkingClass', 'growingClass', 'overflowToggledClass' ]),
  SketchBehaviours.field('splitToolbarBehaviours', [ ]),
  FieldSchema.state('builtGroups', () => {
    return Cell([ ]);
  }),
  FieldSchema.defaulted('floatingAnchor', (toolbar) => Option.none()),
  FieldSchema.defaultedBoolean('floating', false),
  FieldSchema.strict('lazySink')
]);

const toolbarSchema = [
  FieldSchema.strict('dom'),
  FieldSchema.defaulted('floatingAnchor', (toolbar) => Option.none()),
  FieldSchema.defaultedBoolean('floating', false)
];

const parts: () => PartType.PartTypeAdt[] = Fun.constant([
  PartType.required({
    factory: Toolbar,
    schema: toolbarSchema,
    name: 'primary'
  }),

  PartType.external({
    factory: Toolbar,
    schema: toolbarSchema,
    name: 'overflow',
    overrides (detail: SplitToolbarDetail) {
      if (detail.floating === true) {
        return {
          toolbarBehaviours: Behaviour.derive([
            Keying.config({
              mode: 'cyclic',
              onEscape: (comp) => {
                AlloyParts.getPart(comp, detail, 'overflow-button').each(Focusing.focus);
                // Don't return true here, as we need to allow the sandbox to handle the escape to close the overflow
                return Option.none();
              }
            })
          ])
        };
      } else {
        return {
          toolbarBehaviours: Behaviour.derive([
            Sliding.config({
              dimension: {
                property: 'height'
              },
              closedClass: detail.markers.closedClass,
              openClass: detail.markers.openClass,
              shrinkingClass: detail.markers.shrinkingClass,
              growingClass: detail.markers.growingClass,
              onShrunk: (comp) => {
                AlloyParts.getPart(comp, detail, 'overflow-button').each((button) => {
                  Toggling.off(button);
                  Focusing.focus(button);
                });
              },
              onGrown: (comp) => {
                Keying.focusIn(comp);
              },
              onStartGrow: (comp) => {
                AlloyParts.getPart(comp, detail, 'overflow-button').each(Toggling.on);
              }
            }),
            Keying.config({
              mode: 'acyclic',
              onEscape: (comp) => {
                AlloyParts.getPart(comp, detail, 'overflow-button').each(Focusing.focus);
                return Option.some(true);
              }
            })
          ])
        };
      }
    }
  }),

  PartType.external({
    name: 'overflow-button',
    overrides: (toolbarDetail) => {
      return {
        dom: {
          attributes: toolbarDetail.floating ? { 'aria-haspopup': 'true' } : { }
        },
        buttonBehaviours: Behaviour.derive([
          Toggling.config({
            toggleClass: toolbarDetail.markers.overflowToggledClass,
            aria: {
              mode: toolbarDetail.floating ? 'expanded' : 'pressed'
            },
            toggleOnExecute: false
          }),
        ])
      };
    }
  }),

  PartType.external({
    name: 'overflow-group'
  })
]);

const name = Fun.constant('SplitToolbar');

export {
  name,
  schema,
  parts
};