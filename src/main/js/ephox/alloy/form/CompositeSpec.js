define(
  'ephox.alloy.form.CompositeSpec',

  [
    'ephox.alloy.form.RadioGroupSpec',
    'ephox.alloy.form.TextInputSpec',
    'ephox.alloy.spec.SpecSchema',
    'ephox.alloy.spec.UiSubstitutes',
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.ValueSchema',
    'ephox.highway.Merger',
    'ephox.perhaps.Option'
  ],

  function (RadioGroupSpec, TextInputSpec, SpecSchema, UiSubstitutes, FieldSchema, ValueSchema, Merger, Option) {
    var schema = [
      FieldSchema.strict('uid'),
      FieldSchema.strict('components'),
      FieldSchema.strict('dom'),
      FieldSchema.defaulted('inline', false),
      // FieldSchema.strict('label'),
      FieldSchema.state('builder', function () {
        return builder;
      })
    ].concat(
      SpecSchema.getPartsSchema([
        'fields'
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
        '<alloy.form.elements>': UiSubstitutes.multiple(
          (function () {
            var fullSpec = Merger.deepMerge(
              info.parts().fields(),
              {
                uid: info.partUids().fields
              }
            );
            var itemInfo = ValueSchema.asStructOrDie('ui.spec item', uiSchema, fullSpec);
            var output = itemInfo.builder()(itemInfo);
            return output;
          })()
        )
      };

      var byName = { };

      var fields = Arr.map(detail.uis(), function (ui) {
        var uid = Objects.readOptFrom(ui, 'uid').getOrThunk(function () { return Tagger.generate(''); });
        var uiSpec = detail.members().ui().munge(Merger.deepMerge(
          ui,
          {
            uid: uid
          }
        ));
        var itemInfo = ValueSchema.asStructOrDie('ui.spec item', uiSchema, uiSpec);
        var output = itemInfo.builder()(itemInfo);
        byName[uiSpec.name] = output.uid;
        return output;
      });

      var components = UiSubstitutes.substitutePlaces(
        Option.some('composite'),
        info,
        info.components(),
        placeholders,
        { }
      );

      return {
        uiType: 'custom',
        uid: info.uid(),
        dom: info.dom(),
        components: components
      };
    };

    return schema;
  }
);