define(
  'ephox.alloy.ui.schema.ExpandableFormSchema',

  [
    'ephox.alloy.api.behaviour.Keying',
    'ephox.alloy.api.behaviour.Sliding',
    'ephox.alloy.api.ui.Button',
    'ephox.alloy.api.ui.Form',
    'ephox.alloy.data.Fields',
    'ephox.alloy.parts.PartType',
    'ephox.boulder.api.FieldSchema',
    'ephox.peanut.Fun',
    'ephox.sugar.api.Class',
    'ephox.sugar.api.Focus'
  ],

  function (Keying, Sliding, Button, Form, Fields, PartType, FieldSchema, Fun, Class, Focus) {
    var schema = [
      Fields.markers([
        'closedStyle',
        'openStyle',
        'shrinkingStyle',
        'growingStyle',

        // TODO: Sync with initial value
        'expandedClass',
        'collapsedClass'
      ]),
      FieldSchema.defaulted('onShrunk', Fun.identity),
      FieldSchema.defaulted('onGrown', Fun.identity)
    ];

    // TODO: Remove dupe with ExpandableForm
    var runOnExtra = function (detail, operation) {
      return function (anyComp) {
        var extraOpt = anyComp.getSystem().getByUid(detail.partUids()['extra']);
        extraOpt.each(operation);
      };
    };

    var partTypes = [
      PartType.internal(Form, 'minimal', '<alloy.expandable-form.minimal>', Fun.constant({ }), Fun.constant({ })),
      PartType.internal(Form, 'extra', '<alloy.expandable-form.extra>', Fun.constant({ }), function (detail) {
        return {
          behaviours: {
            sliding: {
              dimension: {
                property: 'height'
              },
              closedStyle: detail.markers().closedStyle(),
              openStyle: detail.markers().openStyle(),
              shrinkingStyle: detail.markers().shrinkingStyle(),
              growingStyle: detail.markers().growingStyle(),
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
                console.log('height.slider.shrunk');
              },
              onGrown: function (extra) {
                detail.onGrown()(extra);
                console.log('height.slider.grown');
              },
              getAnimationRoot: function (extra) {
                return extra.getSystem().getByUid(detail.uid()).getOrDie().element();
              }
            }
          }
        };
      }),
      PartType.internal(Button, 'expander', '<alloy.expandable-form.expander>', Fun.constant({}), function (detail) {
        return {
          action: runOnExtra(detail, Sliding.toggleGrow)
        };
      }),
      PartType.internal({ build: Fun.identity }, 'controls', '<alloy.expandable-form.controls>', Fun.constant({}), Fun.constant({}))
    ];

    return {
      name: Fun.constant('ExpandableForm'),
      schema: Fun.constant(schema),
      parts: Fun.constant(partTypes)
    };
  }
);