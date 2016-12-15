define(
  'ephox.alloy.test.toolbar.TestPartialToolbarGroup',

  [
    'ephox.alloy.api.ui.ToolbarGroup',
    'ephox.highway.Merger',
    'ephox.peanut.Fun'
  ],

  function (ToolbarGroup, Merger, Fun) {
    var members = {
      item: {
        munge: function (itemSpec) {
          return Merger.deepMerge(
            itemSpec,
            {
              behaviours: {
                focusing: true
              }
            }
          );
        }
      }
    };

    var markers = {
      itemClass: 'toolbar-item'
    };

    var munge = function (spec) {
      return {
        dom: {
          tag: 'div',
          classes: [ 'test-toolbar-group' ]
        },
        components: [
          ToolbarGroup.parts().items()
        ],
        items: spec.items,
        markers: markers,
        members: members
      };
    };

    return {
      members: Fun.constant(members),
      markers: Fun.constant(markers),
      munge: munge
    };
  }
);