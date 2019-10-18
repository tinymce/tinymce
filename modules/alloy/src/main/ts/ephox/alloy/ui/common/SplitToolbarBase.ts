import { FieldProcessorAdt, FieldSchema } from '@ephox/boulder';
import { Arr, Cell, Fun, Option } from '@ephox/katamari';

import * as AddEventsBehaviour from '../../api/behaviour/AddEventsBehaviour';
import { Coupling } from '../../api/behaviour/Coupling';
import { AlloyComponent } from '../../api/component/ComponentApi';
import * as SketchBehaviours from '../../api/component/SketchBehaviours';
import { AlloySpec, SketchSpec } from '../../api/component/SpecTypes';
import * as AlloyEvents from '../../api/events/AlloyEvents';
import * as AlloyTriggers from '../../api/events/AlloyTriggers';
import { Button } from '../../api/ui/Button';
import { ToolbarGroup } from '../../api/ui/ToolbarGroup';
import * as AlloyParts from '../../parts/AlloyParts';
import { SplitToolbarBaseDetail, SplitToolbarBaseSpec } from '../types/SplitToolbarBaseTypes';

export interface SpecExtras<T extends SplitToolbarBaseDetail> {
  apis: {
    refresh: (toolbar: AlloyComponent) => void;
    toggle: (toolbar: AlloyComponent) => void;
    getOverflow: (toolbar: AlloyComponent) => Option<AlloyComponent>;
    [key: string]: (toolbar: AlloyComponent) => void;
  };
  coupling: Record<string, (comp: AlloyComponent) => AlloySpec>;
}

const schema: () => FieldProcessorAdt[] = Fun.constant([
  SketchBehaviours.field('splitToolbarBehaviours', [ Coupling ]),
  FieldSchema.state('builtGroups', () => {
    return Cell([ ]);
  })
]);

const spec = <T extends SplitToolbarBaseDetail, U extends SplitToolbarBaseSpec>(detail: T, components: AlloySpec[], spec: U, externals: any, extras: SpecExtras<T>): SketchSpec => {
  const toolbarToggleEvent = 'alloy.toolbar.toggle';

  const doSetGroups = (toolbar, groups) => {
    const built = Arr.map(groups, toolbar.getSystem().build);
    detail.builtGroups.set(built);
  };

  const setGroups = (toolbar, groups) => {
    doSetGroups(toolbar, groups);
    extras.apis.refresh(toolbar);
  };

  const getMoreButton = (toolbar) => {
    return AlloyParts.getPart(toolbar, detail, 'overflow-button');
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
            ...extras.coupling,
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
            extras.apis.toggle(toolbar);
          })
        ])
      ]
    ),
    apis: {
      setGroups,
      getMoreButton(toolbar) {
        return getMoreButton(toolbar);
      },
      ...extras.apis
    },

    domModification: {
      attributes: { role: 'group' }
    }
  };
};

export {
  schema,
  spec
};
