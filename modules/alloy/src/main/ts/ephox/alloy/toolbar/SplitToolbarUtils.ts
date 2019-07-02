import { Arr, Option } from '@ephox/katamari';
import { Css, Width, Focus } from '@ephox/sugar';

import { Coupling } from '../api/behaviour/Coupling';
import { Focusing } from '../api/behaviour/Focusing';
import { Replacing } from '../api/behaviour/Replacing';
import { Toggling } from '../api/behaviour/Toggling';
import { AlloyComponent } from '../api/component/ComponentApi';
import * as GuiFactory from '../api/component/GuiFactory';
import { Toolbar } from '../api/ui/Toolbar';
import { SplitToolbarBaseDetail } from '../ui/types/SplitToolbarBaseTypes';
import * as AlloyParts from '../parts/AlloyParts';
import * as Overflows from './Overflows';

const setStoredGroups = (toolbar: AlloyComponent, storedGroups: AlloyComponent[]) => {
  const bGroups = Arr.map(storedGroups, (g) => GuiFactory.premade(g));
  Toolbar.setGroups(toolbar, bGroups);
};

const findFocusedComp = (overflow: Option<AlloyComponent>, overflowButton: Option<AlloyComponent>): Option<AlloyComponent> => {
  return overflow.bind((overf) => {
    return Focus.search(overf.element()).bind((focusedElm) => overf.getSystem().getByDom(focusedElm).toOption());
  }).orThunk(() => {
    return overflowButton.filter(Focusing.isFocused);
  });
};

const refresh = (toolbar: AlloyComponent, detail: SplitToolbarBaseDetail, overflow: Option<AlloyComponent>, isOpen: (overf: AlloyComponent) => boolean) => {
  const primary = AlloyParts.getPartOrDie(toolbar, detail, 'primary');
  const overflowButton = AlloyParts.getPart(toolbar, detail, 'overflow-button');
  const overflowGroup = Coupling.getCoupled(toolbar, 'overflowGroup');

  // Set the primary toolbar to have visibility hidden;
  Css.set(primary.element(), 'visibility', 'hidden');

  // Store the current focus state
  const focusedComp = findFocusedComp(overflow, overflowButton);

  // Clear the overflow toolbar
  overflow.each((overf) => {
    Toolbar.setGroups(overf, []);
  });

  // Put all the groups inside the primary toolbar
  const groups = detail.builtGroups.get();

  setStoredGroups(primary, groups.concat([overflowGroup]));

  const total = Width.get(primary.element());

  const overflows = Overflows.partition(total, groups, (comp) => {
    return Width.get(comp.element());
  }, overflowGroup);

  if (overflows.extra().length === 0) {
    // Not ideal. Breaking abstraction somewhat, though remove is better than insert
    // Can just reset the toolbar groups also ... but may be a bit slower.
    Replacing.remove(primary, overflowGroup);
    overflow.each((overf) => {
      Toolbar.setGroups(overf, []);
    });
    // Maybe remove the overflow drawer.
  } else {
    setStoredGroups(primary, overflows.within());
    overflow.each((overf) => {
      setStoredGroups(overf, overflows.extra());
    });
    // Maybe add the overflow drawer.
  }

  Css.remove(primary.element(), 'visibility');
  Css.reflow(primary.element());

  // Restore the focus and toggle state
  overflow.each((overf) => {
    overflowButton.each((button) => Toggling.set(button, isOpen(overf)));
    focusedComp.each(Focusing.focus);
  });
};

export {
  refresh,
  setStoredGroups
};
