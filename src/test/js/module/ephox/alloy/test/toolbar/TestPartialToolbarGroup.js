define(
  'ephox.alloy.test.toolbar.TestPartialToolbarGroup',

  [
    'ephox.alloy.api.behaviour.Behaviour',
    'ephox.alloy.api.behaviour.Focusing',
    'ephox.alloy.api.ui.ToolbarGroup',
    'ephox.katamari.api.Fun',
    'ephox.katamari.api.Merger'
  ],

  function (Behaviour, Focusing, ToolbarGroup, Fun, Merger) {
    var members = {
      item: {
        munge: function (itemSpec) {
          return Merger.deepMerge(
            itemSpec,
            {
              behaviours: Behaviour.derive([
                Focusing.config({ })
              ])
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
        members: members,

        parts: {
          items: { }
        }
      };
    };

    return {
      members: Fun.constant(members),
      markers: Fun.constant(markers),
      munge: munge
    };
  }
);