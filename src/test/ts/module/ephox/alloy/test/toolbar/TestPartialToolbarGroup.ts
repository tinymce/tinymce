import { Arr, Fun, Merger } from '@ephox/katamari';
import * as Behaviour from 'ephox/alloy/api/behaviour/Behaviour';
import { Focusing } from 'ephox/alloy/api/behaviour/Focusing';
import { Toolbar } from 'ephox/alloy/api/ui/Toolbar';
import { ToolbarGroup } from 'ephox/alloy/api/ui/ToolbarGroup';

const mungeItem = (itemSpec) => {
  return Merger.deepMerge(
    itemSpec,
    {
      behaviours: Behaviour.derive([
        Focusing.config({ })
      ])
    },
    {
      domModification: {
        classes: [ 'toolbar-item' ]
      }
    }
  );
};

const itemMarkers = {
  itemSelector: 'toolbar-item'
};

const munge = (spec) => {
  return {
    dom: {
      tag: 'div',
      classes: [ 'test-toolbar-group' ]
    },
    components: [
      ToolbarGroup.parts().items({ })
    ],
    items: Arr.map(spec.items, mungeItem),
    markers: itemMarkers
  };
};

const setGroups = (tb, gs) => {
  const gps = createGroups(gs);
  Toolbar.setGroups(tb, gps);
};

const createGroups = (gs) => {
  return Arr.map(gs, Fun.compose(ToolbarGroup.sketch, munge));
};

const markers = () => itemMarkers;

export {
  markers,
  munge,
  setGroups,
  createGroups
};