define(
  'ephox.alloy.form.FormScaffoldSpec',

  [
    'ephox.alloy.form.RadioGroupSpec',
    'ephox.alloy.form.TextInputSpec',
    'ephox.alloy.registry.Tagger',
    'ephox.alloy.spec.SpecSchema',
    'ephox.alloy.spec.UiSubstitutes',
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.ValueSchema',
    'ephox.perhaps.Option'
  ],

  function (RadioGroupSpec, TextInputSpec, Tagger, SpecSchema, UiSubstitutes, FieldSchema, ValueSchema, Option) {
    var schema = [
      FieldSchema.option('uid'),
      FieldSchema.strict('components'),
      FieldSchema.strict('dom'),
      FieldSchema.defaulted('inline', true),
      // FieldSchema.strict('label'),
      FieldSchema.state('builder', function () {
        return builder;
      })
    ].concat(
      SpecSchema.getPartsSchema([
        'field'
      ])
    );

    // Dupe with FormSpec
    var uiSchema = ValueSchema.choose(
      'type',
      {
        'text-input': TextInputSpec,
        'radio-group': RadioGroupSpec
      }
    );

    var builder = function (info) {
      var placeholders = {
        '<alloy.form.element>': UiSubstitutes.single(
          (function () {
            console.log('field', info.parts().field());
            var itemInfo = ValueSchema.asStructOrDie('ui.spec item', uiSchema, info.parts().field());
            var output = itemInfo.builder()(itemInfo);
            return output;
          })()
        )
      };

      var components = UiSubstitutes.substitutePlaces(
        Option.some('form-scaffold'),
        info,
        info.components(),
        placeholders,
        { }
      );

      return {
        uiType: 'custom',
        uid: info.uid().getOr(Tagger.generate('')),
        dom: info.dom(),
        components: components
      };
    };

    return schema;
  }
);