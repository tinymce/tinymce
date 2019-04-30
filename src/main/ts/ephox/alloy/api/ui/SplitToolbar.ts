import { Arr, Option } from '@ephox/katamari';
import { Css, Width, Element } from '@ephox/sugar';
import * as AlloyTriggers from '../../api/events/AlloyTriggers';
import { CompositeSketchFactory } from '../../api/ui/UiSketcher';
import * as AlloyParts from '../../parts/AlloyParts';
import * as Overflows from '../../toolbar/Overflows';
import * as SplitToolbarSchema from '../../ui/schema/SplitToolbarSchema';
import { SplitToolbarDetail, SplitToolbarSketcher, SplitToolbarSpec } from '../../ui/types/SplitToolbarTypes';
import * as AddEventsBehaviour from '../behaviour/AddEventsBehaviour';
import { Coupling } from '../behaviour/Coupling';
import { Focusing } from '../behaviour/Focusing';
import { Keying } from '../behaviour/Keying';
import { Positioning } from '../behaviour/Positioning';
import { Replacing } from '../behaviour/Replacing';
import { Sandboxing } from '../behaviour/Sandboxing';
import { Sliding } from '../behaviour/Sliding';
import { Toggling } from '../behaviour/Toggling';
import * as GuiFactory from '../component/GuiFactory';
import * as SketchBehaviours from '../component/SketchBehaviours';
import { Button } from './Button';
import * as Sketcher from './Sketcher';
import { Toolbar } from './Toolbar';
import { ToolbarGroup } from './ToolbarGroup';
import * as Behaviour from '../../api/behaviour/Behaviour';
import { AlloyComponent } from '../component/ComponentApi';
import * as AlloyEvents from '../events/AlloyEvents';
import * as AriaOwner from '../../aria/AriaOwner';
import * as ComponentStructure from '../../alien/ComponentStructure';

const setStoredGroups = (bar, storedGroups) => {
  const bGroups = Arr.map(storedGroups, (g) => GuiFactory.premade(g));
  Toolbar.setGroups(bar, bGroups);
};

const makeSandbox = (toolbar: AlloyComponent, detail: SplitToolbarDetail) => {
  const ariaOwner = AriaOwner.manager();

  return {
    dom: {
      tag: 'div',
      attributes: {
        id: ariaOwner.id()
      }
    },
    behaviours: Behaviour.derive(
      [
        Keying.config({
          mode: 'special',
          onEscape: (comp) => {
            Sandboxing.close(comp);
            return Option.some(true);
          }
        }),
        Sandboxing.config({
          onOpen: (sandbox, overf) => {
            // Refresh the content
            refresh(toolbar, detail);

            // Position the overflow
            const sink = detail.lazySink(toolbar).getOrDie();
            const anchor = detail.floatingAnchor(toolbar).getOrDie();
            Positioning.position(sink, anchor, overf);

            // Toggle the button and focus the first item in the overflow
            AlloyParts.getPart(toolbar, detail, 'overflow-button').each((button) => {
              Toggling.on(button);
              ariaOwner.link(button.element());
            });
            Keying.focusIn(overf);
          },
          onClose: () => {
            // Toggle and focus the button
            AlloyParts.getPart(toolbar, detail, 'overflow-button').each((button) => {
              Toggling.off(button);
              Focusing.focus(button);
              ariaOwner.unlink(button.element());
            });
          },
          isPartOf (container: AlloyComponent, data: AlloyComponent, queryElem: Element): boolean {
            return ComponentStructure.isPartOf(data, queryElem) || ComponentStructure.isPartOf(toolbar, queryElem);
          },
          getAttachPoint () {
            return detail.lazySink(toolbar).getOrDie();
          }
        })
      ]
    )
  };
};

const toggleToolbar = (toolbar: AlloyComponent, detail: SplitToolbarDetail, externals) => {
  if (detail.floating === true) {
    const sandbox = Coupling.getCoupled(toolbar, 'sandbox');
    if (Sandboxing.isOpen(sandbox)) {
      Sandboxing.close(sandbox);
    } else {
      Sandboxing.open(sandbox, externals['overflow']());
    }
  } else {
    AlloyParts.getPart(toolbar, detail, 'overflow').each((overf) => {
      Sliding.toggleGrow(overf);
      refresh(toolbar, detail);
    });
  }
};

const isOpen = (overf: AlloyComponent, detail: SplitToolbarDetail) => {
  return detail.floating === true ? overf.getSystem().isConnected() : Sliding.hasGrown(overf);
};

const refresh = (toolbar, detail: SplitToolbarDetail) => {
  const primary = AlloyParts.getPartOrDie(toolbar, detail, 'primary');
  const overflow = AlloyParts.getPart(toolbar, detail, 'overflow').orThunk(() => Sandboxing.getState(Coupling.getCoupled(toolbar, 'sandbox')));
  const overflowButton = AlloyParts.getPart(toolbar, detail, 'overflow-button');
  const overflowGroup = Coupling.getCoupled(toolbar, 'overflowGroup');

  // Set the primary toolbar to have visibility hidden;
  Css.set(primary.element(), 'visibility', 'hidden');

  // Store the current overflow button focus state
  const buttonFocusState = overflowButton.fold(() => false, Focusing.isFocused);

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
    if (isOpen(overf, detail)) {
      overflowButton.each(Toggling.on);
      Keying.focusIn(overf);
    } else {
      overflowButton.each(Toggling.off);
      if (buttonFocusState === true) {
        overflowButton.each(Focusing.focus);
      }
    }
  })
};

const factory: CompositeSketchFactory<SplitToolbarDetail, SplitToolbarSpec> = (detail, components, spec, externals) => {
  const toolbarToggleEvent = 'alloy.toolbar.toggle';

  const doSetGroups = (toolbar, groups) => {
    const built = Arr.map(groups, toolbar.getSystem().build);
    detail.builtGroups.set(built);
  };

  const setGroups = (toolbar, groups) => {
    doSetGroups(toolbar, groups);
    refresh(toolbar, detail);
  };

  const getMoreButton = (toolbar) => {
    return AlloyParts.getPart(toolbar, detail, 'overflow-button');
  };

  const getOverflow = (toolbar) => {
    return AlloyParts.getPart(toolbar, detail, 'overflow').orThunk(() => Sandboxing.getState(Coupling.getCoupled(toolbar, 'sandbox')));
  };

  return {
    uid: detail.uid,
    dom: detail.dom,
    components: components.concat(detail.floating === true ? [ ] : [ externals['overflow']() ]),
    behaviours: SketchBehaviours.augment(
      detail.splitToolbarBehaviours,
      [
        Coupling.config({
          others: {
            sandbox (toolbar) {
              return makeSandbox(toolbar, detail)
            },
            overflowGroup (toolbar) {
              return ToolbarGroup.sketch({
                ...externals['overflow-group'](),
                items: [
                  Button.sketch({
                    ...externals['overflow-button'](),
                    action (_button) {
                      AlloyTriggers.emit(toolbar, toolbarToggleEvent);
                    }
                  })
                ]
              });
            }
          }
        }),
        AddEventsBehaviour.config('toolbar-toggle-events', [
          AlloyEvents.run(toolbarToggleEvent, (toolbar) => {
            toggleToolbar(toolbar, detail, externals);
          })
        ])
      ]
    ),
    apis: {
      setGroups,
      refresh(toolbar) {
        refresh(toolbar, detail);
      },
      getMoreButton(toolbar) {
        return getMoreButton(toolbar);
      },
      getOverflow(toolbar) {
        return getOverflow(toolbar);
      },
      toggle(toolbar) {
        toggleToolbar(toolbar, detail, externals);
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
    },
    toggle(apis, toolbar) {
      apis.toggle(toolbar);
    }
  }
}) as SplitToolbarSketcher;

export {
  SplitToolbar
};