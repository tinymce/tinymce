define(
  'ephox.alloy.spec.ToolbarSpec',

  [
    'ephox.alloy.spec.SpecSchema',
    'ephox.alloy.spec.UiSubstitutes',
    'ephox.alloy.toolbar.Overflowing',
    'ephox.alloy.toolbar.ToolbarSpecs',
    'ephox.boulder.api.FieldPresence',
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.ValueSchema',
    'ephox.compass.Arr',
    'ephox.highway.Merger',
    'ephox.peanut.Fun',
    'ephox.perhaps.Option'
  ],

  function (SpecSchema, UiSubstitutes, Overflowing, ToolbarSpecs, FieldPresence, FieldSchema, ValueSchema, Arr, Merger, Fun, Option) {
    var schema = [
      FieldSchema.strict('dom'),
      FieldSchema.strict('groups'),

      FieldSchema.field(
        'members',
        'members',
        FieldPresence.strict(),
        ValueSchema.objOf([
          FieldSchema.strict('group')
        ])
      )
    ];

    var make = function (spec) {
      var detail = SpecSchema.asStructOrDie('toolbar.spec', schema, spec, []);

       // FIX: I don't want to calculate this here.
      var overflowSpec = ValueSchema.asStructOrDie('overflow.spec', ValueSchema.objOf([
        Overflowing.schema()
      ]), spec);

      // var builder = overflowSpec.overflowing().map(function (oInfo) {
      //   return Fun.curry(oInfo.handler().builder, oInfo);
      // }).getOr(Fun.identity);

      var components = UiSubstitutes.substitutePlaces(
        Option.some('toolbar'),
        detail,
        detail.components(),
        {
          '<alloy.toolbar.groups>': UiSubstitutes.multiple(
            Arr.map(detail.groups(), function (grp) {
              return Merger.deepMerge(
                detail.members().group().munge(grp),
                {
                  uiType: 'toolbar-group'
                }
              );
            })
          )
        }, 
        {

        }
      );

     console.log('components', components);
   
      // Maybe default some arguments here
      return Merger.deepMerge(spec, {
        dom: detail.dom(),
        keying: {
          mode: 'cyclic'
        },
        behaviours: [
          Overflowing
        ],
        postprocess: overflowSpec.overflowing().map(function (oInfo) { return Fun.curry(oInfo.handler().postprocess, oInfo); }).getOr(Fun.identity)
      }, spec, {
        uiType: 'custom',
        components: components
      });
    };

    return {
      make: make
    };
  }
);