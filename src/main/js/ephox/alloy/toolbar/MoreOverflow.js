define(
  'ephox.alloy.toolbar.MoreOverflow',

  [
    'ephox.alloy.dom.DomModification',
    'ephox.boulder.api.FieldSchema',
    'ephox.peanut.Fun'
  ],

  function (DomModification, FieldSchema, Fun) {
    var schema = [
      FieldSchema.strict('initWidth'),
      FieldSchema.strict('getDrawer'),
      FieldSchema.state('handler', function () {
        var schema = [ ];

        var doExhibit = function (oInfo, base) {
          return DomModification.nu({ });
        };

        return {
          doExhibit: doExhibit,
          schema: Fun.constant(schema)
        };
      })

    ];



    return schema;
  }
);