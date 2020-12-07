import { FieldProcessorAdt, FieldSchema } from '@ephox/boulder';
import { Fun } from '@ephox/katamari';
import { Class, Focus } from '@ephox/sugar';

import * as Behaviour from '../../api/behaviour/Behaviour';
import { Keying } from '../../api/behaviour/Keying';
import { Representing } from '../../api/behaviour/Representing';
import { Sliding } from '../../api/behaviour/Sliding';
import { AlloyComponent } from '../../api/component/ComponentApi';
import * as SketchBehaviours from '../../api/component/SketchBehaviours';
import { Button } from '../../api/ui/Button';
import * as Fields from '../../data/Fields';
import * as AlloyParts from '../../parts/AlloyParts';
import * as PartType from '../../parts/PartType';
import { ButtonSpec } from '../types/ButtonTypes';
import { ExpandableFormDetail } from '../types/ExpandableFormTypes';

const schema: () => FieldProcessorAdt[] = Fun.constant([
  Fields.markers([
    'closedClass',
    'openClass',
    'shrinkingClass',
    'growingClass',

    // TODO: Sync with initial value
    'expandedClass',
    'collapsedClass'
  ]),

  Fields.onHandler('onShrunk'),
  Fields.onHandler('onGrown'),
  SketchBehaviours.field('expandableBehaviours', [ Representing ])
]);

const runOnExtra = (detail: ExpandableFormDetail, operation: (comp: AlloyComponent) => void): (comp: AlloyComponent) => void => (anyComp) => {
  AlloyParts.getPart(anyComp, detail, 'extra').each(operation);
};

const parts: () => PartType.PartTypeAdt[] = Fun.constant([
  PartType.required<ExpandableFormDetail>({
    // factory: Form,
    schema: [ FieldSchema.strict('dom') ],
    name: 'minimal'
  }),

  PartType.required<ExpandableFormDetail>({
    // factory: Form,
    schema: [ FieldSchema.strict('dom') ],
    name: 'extra',
    overrides(detail) {
      return {
        behaviours: Behaviour.derive([
          Sliding.config({
            dimension: {
              property: 'height'
            },
            closedClass: detail.markers.closedClass,
            openClass: detail.markers.openClass,
            shrinkingClass: detail.markers.shrinkingClass,
            growingClass: detail.markers.growingClass,
            expanded: true,
            onStartShrink(extra: AlloyComponent) {
              // If the focus is inside the extra part, move the focus to the expander button
              Focus.search(extra.element).each((_) => {
                const comp = extra.getSystem().getByUid(detail.uid).getOrDie();
                Keying.focusIn(comp);
              });

              extra.getSystem().getByUid(detail.uid).each((form) => {
                Class.remove(form.element, detail.markers.expandedClass);
                Class.add(form.element, detail.markers.collapsedClass);
              });
            },
            onStartGrow(extra: AlloyComponent) {
              extra.getSystem().getByUid(detail.uid).each((form) => {
                Class.add(form.element, detail.markers.expandedClass);
                Class.remove(form.element, detail.markers.collapsedClass);
              });
            },
            onShrunk(extra: AlloyComponent) {
              detail.onShrunk(extra);
            },
            onGrown(extra: AlloyComponent) {
              detail.onGrown(extra);
            },
            getAnimationRoot(extra: AlloyComponent) {
              return extra.getSystem().getByUid(detail.uid).getOrDie().element;
            }
          })
        ])
      };
    }
  }),

  PartType.required<ExpandableFormDetail, ButtonSpec>({
    factory: Button,
    schema: [ FieldSchema.strict('dom') ],
    name: 'expander',
    overrides(detail) {
      return {
        action: runOnExtra(detail, Sliding.toggleGrow)
      };
    }
  }),

  PartType.required({
    schema: [ FieldSchema.strict('dom') ],
    name: 'controls'
  })
]);

const name = Fun.constant('ExpandableForm');

export {
  name,
  schema,
  parts
};
