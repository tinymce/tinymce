define(
  'ephox.alloy.spec.WidgetContainerSpec',

  [
    'ephox.alloy.spec.SpecSchema',
    'ephox.alloy.spec.UiSubstitutes',
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.ValueSchema',
    'ephox.peanut.Fun',
    'ephox.perhaps.Option'
  ],

  function (SpecSchema, UiSubstitutes, FieldSchema, ValueSchema, Fun, Option) {
    var schema = [
      FieldSchema.strict('widget'),
      FieldSchema.strict('dom')
    ];
    
    var make = function (spec) {
      var detail = SpecSchema.asStructOrDie('widget-container.spec', schema, spec, [ ]);
      
      var placeholders = {
        '<alloy.widget>': UiSubstitutes.single(detail.widget())
      };

      var components = UiSubstitutes.substitutePlaces(Option.some('widget-container'), detail, detail.components(), placeholders);

      return {
        uiType: 'custom',
        dom: detail.dom(),
        uid: detail.uid(),
        components: components,
        keying: {
          mode: 'flow',
          selector: '[tabindex="-1"]'
        }
      };
    };

    return {
      make: make
    };
  }
);