import Behaviour from '../../api/behaviour/Behaviour';
import Keying from '../../api/behaviour/Keying';
import Representing from '../../api/behaviour/Representing';
import Sliding from '../../api/behaviour/Sliding';
import SketchBehaviours from '../../api/component/SketchBehaviours';
import Button from '../../api/ui/Button';
import Form from '../../api/ui/Form';
import Fields from '../../data/Fields';
import AlloyParts from '../../parts/AlloyParts';
import PartType from '../../parts/PartType';
import { FieldSchema } from '@ephox/boulder';
import { Fun } from '@ephox/katamari';
import { Focus } from '@ephox/sugar';
import { Class } from '@ephox/sugar';

var schema = [
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
];

// TODO: Remove dupe with ExpandableForm
var runOnExtra = function (detail, operation) {
  return function (anyComp) {
    AlloyParts.getPart(anyComp, detail, 'extra').each(operation);
  };
};

var partTypes = [
  PartType.required({
    // factory: Form,
    schema: [ FieldSchema.strict('dom') ],
    name: 'minimal'
  }),

  PartType.required({
    // factory: Form,
    schema: [ FieldSchema.strict('dom') ],
    name: 'extra',
    overrides: function (detail) {
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
            onStartShrink: function (extra) {
              // If the focus is inside the extra part, move the focus to the expander button
              Focus.search(extra.element()).each(function (_) {
                var comp = extra.getSystem().getByUid(detail.uid()).getOrDie();
                Keying.focusIn(comp);
              });

              extra.getSystem().getByUid(detail.uid()).each(function (form) {
                Class.remove(form.element(), detail.markers().expandedClass());
                Class.add(form.element(), detail.markers().collapsedClass());
              });
            },
            onStartGrow: function (extra) {
              extra.getSystem().getByUid(detail.uid()).each(function (form) {
                Class.add(form.element(), detail.markers().expandedClass());
                Class.remove(form.element(), detail.markers().collapsedClass());
              });
            },
            onShrunk: function (extra) {
              detail.onShrunk()(extra);
            },
            onGrown: function (extra) {
              detail.onGrown()(extra);
            },
            getAnimationRoot: function (extra) {
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
    overrides: function (detail) {
      return {
        action: runOnExtra(detail, Sliding.toggleGrow)
      };
    }
  }),

  PartType.required({
    schema: [ FieldSchema.strict('dom') ],
    name: 'controls'
  })
];

export default <any> {
  name: Fun.constant('ExpandableForm'),
  schema: Fun.constant(schema),
  parts: Fun.constant(partTypes)
};