define(
  'ephox.alloy.toolbar.SlickToolbar',

  [
    'ephox.alloy.toolbar.ToolbarSpecs',
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.ValueSchema',
    'ephox.compass.Arr',
    'ephox.highway.Merger'
  ],

  function (ToolbarSpecs, FieldSchema, ValueSchema, Arr, Merger) {
    var schema = ValueSchema.objOf([
      FieldSchema.strict('groups')
    ]);

    var make = function (spec) {
      var detail = ValueSchema.asStructOrDie('toolbar.spec', schema, spec);

      // var toolbars = Arr.map(detail.toolbars(), function (tb) {
      //   return {
      //     uiType: 'toolbar',
      //     dom: {
      //       classes: [ 'slick-toolbar' ]
      //     },
      //     // Needed to override toolbar's keying.
      //     keying: undefined,
      //     groups: tb.groups
      //   };
      // });

     // Maybe default some arguments here
      return Merger.deepMerge(spec, {
        dom: {
          tag: 'div',
          styles: {
            // display: 'flex'
          }
        },
        keying: {
          mode: 'cyclic'
        },
        components: [{
          uiType: 'toolbar',
          dom: {
            classes: [ 'toolbar-base' ]
          },
          groups: detail.groups(),
          keying: undefined
        }].concat([ ]),
        replacing: {
          // transition: true
        }
      }, spec, {
        uiType: 'custom'
      });
    };

    return {
      make: make
    };
  }
);