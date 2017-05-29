define(
  'ephox.alloy.ui.schema.ExpandableFormSchema',

  [
    'ephox.alloy.api.behaviour.Behaviour',
    'ephox.alloy.api.behaviour.Keying',
    'ephox.alloy.api.behaviour.Sliding',
    'ephox.alloy.api.ui.Button',
    'ephox.alloy.api.ui.Form',
    'ephox.alloy.data.Fields',
    'ephox.alloy.parts.AlloyParts',
    'ephox.alloy.parts.PartType',
    'ephox.boulder.api.FieldSchema',
    'ephox.katamari.api.Fun',
    'ephox.sugar.api.dom.Focus',
    'ephox.sugar.api.properties.Class'
  ],

  function (Behaviour, Keying, Sliding, Button, Form, Fields, AlloyParts, PartType, FieldSchema, Fun, Focus, Class) {
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
      FieldSchema.defaulted('expandableBehaviours', { })
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

    return {
      name: Fun.constant('ExpandableForm'),
      schema: Fun.constant(schema),
      parts: Fun.constant(partTypes)
    };
  }
);