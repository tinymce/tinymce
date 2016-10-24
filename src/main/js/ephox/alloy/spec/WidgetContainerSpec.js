define(
  'ephox.alloy.spec.WidgetContainerSpec',

  [
    'ephox.alloy.spec.SpecSchema',
    'ephox.alloy.spec.UiSubstitutes',
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.ValueSchema',
    'ephox.peanut.Fun'
  ],

  function (SpecSchema, UiSubstitutes, FieldSchema, ValueSchema, Fun) {
    var schema = ValueSchema.objOf([
      FieldSchema.strict('widget')
    ]);
    
    var make = function (spec) {
      var detail = SpecSchema.asStructOrDie('flatgrid.spec', schema, spec);
      
      var placeholders = {
        '<alloy.widget>': detail.widget()
      };

      var components = UiSubstitutes.substitutePlaces(detail, detail.components(), placeholders);

      return {
        uiType: 'custom',
        dom: detail.dom(),
        uid: detail.uid(),
        highlighting: {
          // Highlighting for a menu is selecting items inside the menu
          highlightClass: detail.markers().selectedItem(),
          itemClass: detail.markers().item()
        },
        components: components
      };
    };

    return {
      schema: Fun.constant(schema),
      make: make
    };
  }
);