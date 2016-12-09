define(
  'ephox.alloy.api.ui.HtmlSelect',

  [
    'ephox.alloy.registry.Tagger',
    'ephox.alloy.spec.SpecSchema',
    'ephox.highway.Merger'
  ],

  function (Tagger, SpecSchema, Merger) {
    var schema = [
     
    ];

    // Dupe with Tiered Menu
    var build = function (rawSpec) {
      var spec = Merger.deepMerge({ uid: Tagger.generate('') }, rawSpec);
      var detail = SpecSchema.asStructOrDie('html-select', schema, spec, [ ]);
      return make(detail, spec);
    };

    var make = function (detail, spec) {
      return Merger.deepMerge(
        spec,
        {
          dom: {
            tag: 'select'
          }
        }
      );
      // var options = Arr.map(info.options(), function (option) {
      //   return Merger.deepMerge(
      //     info.members().option().munge(option),
      //     {
      //       uiType: 'custom',
      //       dom: {
      //         tag: 'option'
      //       }
      //     }
      //   );
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