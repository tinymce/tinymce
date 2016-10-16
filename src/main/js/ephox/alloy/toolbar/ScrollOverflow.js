define(
  'ephox.alloy.toolbar.ScrollOverflow',

  [
    'ephox.boulder.api.FieldSchema',
    'ephox.compass.Arr',
    'ephox.highway.Merger'
  ],

  function (FieldSchema, Arr, Merger) {
    // TODO: This probably needs an additional container. Not sure how to do it yet. Maybe we can resolve this by making
    // overflowing behaviour not apply to everything.
    var schema = [
      FieldSchema.state('builder', function () {
        return function (info, groups) {
          return Arr.map(groups, function (group) {
            return Merger.deepMerge(group, {
              dom: {
                styles: {
                  display: 'flex'
                }
              }
            });
          });
          return [
            {
              uiType: 'container',
              components: Arr.map(groups, function (group) {
                return Merger.deepMerge(group, {
                  dom: {
                    styles: {
                      display: 'flex'
                    }
                  }
                });
              }),
              dom: {
                // styles: {
                //   'dis'
                // }
              }
            }
          ]
        };
      })

    ];



    return schema;
  }
);