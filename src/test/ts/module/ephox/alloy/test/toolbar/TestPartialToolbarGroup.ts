import { Arr, Fun, Merger } from '@ephox/katamari';
import * as Behaviour from 'ephox/alloy/api/behaviour/Behaviour';
import { Focusing } from 'ephox/alloy/api/behaviour/Focusing';
import { Toolbar } from 'ephox/alloy/api/ui/Toolbar';
import { ToolbarGroup } from 'ephox/alloy/api/ui/ToolbarGroup';

const mungeItem = function (itemSpec) {
  return Merger.deepMerge(
    itemSpec,
    {
      behaviours: Behaviour.derive([
        Focusing.config({ })
      ])
    }
  );
};

const markers = {
  itemClass: 'toolbar-item'
};

const munge = function (spec) {
  return {
    dom: {
      tag: 'div',
      classes: [ 'test-toolbar-group' ]
    },
    components: [
      ToolbarGroup.parts().items({ })
    ],
    items: Arr.map(spec.items, mungeItem),
    markers
  };
};

const setGroups = function (tb, gs) {
  const gps = createGroups(gs);
  Toolbar.setGroups(tb, gps);
};

const createGroups = function (gs) {
  return Arr.map(gs, Fun.compose(ToolbarGroup.sketch, munge));
};

export default <any> {
  markers: Fun.constant(markers),
  munge,
  setGroups,
  createGroups
};