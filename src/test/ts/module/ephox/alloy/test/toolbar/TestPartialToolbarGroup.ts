import Behaviour from 'ephox/alloy/api/behaviour/Behaviour';
import Focusing from 'ephox/alloy/api/behaviour/Focusing';
import Toolbar from 'ephox/alloy/api/ui/Toolbar';
import ToolbarGroup from 'ephox/alloy/api/ui/ToolbarGroup';
import { Arr } from '@ephox/katamari';
import { Fun } from '@ephox/katamari';
import { Merger } from '@ephox/katamari';

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

export default <any> {
  markers: Fun.constant(markers),
  munge: munge,
  setGroups: setGroups,
  createGroups: createGroups
};