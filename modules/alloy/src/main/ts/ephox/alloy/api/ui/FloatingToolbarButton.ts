import { Fun, Optional } from '@ephox/katamari';

import * as ComponentStructure from '../../alien/ComponentStructure';
import * as AriaControls from '../../aria/AriaControls';
import * as MaxWidth from '../../positioning/layout/MaxWidth';
import { Layouts } from '../../positioning/mode/Anchoring';
import * as Dismissal from '../../sandbox/Dismissal';
import * as Reposition from '../../sandbox/Reposition';
import * as FloatingToolbarButtonSchema from '../../ui/schema/FloatingToolbarButtonSchema';
import {
  FloatingToolbarButtonApis, FloatingToolbarButtonDetail, FloatingToolbarButtonSketcher, FloatingToolbarButtonSpec
} from '../../ui/types/FloatingToolbarButtonTypes';
import * as Behaviour from '../behaviour/Behaviour';
import { Coupling } from '../behaviour/Coupling';
import { Focusing } from '../behaviour/Focusing';
import { Keying } from '../behaviour/Keying';
import { Positioning } from '../behaviour/Positioning';
import { Receiving } from '../behaviour/Receiving';
import { Sandboxing } from '../behaviour/Sandboxing';
import { Toggling } from '../behaviour/Toggling';
import { AlloyComponent } from '../component/ComponentApi';
import { SketchBehaviours } from '../component/SketchBehaviours';
import { AlloySpec, SketchSpec } from '../component/SpecTypes';
import { Button } from './Button';
import * as Sketcher from './Sketcher';
import { Toolbar } from './Toolbar';
import { CompositeSketchFactory } from './UiSketcher';

const onClose = (
  button: AlloyComponent,
  toolbar: AlloyComponent,
  ariaControls: AriaControls.AriaManager,
  options?: { skipFocus: boolean }
) => {
  Sandboxing.close(toolbar);
  Toggling.off(button);
  if (!options?.skipFocus) {
    Focusing.focus(button);
  }
  ariaControls.unlink(button.element);
};

const toggle = (
  button: AlloyComponent,
  externals: Record<string, any>,
  detail: FloatingToolbarButtonDetail,
  spec: FloatingToolbarButtonSpec,
  ariaControls: AriaControls.AriaManager,
  options?: { skipFocus: boolean }
) => {
  const toolbarSandbox = Coupling.getCoupled(button, 'toolbarSandbox');

  if (Sandboxing.isOpen(toolbarSandbox)) {
    onClose(button, toolbarSandbox, ariaControls, options);
  } else {
    Sandboxing.open(toolbarSandbox, externals.toolbar());
    detail.fetch().get((groups) => {
      Sandboxing.getState(toolbarSandbox).each((toolbar) => {
        setGroups(button, toolbar, detail, spec.layouts, groups);
        ariaControls.link(button.element);
        if (!options?.skipFocus) {
          Keying.focusIn(toolbar);
        }
      });
    });
  }
};

const position = (button: AlloyComponent, toolbar: AlloyComponent, detail: FloatingToolbarButtonDetail, layouts: Layouts | undefined) => {
  const bounds = detail.getBounds.map((bounder) => bounder());
  const sink = detail.lazySink(button).getOrDie();

  Positioning.positionWithinBounds(sink, toolbar, {
    anchor: {
      type: 'hotspot',
      hotspot: button,
      layouts,
      overrides: {
        maxWidthFunction: MaxWidth.expandable()
      }
    }
  }, bounds);
};

const setGroups = (button: AlloyComponent, toolbar: AlloyComponent, detail: FloatingToolbarButtonDetail, layouts: Layouts | undefined, groups: AlloySpec[]) => {
  Toolbar.setGroups(toolbar, groups);
  position(button, toolbar, detail, layouts);
  Toggling.on(button);
};

const makeSandbox = (
  button: AlloyComponent,
  spec: FloatingToolbarButtonSpec,
  detail: FloatingToolbarButtonDetail,
  ariaControls: AriaControls.AriaManager
) => ({
  dom: {
    tag: 'div',
    attributes: {
      id: ariaControls.id
    }
  },
  behaviours: Behaviour.derive(
    [
      Keying.config({
        mode: 'special',
        onEscape: (toolbar) => {
          onClose(button, toolbar, ariaControls);
          return Optional.some<boolean>(true);
        }
      }),
      Sandboxing.config({
        isPartOf: (container, data, queryElem): boolean => {
          return ComponentStructure.isPartOf(data, queryElem) || ComponentStructure.isPartOf(button, queryElem);
        },
        getAttachPoint: () => {
          return detail.lazySink(button).getOrDie();
        }
      }),
      Receiving.config({
        channels: {
          ...Dismissal.receivingChannel({
            isExtraPart: Fun.never,
            ...detail.fireDismissalEventInstead.map((fe) => ({ fireEventInstead: { event: fe.event }} as any)).getOr({ })
          }),
          ...Reposition.receivingChannel({
            doReposition: () => {
              Sandboxing.getState(Coupling.getCoupled(button, 'toolbarSandbox')).each((toolbar) => {
                position(button, toolbar, detail, spec.layouts);
              });
            }
          })
        }
      })
    ]
  )
});

const factory: CompositeSketchFactory<FloatingToolbarButtonDetail, FloatingToolbarButtonSpec> = (detail, components, spec, externals): SketchSpec => {
  const ariaControls = AriaControls.manager();

  return {
    ...Button.sketch({
      ...externals.button(),
      action: (button) => {
        toggle(button, externals, detail, spec, ariaControls);
      },
      buttonBehaviours: SketchBehaviours.augment(
        { dump: externals.button().buttonBehaviours },
        [
          Coupling.config({
            others: {
              toolbarSandbox: (button) => {
                return makeSandbox(button, spec, detail, ariaControls);
              }
            }
          })
        ]
      )
    }),
    apis: {
      setGroups: (button: AlloyComponent, groups: AlloySpec[]) => {
        Sandboxing.getState(Coupling.getCoupled(button, 'toolbarSandbox')).each((toolbar) => {
          setGroups(button, toolbar, detail, spec.layouts, groups);
        });
      },
      reposition: (button: AlloyComponent) => {
        Sandboxing.getState(Coupling.getCoupled(button, 'toolbarSandbox')).each((toolbar) => {
          position(button, toolbar, detail, spec.layouts);
        });
      },
      toggle: (button: AlloyComponent, options: { skipFocus: boolean }) => {
        toggle(button, externals, detail, spec, ariaControls, options);
      },
      getToolbar: (button: AlloyComponent) => {
        return Sandboxing.getState(Coupling.getCoupled(button, 'toolbarSandbox'));
      },
      isOpen: (button: AlloyComponent) => {
        return Sandboxing.isOpen(Coupling.getCoupled(button, 'toolbarSandbox'));
      }
    }
  };
};

const FloatingToolbarButton: FloatingToolbarButtonSketcher = Sketcher.composite<FloatingToolbarButtonSpec, FloatingToolbarButtonDetail, FloatingToolbarButtonApis>({
  name: 'FloatingToolbarButton',
  factory,
  configFields: FloatingToolbarButtonSchema.schema(),
  partFields: FloatingToolbarButtonSchema.parts(),
  apis: {
    setGroups: (apis, button, groups) => {
      apis.setGroups(button, groups);
    },
    reposition: (apis, button) => {
      apis.reposition(button);
    },
    toggle: (apis, button, options) => {
      apis.toggle(button, options);
    },
    getToolbar: (apis, button) => apis.getToolbar(button),
    isOpen: (apis, button) => apis.isOpen(button)
  }
});

export { FloatingToolbarButton };
