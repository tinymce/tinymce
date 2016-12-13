define(
  'ephox.alloy.api.ui.ExpandableForm',

  [
    'ephox.alloy.api.behaviour.Composing',
    'ephox.alloy.api.behaviour.Representing',
    'ephox.alloy.api.behaviour.Sliding',
    'ephox.alloy.api.ui.Button',
    'ephox.alloy.api.ui.CompositeBuilder',
    'ephox.alloy.api.ui.Form',
    'ephox.alloy.data.Fields',
    'ephox.alloy.parts.PartType',
    'ephox.boulder.api.FieldSchema',
    'ephox.compass.Obj',
    'ephox.peanut.Fun',
    'ephox.perhaps.Option',
    'ephox.sugar.api.Class'
  ],

  function (Composing, Representing, Sliding, Button, CompositeBuilder, Form, Fields, PartType, FieldSchema, Obj, Fun, Option, Class) {
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

    var doToggleForm = function (anyComp, detail) {
      
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
          action: function (anyComp) {
            var extraOpt = anyComp.getSystem().getByUid(detail.partUids()['extra']);
            extraOpt.each(Sliding.toggleGrow);
          }
        };
      }),
      PartType.internal({ build: Fun.identity }, 'controls', '<alloy.expandable-form.controls>', Fun.constant({}), Fun.constant({}))
    ];

    // Dupe with Tiered Menu
    var build = function (spec) {
      return CompositeBuilder.build('expandable-form', schema, partTypes, make, spec);
    };

    var make = function (detail, components, spec, _externals) {
      return {
        uid: detail.uid(),
        uiType: 'custom',
        dom: detail.dom(),
        components: components,

        // FIX: Dupe with form
        behaviours: {
          representing: {
            store: {
              mode: 'manual',
              getValue: function (form) {
                var partUids = detail.partUids();
                return Obj.map(partUids, function (pUid, pName) {
                  return form.getSystem().getByUid(pUid).fold(Option.none, Option.some).bind(Composing.getCurrent).map(Representing.getValue);
                });
              },
              setValue: function (form, values) {
                Obj.each(values, function (newValue, key) {
                  // TODO: Make this cleaner. Maybe make the whole thing need to be specified.
                  var part = form.getSystem().getByUid(detail.partUids()[key]).getOrDie();
                  Composing.getCurrent(part).each(function (current) {
                    Representing.setValue(current, newValue);
                  });
                });
              }
            }
          }
        }
      };

    };

    var parts = PartType.generate('expandable-form', partTypes);

    return {
      build: build,
      parts: Fun.constant(parts)
    };
  }
);