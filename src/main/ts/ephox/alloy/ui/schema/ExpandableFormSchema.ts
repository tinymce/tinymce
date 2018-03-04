import { FieldSchema } from '@ephox/boulder';
import { Fun } from '@ephox/katamari';
import { Class, Focus } from '@ephox/sugar';

import * as Behaviour from '../../api/behaviour/Behaviour';
import { Keying } from '../../api/behaviour/Keying';
import Representing from '../../api/behaviour/Representing';
import Sliding from '../../api/behaviour/Sliding';
import SketchBehaviours from '../../api/component/SketchBehaviours';
import Button from '../../api/ui/Button';
import * as Fields from '../../data/Fields';
import * as AlloyParts from '../../parts/AlloyParts';
import PartType from '../../parts/PartType';

const schema = Fun.constant([
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

// TODO: Remove dupe with ExpandableForm
const runOnExtra = function (detail, operation) {
  return function (anyComp) {
    AlloyParts.getPart(anyComp, detail, 'extra').each(operation);
  };
};

const parts = Fun.constant([
  PartType.required({
    // factory: Form,
    schema: [ FieldSchema.strict('dom') ],
    name: 'minimal'
  }),

  PartType.required({
    // factory: Form,
    schema: [ FieldSchema.strict('dom') ],
    name: 'extra',
    overrides (detail) {
      return {
        behaviours: Behaviour.derive([
          Sliding.config({
            dimension: {
              property: 'height'
            },
            closedClass: detail.markers().closedClass(),
            openClass: detail.markers().openClass(),
            shrinkingClass: detail.markers().shrinkingClass(),
            growingClass: detail.markers().growingClass(),
            expanded: true,
            onStartShrink (extra) {
              // If the focus is inside the extra part, move the focus to the expander button
              Focus.search(extra.element()).each(function (_) {
                const comp = extra.getSystem().getByUid(detail.uid()).getOrDie();
                Keying.focusIn(comp);
              });

              extra.getSystem().getByUid(detail.uid()).each(function (form) {
                Class.remove(form.element(), detail.markers().expandedClass());
                Class.add(form.element(), detail.markers().collapsedClass());
              });
            },
            onStartGrow (extra) {
              extra.getSystem().getByUid(detail.uid()).each(function (form) {
                Class.add(form.element(), detail.markers().expandedClass());
                Class.remove(form.element(), detail.markers().collapsedClass());
              });
            },
            onShrunk (extra) {
              detail.onShrunk()(extra);
            },
            onGrown (extra) {
              detail.onGrown()(extra);
            },
            getAnimationRoot (extra) {
              return extra.getSystem().getByUid(detail.uid()).getOrDie().element();
            }
          })
        ])
      };
    }
  }),

  PartType.required({
    factory: Button,
    schema: [ FieldSchema.strict('dom') ],
    name: 'expander',
    overrides (detail) {
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