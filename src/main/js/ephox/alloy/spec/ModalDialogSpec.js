define(
  'ephox.alloy.spec.ModalDialogSpec',

  [
    'ephox.alloy.spec.SpecSchema',
    'ephox.alloy.spec.UiSubstitutes',
    'ephox.boulder.api.FieldSchema',
    'ephox.highway.Merger',
    'ephox.perhaps.Option'
  ],

  function (SpecSchema, UiSubstitutes, FieldSchema, Merger, Option) {
    var schema = [
      FieldSchema.strict('dom')
    ];

    var make = function (spec) {
      var detail = SpecSchema.asStructOrDie('modal-dialog', schema, spec, [
        'title',
        'close'
      ]);

      var placeholders = {
        '<alloy.dialog.title>': UiSubstitutes.single(
          Merger.deepMerge(
            detail.parts().title(),
            detail.parts().title().base,
            {
              uid: detail.partUids().title
            }
          )
        ),
        '<alloy.dialog.close>': UiSubstitutes.single(
          Merger.deepMerge(
            detail.parts().close(),
            detail.parts().close().base,
            {
              uid: detail.partUids().close
            }
          )
        )
      };

      var components = UiSubstitutes.substitutePlaces(
        Option.some('modal-dialog'),
        detail,
        detail.components(),
        placeholders,
        { }
      );

      return Merger.deepMerge(
        spec,
        {
          uiType: 'custom',
          dom: detail.dom(),
          components: components,
          keying: {
            mode: 'cyclic'
          }
        }
      );
    };

    return {
      make: make
    };
  }
);