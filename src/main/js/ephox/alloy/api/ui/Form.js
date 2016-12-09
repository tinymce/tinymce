define(
  'ephox.alloy.api.ui.Form',

  [
    'ephox.alloy.data.Fields',
    'ephox.alloy.form.FormUis',
    'ephox.alloy.registry.Tagger',
    'ephox.alloy.spec.SpecSchema',
    'ephox.alloy.spec.UiSubstitutes',
    'ephox.alloy.ui.crazy.FormSpec',
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.ValueSchema',
    'ephox.compass.Obj',
    'ephox.highway.Merger',
    'ephox.peanut.Fun',
    'ephox.perhaps.Option'
  ],

  function (Fields, FormUis, Tagger, SpecSchema, UiSubstitutes, FormSpec, FieldSchema, ValueSchema, Obj, Merger, Fun, Option) {
    var schema = [
      Fields.members([ 'ui' ])
    ];

    // Dupe with Tiered Menu
    var build = function (rawSpec) {





      var spec = Merger.deepMerge({ uid: Tagger.generate('') }, rawSpec);
      var detail = SpecSchema.asStructOrDie('form', schema, spec, Obj.keys(rawSpec.parts));

      var placeholders = Obj.tupleMap(spec.parts !== undefined ? spec.parts : {}, function (partSpec, partName) {
        var partUid = detail.partUids()[partName];
        var fullSpec = detail.members().ui().munge(
          Merger.deepMerge(
            partSpec,
            {
              uid: partUid
            }
          )
        );

        var itemInfo = ValueSchema.asStructOrDie('ui.spec item', FormUis.schema(), fullSpec);
        var output = itemInfo.builder()(itemInfo, detail.members().ui().munge);
        return {
          k: '<alloy.field.' + partName + '>',
          v: UiSubstitutes.single(true,  
            output
          )
        };
      });

      var components = UiSubstitutes.substitutePlaces(
        Option.some('form'),
        detail,
        detail.components(),
        placeholders
      );

      console.log('components');

      var x = FormSpec.make(detail, components, spec);

      console.log('x', x);
      return x;
    };

    return {
      build: build,
      // Used?
      partial: Fun.identity
    };
  }
);