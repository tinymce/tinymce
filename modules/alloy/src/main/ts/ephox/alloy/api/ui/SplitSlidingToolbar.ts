import { Arr } from '@ephox/katamari';

import * as AlloyParts from '../../parts/AlloyParts';
import * as SplitToolbarUtils from '../../toolbar/SplitToolbarUtils';
import * as SplitSlidingToolbarSchema from '../../ui/schema/SplitSlidingToolbarSchema';
import {
  SplitSlidingToolbarApis, SplitSlidingToolbarDetail, SplitSlidingToolbarSketcher, SplitSlidingToolbarSpec
} from '../../ui/types/SplitSlidingToolbarTypes';
import * as AddEventsBehaviour from '../behaviour/AddEventsBehaviour';
import { Coupling } from '../behaviour/Coupling';
import { Sliding } from '../behaviour/Sliding';
import { Toggling } from '../behaviour/Toggling';
import { AlloyComponent } from '../component/ComponentApi';
import * as GuiFactory from '../component/GuiFactory';
import * as SketchBehaviours from '../component/SketchBehaviours';
import { AlloySpec } from '../component/SpecTypes';
import * as AlloyEvents from '../events/AlloyEvents';
import * as AlloyTriggers from '../events/AlloyTriggers';
import { Button } from './Button';
import * as Sketcher from './Sketcher';
import { Toolbar } from './Toolbar';
import { ToolbarGroup } from './ToolbarGroup';
import { CompositeSketchFactory } from './UiSketcher';

const isOpen = (toolbar: AlloyComponent, detail: SplitSlidingToolbarDetail) =>
  AlloyParts.getPart(toolbar, detail, 'overflow').map(Sliding.hasGrown).getOr(false);

const toggleToolbar = (toolbar: AlloyComponent, detail: SplitSlidingToolbarDetail) => {
  // Make sure that the toolbar needs to toggled by checking for overflow button presence
  AlloyParts.getPart(toolbar, detail, 'overflow-button')
    .bind(() => AlloyParts.getPart(toolbar, detail, 'overflow'))
    .each((overf) => {
      refresh(toolbar, detail);
      Sliding.toggleGrow(overf);
    });
};

const refresh = (toolbar: AlloyComponent, detail: SplitSlidingToolbarDetail) => {
  AlloyParts.getPart(toolbar, detail, 'overflow').each((overflow) => {
    SplitToolbarUtils.refresh(toolbar, detail, (groups) => {
      const builtGroups = Arr.map(groups, (g) => GuiFactory.premade(g));
      Toolbar.setGroups(overflow, builtGroups);
    });

    AlloyParts.getPart(toolbar, detail, 'overflow-button').each((button) => {
      if (Sliding.hasGrown(overflow)) {
        Toggling.on(button);
      }
    });

    Sliding.refresh(overflow);
  });
};

const factory: CompositeSketchFactory<SplitSlidingToolbarDetail, SplitSlidingToolbarSpec> = (detail, components, spec, externals) => {
  const toolbarToggleEvent = 'alloy.toolbar.toggle';

  const doSetGroups = (toolbar: AlloyComponent, groups: AlloySpec[]) => {
    const built = Arr.map(groups, toolbar.getSystem().build);
    detail.builtGroups.set(built);
  };

  return {
    uid: detail.uid,
    dom: detail.dom,
    components,
    behaviours: SketchBehaviours.augment(
      detail.splitToolbarBehaviours,
      [
        Coupling.config({
          others: {
            overflowGroup: (toolbar) => {
              return ToolbarGroup.sketch({
                ...externals['overflow-group'](),
                items: [
                  Button.sketch({
                    ...externals['overflow-button'](),
                    action: (_button) => {
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
            toggleToolbar(toolbar, detail);
          })
        ])
      ]
    ),
    apis: {
      setGroups: (toolbar: AlloyComponent, groups: AlloySpec[]) => {
        doSetGroups(toolbar, groups);
        refresh(toolbar, detail);
      },
      refresh: (toolbar: AlloyComponent) => refresh(toolbar, detail),
      toggle: (toolbar: AlloyComponent) => toggleToolbar(toolbar, detail),
      isOpen: (toolbar: AlloyComponent) => isOpen(toolbar, detail)
    },
    domModification: {
      attributes: { role: 'group' }
    }
  };
};

const SplitSlidingToolbar: SplitSlidingToolbarSketcher = Sketcher.composite<SplitSlidingToolbarSpec, SplitSlidingToolbarDetail, SplitSlidingToolbarApis>({
  name: 'SplitSlidingToolbar',
  configFields: SplitSlidingToolbarSchema.schema(),
  partFields: SplitSlidingToolbarSchema.parts(),
  factory,
  apis: {
    setGroups: (apis, toolbar, groups) => {
      apis.setGroups(toolbar, groups);
    },
    refresh: (apis, toolbar) => {
      apis.refresh(toolbar);
    },
    toggle: (apis, toolbar) => {
      apis.toggle(toolbar);
    },
    isOpen: (apis, toolbar) => apis.isOpen(toolbar)
  }
});

export { SplitSlidingToolbar };
