import { Arr } from '@ephox/katamari';
import { Css, Width } from '@ephox/sugar';
import * as AlloyTriggers from '../../api/events/AlloyTriggers';
import { CompositeSketchFactory } from '../../api/ui/UiSketcher';
import * as AlloyParts from '../../parts/AlloyParts';
import * as Overflows from '../../toolbar/Overflows';
import * as SplitToolbarSchema from '../../ui/schema/SplitToolbarSchema';
import { SplitToolbarDetail, SplitToolbarSketcher, SplitToolbarSpec } from '../../ui/types/SplitToolbarTypes';
import { Replacing } from '../behaviour/Replacing';
import { Sliding } from '../behaviour/Sliding';
import { Toggling } from '../behaviour/Toggling';
import * as GuiFactory from '../component/GuiFactory';
import * as SketchBehaviours from '../component/SketchBehaviours';
import { Button } from './Button';
import * as Sketcher from './Sketcher';
import { Toolbar } from './Toolbar';
import { ToolbarGroup } from './ToolbarGroup';
import { Keying } from '../behaviour/Keying';

const setStoredGroups = (bar, storedGroups) => {
  const bGroups = Arr.map(storedGroups, (g) => GuiFactory.premade(g));
  Toolbar.setGroups(bar, bGroups);
};

const refresh = (toolbar, detail: SplitToolbarDetail, externals, toolbarToggleEvent) => {
  const primary = AlloyParts.getPartOrDie(toolbar, detail, 'primary');
  const overflow = AlloyParts.getPart(toolbar, detail, 'overflow').orThunk(() => detail.overflow(toolbar));

  // Set the primary toolbar to have visibilty hidden;
  Css.set(primary.element(), 'visibility', 'hidden');

  // Clear the overflow toolbar
  overflow.each((overf) => {
    Toolbar.setGroups(overf, []);
  });

  // Put all the groups inside the primary toolbar
  const groups = detail.builtGroups.get();

  const overflowGroupSpec = ToolbarGroup.sketch({
    ...externals['overflow-group'](),
    items: [
      Button.sketch({
        ...externals['overflow-button'](),
        action (_button) {
          if (detail.floating === true) {
            // Note: THIS WILL REMAKE THE BUTTON
            AlloyTriggers.emit(toolbar, toolbarToggleEvent);
          } else {
            // This used to look up the overflow again ... we may need to do that.
            overflow.each((overf) => {
              Sliding.toggleGrow(overf);
            });
          }
        }
      })
    ]
  });
  const overflowGroup = toolbar.getSystem().build(overflowGroupSpec);

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

  overflow.each((overf) => {
    if (!detail.floating) {
      Sliding.refresh(overf);
    }

    AlloyParts.getPart(toolbar, detail, 'overflow-button').each((moreButton) => {
      if (detail.floating) {
        Toggling.set(moreButton, overf.getSystem().isConnected());
      } else {
        Toggling.set(moreButton, Sliding.hasGrown(overf));
        Keying.focusIn(overf);
      }
    });
  });
};

const factory: CompositeSketchFactory<SplitToolbarDetail, SplitToolbarSpec> = (detail, components, spec, externals) => {
  const toolbarToggleEvent = 'alloy.toolbar.toggle';

  const doSetGroups = (toolbar, groups) => {
    const built = Arr.map(groups, toolbar.getSystem().build);
    detail.builtGroups.set(built);
  };

  const setGroups = (toolbar, groups) => {
    doSetGroups(toolbar, groups);
    refresh(toolbar, detail, externals, toolbarToggleEvent);
  };

  const getMoreButton = (toolbar) => {
    return AlloyParts.getPart(toolbar, detail, 'overflow-button');
  };

  const getOverflow = (toolbar) => {
    return AlloyParts.getPart(toolbar, detail, 'overflow').orThunk(() => detail.overflow(toolbar));
  };

  return {
    uid: detail.uid,
    dom: detail.dom,
    components,
    behaviours: SketchBehaviours.augment(
      detail.splitToolbarBehaviours,
      []
    ),
    apis: {
      setGroups,
      refresh(toolbar) {
        refresh(toolbar, detail, externals, toolbarToggleEvent);
      },
      getMoreButton(toolbar) {
        return getMoreButton(toolbar);
      },
      getOverflow(toolbar) {
        return getOverflow(toolbar);
      }
    },

    domModification: {
      attributes: { role: 'group' }
    }
  };
};

const SplitToolbar = Sketcher.composite({
  name: 'SplitToolbar',
  configFields: SplitToolbarSchema.schema(),
  partFields: SplitToolbarSchema.parts(),
  factory,
  apis: {
    setGroups(apis, toolbar, groups) {
      apis.setGroups(toolbar, groups);
    },
    refresh(apis, toolbar) {
      apis.refresh(toolbar);
    },
    getMoreButton(apis, toolbar) {
      return apis.getMoreButton(toolbar);
    },
    getOverflow(apis, toolbar) {
      return apis.getOverflow(toolbar);
    }
  }
}) as SplitToolbarSketcher;

export {
  SplitToolbar
};