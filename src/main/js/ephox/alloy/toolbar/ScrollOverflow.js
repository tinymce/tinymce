define(
  'ephox.alloy.toolbar.ScrollOverflow',

  [
    'ephox.alloy.dom.DomModification',
    'ephox.boulder.api.FieldSchema',
    'ephox.compass.Arr',
    'ephox.highway.Merger',
    'ephox.peanut.Fun'
  ],

  function (DomModification, FieldSchema, Arr, Merger, Fun) {
    // TODO: This probably needs an additional container. Not sure how to do it yet. Maybe we can resolve this by making
    // overflowing behaviour not apply to everything.
    var schema = [
      FieldSchema.strict('initWidth'),
      FieldSchema.state('handler', function () {
        var schema = [ ];

        var doExhibit = function (oInfo, base) {
          return DomModification.nu({
            styles: {
              'overflow-x': 'auto',
              'max-width': oInfo.initWidth(),
              display: 'flex'
            }
          });
        };

        var builder = function (oInfo, groups) {
          return groups;
        };

        return {
          doExhibit: doExhibit,
          toApis: Fun.constant({ }),
          builder: builder,
          schema: Fun.constant(schema),
          postprocess: Fun.identity
        };
      })

    ];



    return schema;
  }
);