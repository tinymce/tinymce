define(
  'ephox.alloy.test.toolbar.TestPartialToolbarGroup',

  [
    'ephox.alloy.api.behaviour.Behaviour',
    'ephox.alloy.api.behaviour.Focusing',
    'ephox.alloy.api.ui.Toolbar',
    'ephox.alloy.api.ui.ToolbarGroup',
    'ephox.katamari.api.Arr',
    'ephox.katamari.api.Fun',
    'ephox.katamari.api.Merger'
  ],

  function (Behaviour, Focusing, Toolbar, ToolbarGroup, Arr, Fun, Merger) {
    var mungeItem = function (itemSpec) {
      return Merger.deepMerge(
        itemSpec,
        {
          behaviours: Behaviour.derive([
            Focusing.config({ })
          ])
        }
      );
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
          ToolbarGroup.parts().items({ })
        ],
        items: Arr.map(spec.items, mungeItem),
        markers: markers
      };
    };

    var setGroups = function (tb, gs) {
      var gps = createGroups(gs);
      Toolbar.setGroups(tb, gps);
    };

    var createGroups = function (gs) {
      return Arr.map(gs, Fun.compose(ToolbarGroup.sketch, munge));
    };

    return {
      markers: Fun.constant(markers),
      munge: munge,
      setGroups: setGroups,
      createGroups: createGroups
    };
  }
);