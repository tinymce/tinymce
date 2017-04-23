define(
  'ephox.alloy.ui.schema.ExpandableFormSchema',

  [
    'ephox.alloy.api.behaviour.Behaviour',
    'ephox.alloy.api.behaviour.Keying',
    'ephox.alloy.api.behaviour.Sliding',
    'ephox.alloy.api.ui.Button',
    'ephox.alloy.api.ui.Form',
    'ephox.alloy.data.Fields',
    'ephox.alloy.parts.PartType',
    'ephox.boulder.api.FieldSchema',
    'ephox.katamari.api.Fun',
    'ephox.sugar.api.dom.Focus',
    'ephox.sugar.api.properties.Class'
  ],

  function (Behaviour, Keying, Sliding, Button, Form, Fields, PartType, FieldSchema, Fun, Focus, Class) {
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
        var extraOpt = anyComp.getSystem().getByUid(detail.partUids()['extra']);
        extraOpt.each(operation);
      };
    };

    var partTypes = [
      PartType.internal(Form, [
        FieldSchema.strict('dom')
      ], 'minimal', '<alloy.expandable-form.minimal>', Fun.constant({ }), Fun.constant({ })),
      PartType.internal(Form, [
        FieldSchema.strict('dom')
      ], 'extra', '<alloy.expandable-form.extra>', Fun.constant({ }), function (detail) {
        return {
          formBehaviours: Behaviour.derive([
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
      }),
      PartType.internal(Button, [
        FieldSchema.strict('dom')
      ], 'expander', '<alloy.expandable-form.expander>', Fun.constant({}), function (detail) {
        return {
          action: runOnExtra(detail, Sliding.toggleGrow)
        };
      }),
      PartType.internal({ sketch: Fun.identity }, [
        FieldSchema.strict('dom')
      ], 'controls', '<alloy.expandable-form.controls>', Fun.constant({}), Fun.constant({}))
    ];

    return {
      name: Fun.constant('ExpandableForm'),
      schema: Fun.constant(schema),
      parts: Fun.constant(partTypes)
    };
  }
);