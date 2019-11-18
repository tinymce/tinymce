import { Fun, Option } from '@ephox/katamari';
import { Element } from '@ephox/sugar';
import * as ComponentStructure from '../../alien/ComponentStructure';
import * as AriaOwner from '../../aria/AriaOwner';
import { Layouts } from '../../positioning/mode/Anchoring';
import * as Dismissal from '../../sandbox/Dismissal';
import * as Reposition from '../../sandbox/Reposition';
import * as FloatingToolbarButtonSchema from '../../ui/schema/FloatingToolbarButtonSchema';
import { FloatingToolbarButtonDetail, FloatingToolbarButtonSketcher, FloatingToolbarButtonSpec } from '../../ui/types/FloatingToolbarButtonTypes';
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
import { SketchSpec } from '../component/SpecTypes';
import { Button } from './Button';
import * as Sketcher from './Sketcher';
import { Toolbar } from './Toolbar';
import { CompositeSketchFactory } from './UiSketcher';

const toggle = (button: AlloyComponent, externals: Record<string, any>) => {
  const toolbarSandbox = Coupling.getCoupled(button, 'toolbarSandbox');
  if (Sandboxing.isOpen(toolbarSandbox)) {
    Sandboxing.close(toolbarSandbox);
  } else {
    Sandboxing.open(toolbarSandbox, externals.toolbar());
  }
};

const position = (button: AlloyComponent, detail: FloatingToolbarButtonDetail, layouts: Layouts, toolbar: AlloyComponent) => {
  const sink = detail.lazySink(button).getOrDie();

  Positioning.position(sink, {
    anchor: 'hotspot',
    hotspot: button,
    layouts
  }, toolbar);
};

const reposition = (button: AlloyComponent, detail: FloatingToolbarButtonDetail, layouts: Layouts) => {
  Sandboxing.getState(Coupling.getCoupled(button, 'toolbarSandbox')).each((overf) => {
    position(button, detail, layouts, overf);
  });
};

const makeSandbox = (button: AlloyComponent, spec: FloatingToolbarButtonSpec, detail: FloatingToolbarButtonDetail) => {
  const ariaOwner = AriaOwner.manager();

  const onOpen = (sandbox: AlloyComponent, toolbar: AlloyComponent) => {
    detail.fetch().get((groups) => {
      Toolbar.setGroups(toolbar, groups);
      position(button, detail, spec.layouts, toolbar);

      // Toggle the button and focus the first item in the overflow
      Toggling.on(button);
      ariaOwner.link(button.element());
      Keying.focusIn(toolbar);
    });
  };

  const onClose = () => {
    // Toggle and focus the button
    Toggling.off(button);
    Focusing.focus(button);
    ariaOwner.unlink(button.element());
  };

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
          onOpen,
          onClose,
          isPartOf (container: AlloyComponent, data: AlloyComponent, queryElem: Element): boolean {
            return ComponentStructure.isPartOf(data, queryElem) || ComponentStructure.isPartOf(button, queryElem);
          },
          getAttachPoint () {
            return detail.lazySink(button).getOrDie();
          }
        }),
        Receiving.config({
          channels: {
            ...Dismissal.receivingChannel({
              isExtraPart: Fun.constant(false)
            }),
            ...Reposition.receivingChannel({
              isExtraPart: Fun.constant(false),
              doReposition: () => reposition(button, detail, spec.layouts)
            })
          }
        })
      ]
    )
  };
};

const factory: CompositeSketchFactory<FloatingToolbarButtonDetail, FloatingToolbarButtonSpec> = (detail, components, spec, externals): SketchSpec => {
  return Button.sketch({
    ...externals.button(),
    action (button) {
      toggle(button, externals);
    },
    buttonBehaviours: SketchBehaviours.augment(
      { dump: externals.button().buttonBehaviours },
      [
        Coupling.config({
          others: {
            toolbarSandbox (button) {
              return makeSandbox(button, spec, detail);
            }
          }
        })
      ]
    )
  });
};

const FloatingToolbarButton = Sketcher.composite({
  name: 'FloatingToolbarButton',
  configFields: FloatingToolbarButtonSchema.schema(),
  partFields: FloatingToolbarButtonSchema.parts(),
  factory
}) as FloatingToolbarButtonSketcher;

export { FloatingToolbarButton };
