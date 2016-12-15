define(
  'ephox.alloy.test.toolbar.TestPartialToolbarGroup',

  [
    'ephox.alloy.api.ui.ToolbarGroup',
    'ephox.peanut.Fun'
  ],

  function (ToolbarGroup, Fun) {
    var members = {
      item: {
        munge: function (itemSpec) {
          return {
            uiType: 'custom',
            dom: {
              tag: 'button',
              innerHtml: itemSpec.text
            },

            behaviours: {
              focusing: true
            }
          };
        }
      }
    };

    var markers = {
      itemClass: 'toolbar-item'
    };

    var munge = function (spec) {
      return {
        dom: {
          tag: 'div'
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