define(
  'ephox.alloy.spec.ToolbarSpec',

  [
    'ephox.alloy.toolbar.Overflowing',
    'ephox.alloy.toolbar.ToolbarSpecs',
    'ephox.boulder.api.ValueSchema',
    'ephox.compass.Arr',
    'ephox.highway.Merger',
    'ephox.peanut.Fun'
  ],

  function (Overflowing, ToolbarSpecs, ValueSchema, Arr, Merger, Fun) {
    var make = function (spec) {
      var detail = ValueSchema.asStructOrDie('toolbar.spec', ToolbarSpecs.toolbarSchema(), spec);

      // FIX: I don't want to calculate this here.
      var overflowSpec = ValueSchema.asStructOrDie('overflow.spec', ValueSchema.objOf([
        Overflowing.schema()
      ]), spec);

      var builder = overflowSpec.overflowing().map(function (oInfo) {
        return Fun.curry(oInfo.handler().builder, oInfo);
      }).getOr(Fun.identity);

      var groups = Arr.map(detail.groups(), ToolbarSpecs.buildGroup);
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
        components: builder(groups),
        behaviours: [
          Overflowing
        ],
        postprocess: overflowSpec.overflowing().map(function (oInfo) { return Fun.curry(oInfo.handler().postprocess, oInfo); }).getOr(Fun.identity)
      }, spec, {
        uiType: 'custom'
      });
    };

    return {
      make: make
    };
  }
);