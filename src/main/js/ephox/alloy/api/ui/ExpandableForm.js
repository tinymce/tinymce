define(
  'ephox.alloy.api.ui.ExpandableForm',

  [
    'ephox.alloy.api.behaviour.Composing',
    'ephox.alloy.api.behaviour.Representing',
    'ephox.alloy.api.behaviour.Sliding',
    'ephox.alloy.api.ui.Button',
    'ephox.alloy.api.ui.CompositeBuilder',
    'ephox.alloy.api.ui.Form',
    'ephox.alloy.parts.PartType',
    'ephox.alloy.registry.Tagger',
    'ephox.alloy.spec.SpecSchema',
    'ephox.alloy.spec.UiSubstitutes',
    'ephox.compass.Obj',
    'ephox.highway.Merger',
    'ephox.peanut.Fun',
    'ephox.perhaps.Option'
  ],

  function (Composing, Representing, Sliding, Button, CompositeBuilder, Form, PartType, Tagger, SpecSchema, UiSubstitutes, Obj, Merger, Fun, Option) {
    // FIX: Some dupe with Form

    var schema = [
      
    ];

    var partTypes = [
      PartType.internal(Form, 'minimal', '<alloy.expandable-form.expander>', Fun.constant({ }), Fun.constant({ }))
    ];

    // Dupe with Tiered Menu
    var build = function (spec) {
      return CompositeBuilder.build('expandable-form', schema, partTypes, make, spec);
    };

    var make = function (detail, components, spec, _externals) {
      return {
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