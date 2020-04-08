import { Arr, Option } from '@ephox/katamari';
import { Css, Focus, Width } from '@ephox/sugar';

import { Coupling } from '../api/behaviour/Coupling';
import { Focusing } from '../api/behaviour/Focusing';

import { Replacing } from '../api/behaviour/Replacing';
import { AlloyComponent } from '../api/component/ComponentApi';
import * as GuiFactory from '../api/component/GuiFactory';
import { Toolbar } from '../api/ui/Toolbar';
import * as AlloyParts from '../parts/AlloyParts';
import { SplitToolbarBaseDetail } from '../ui/types/SplitToolbarBaseTypes';
import * as Overflows from './Overflows';

const setGroups = (toolbar: AlloyComponent, storedGroups: AlloyComponent[]) => {
  const bGroups = Arr.map(storedGroups, (g) => GuiFactory.premade(g));
  Toolbar.setGroups(toolbar, bGroups);
};

const findFocusedComp = (comps: AlloyComponent[]): Option<AlloyComponent> => Arr.findMap(comps, (comp) => Focus.search(comp.element()).bind((focusedElm) => comp.getSystem().getByDom(focusedElm).toOption()));

const refresh = (toolbar: AlloyComponent, detail: SplitToolbarBaseDetail, setOverflow: (groups: AlloyComponent[]) => void) => {
  const primary = AlloyParts.getPartOrDie(toolbar, detail, 'primary');
  const overflowGroup = Coupling.getCoupled(toolbar, 'overflowGroup');

  // Set the primary toolbar to have visibility hidden;
  Css.set(primary.element(), 'visibility', 'hidden');

  const groups = detail.builtGroups.get().concat([ overflowGroup ]);

  // Store the current focus state
  const focusedComp = findFocusedComp(groups);

  // Clear the overflow toolbar
  setOverflow([]);

  // Put all the groups inside the primary toolbar
  setGroups(primary, groups);

  const availableWidth = Width.get(primary.element());

  const overflows = Overflows.partition(availableWidth, detail.builtGroups.get(), (comp) => Width.get(comp.element()), overflowGroup);

  if (overflows.extra().length === 0) {
    // Not ideal. Breaking abstraction somewhat, though remove is better than insert
    // Can just reset the toolbar groups also ... but may be a bit slower.
    Replacing.remove(primary, overflowGroup);
    setOverflow([]);
  } else {
    setGroups(primary, overflows.within());
    setOverflow(overflows.extra());
  }

  Css.remove(primary.element(), 'visibility');
  Css.reflow(primary.element());

  // Restore the focus
  focusedComp.each(Focusing.focus);
};

export {
  refresh
};
