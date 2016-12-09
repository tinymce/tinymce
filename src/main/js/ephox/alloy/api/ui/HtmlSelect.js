define(
  'ephox.alloy.api.ui.HtmlSelect',

  [
    'ephox.alloy.data.Fields',
    'ephox.alloy.registry.Tagger',
    'ephox.alloy.spec.SpecSchema',
    'ephox.boulder.api.FieldSchema',
    'ephox.compass.Arr',
    'ephox.highway.Merger',
    'ephox.sugar.api.TextContent',
    'ephox.sugar.api.Value'
  ],

  function (Fields, Tagger, SpecSchema, FieldSchema, Arr, Merger, TextContent, Value) {
    var schema = [
      FieldSchema.strict('options'),
      Fields.members([ 'option' ]),
      FieldSchema.option('data')
    ];

    // Dupe with Tiered Menu
    var build = function (rawSpec) {
      var spec = Merger.deepMerge({ uid: Tagger.generate('') }, rawSpec);
      var detail = SpecSchema.asStructOrDie('html-select', schema, spec, [ ]);
      return make(detail, spec);
    };

    var make = function (detail, spec) {
      var options = Arr.map(detail.options(), function (option) {
        return Merger.deepMerge(
          detail.members().option().munge(option),
          {
            uiType: 'custom',
            dom: {
              tag: 'option',
              value: option.value,
              innerHtml: option.text
            }
          }
        );
      });


      return Merger.deepMerge(
        spec,
        {
          dom: {
            tag: 'select'
          },
          components: options,
          behaviours: {
            representing: {
              store: {
                mode: 'memory',
                // TODO: Check this
                initialValue: detail.data().getOr(detail.options()[0]),
                interactive: {
                  event: 'input',
                  process: function (input) {
                    return {
                      value: Value.get(input.element()),
                      text: TextContent.get(input.element())
                    };
                  }
                },

                onSet: function (input, data) {
                  Value.set(input.element(), data.value);
                }
              }
            }
          }
        }
      );
     
      // });


      // return {
      //   uid: detail.uid(),
      //   uiType: 'custom',
      //   dom: {
      //     tag: detail.tag(),
      //     attributes: {
      //       type: detail.type()
      //     }
      //   },
      //   // No children.
      //   components: [ ],
      //   behaviours: {
      //     representing: {
      //       store: {
      //         mode: 'memory',
      //         initialValue: detail.data().getOr({ value: '', text: '' })
      //       },

      //       interactive: {
      //         event: 'input',
      //         process: function (input) {
      //           var v = Value.get(input.element());
      //           return {
      //             value: v.toLowerCase(),
      //             text: v
      //           };
      //         }
      //       },

      //       onSet: function (input, data) {
      //         Value.set(input.element(), data.value);
      //       }
      //     }
      //   }
      // };
    };

    return {
      build: build
    };


    // parts: {
    //       field: Merger.deepMerge(
    //         info.parts().field(),
    //         {
    //           uiType: 'custom',
    //           dom: {
    //             tag: 'select'
    //           },
    //           representing: { 
    //             query: function (input) {
    //               return Value.get(input.element());
    //             },
    //             set: function (input, value) {
    //               Value.set(input.element(), value);
    //             }
    //           },
    //           components: options
    //         }
    //       ),
    //       label: { }
    //     },
    //     dom: info.dom(),
    // return null;
  }
);