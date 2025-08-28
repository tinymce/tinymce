import { Arr, Fun, Merger } from '@ephox/katamari';

import * as Behaviour from 'ephox/alloy/api/behaviour/Behaviour';
import { Focusing } from 'ephox/alloy/api/behaviour/Focusing';
import { AlloyComponent } from 'ephox/alloy/api/component/ComponentApi';
import { AlloySpec, SketchSpec } from 'ephox/alloy/api/component/SpecTypes';
import { Toolbar } from 'ephox/alloy/api/ui/Toolbar';
import { ToolbarGroup } from 'ephox/alloy/api/ui/ToolbarGroup';
import { ToolbarGroupSpec } from 'ephox/alloy/ui/types/ToolbarGroupTypes';

const mungeItem = (itemSpec: AlloySpec) => Merger.deepMerge(
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

const itemMarkers: ToolbarGroupSpec['markers'] = {
  itemSelector: 'toolbar-item'
};

const munge = (spec: { items: AlloySpec[] }): ToolbarGroupSpec => ({
  dom: {
    tag: 'div',
    classes: [ 'test-toolbar-group' ]
  },
  components: [
    ToolbarGroup.parts.items({ })
  ],
  items: Arr.map(spec.items, mungeItem),
  markers: itemMarkers
});

const setGroups = (tb: AlloyComponent, gs: Array<{ items: AlloySpec[] }>): void => {
  const gps = createGroups(gs);
  Toolbar.setGroups(tb, gps);
};

const createGroups = (gs: Array<{ items: AlloySpec[] }>): SketchSpec[] =>
  Arr.map(gs, Fun.compose(ToolbarGroup.sketch, munge));

const markers = Fun.constant(itemMarkers);

export {
  markers,
  munge,
  setGroups,
  createGroups
};
