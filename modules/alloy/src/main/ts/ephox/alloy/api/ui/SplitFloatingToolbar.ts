import { Fun, Option } from '@ephox/katamari';
import { Element } from '@ephox/sugar';

import * as Behaviour from '../../api/behaviour/Behaviour';
import { CompositeSketchFactory } from '../../api/ui/UiSketcher';
import * as AriaOwner from '../../aria/AriaOwner';
import * as ComponentStructure from '../../alien/ComponentStructure';
import * as AlloyParts from '../../parts/AlloyParts';
import * as SplitToolbarUtils from '../../toolbar/SplitToolbarUtils';
import * as SplitToolbarBase from '../../ui/common/SplitToolbarBase';
import * as SplitFloatingToolbarSchema from '../../ui/schema/SplitFloatingToolbarSchema';
import { SplitFloatingToolbarDetail, SplitFloatingToolbarSketcher, SplitFloatingToolbarSpec } from '../../ui/types/SplitFloatingToolbarTypes';
import { Coupling } from '../behaviour/Coupling';
import { Focusing } from '../behaviour/Focusing';
import { Keying } from '../behaviour/Keying';
import { Positioning } from '../behaviour/Positioning';
import { Receiving } from '../behaviour/Receiving';
import { Sandboxing } from '../behaviour/Sandboxing';
import { Toggling } from '../behaviour/Toggling';
import { AlloyComponent } from '../component/ComponentApi';
import * as Sketcher from './Sketcher';
import * as Reposition from '../../sandbox/Reposition';

const toggleToolbar = (toolbar: AlloyComponent, detail: SplitFloatingToolbarDetail, externals: Record<string, any>) => {
  const sandbox = Coupling.getCoupled(toolbar, 'sandbox');
  if (Sandboxing.isOpen(sandbox)) {
    Sandboxing.close(sandbox);
  } else {
    Sandboxing.open(sandbox, externals.overflow());
  }
};

const isOpen = (over: AlloyComponent) => over.getSystem().isConnected();

const position = (toolbar: AlloyComponent, detail: SplitFloatingToolbarDetail, overf: AlloyComponent) => {
  const sink = detail.lazySink(toolbar).getOrDie();
  const anchor = detail.getAnchor(toolbar);
  const bounds = detail.getOverflowBounds.map((bounder) => bounder());
  Positioning.positionWithinBounds(sink, anchor, overf, bounds);
};

const refresh = (toolbar: AlloyComponent, detail: SplitFloatingToolbarDetail) => {
  const overflow = Sandboxing.getState(Coupling.getCoupled(toolbar, 'sandbox'));
  SplitToolbarUtils.refresh(toolbar, detail, overflow, isOpen);
  overflow.each((overf) => position(toolbar, detail, overf));
};

const reposition = (toolbar: AlloyComponent, detail: SplitFloatingToolbarDetail) => {
  const overflow = Sandboxing.getState(Coupling.getCoupled(toolbar, 'sandbox'));
  overflow.each((overf) => position(toolbar, detail, overf));
};

const makeSandbox = (toolbar: AlloyComponent, detail: SplitFloatingToolbarDetail) => {
  const ariaOwner = AriaOwner.manager();

  const onOpen = (sandbox: AlloyComponent, overf: AlloyComponent) => {
    // Refresh the content
    refresh(toolbar, detail);

    // Toggle the button and focus the first item in the overflow
    AlloyParts.getPart(toolbar, detail, 'overflow-button').each((button) => {
      Toggling.on(button);
      ariaOwner.link(button.element());
    });
    Keying.focusIn(overf);
  };

  const onClose = () => {
    // Toggle and focus the button
    AlloyParts.getPart(toolbar, detail, 'overflow-button').each((button) => {
      Toggling.off(button);
      Focusing.focus(button);
      ariaOwner.unlink(button.element());
    });
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
            return ComponentStructure.isPartOf(data, queryElem) || ComponentStructure.isPartOf(toolbar, queryElem);
          },
          getAttachPoint () {
            return detail.lazySink(toolbar).getOrDie();
          }
        }),
        Receiving.config({
          channels: {
            ...Reposition.receivingChannel({
              isExtraPart: Fun.constant(false),
              doReposition: () => reposition(toolbar, detail)
            })
          }
        }),
      ]
    )
  };
};

const factory: CompositeSketchFactory<SplitFloatingToolbarDetail, SplitFloatingToolbarSpec> = (detail, components, spec, externals) => {
  return SplitToolbarBase.spec(detail, components, spec, externals, {
    coupling: {
      sandbox (toolbar) {
        return makeSandbox(toolbar, detail);
      }
    },
    apis: {
      refresh: (toolbar) => refresh(toolbar, detail),
      toggle: (toolbar) => toggleToolbar(toolbar, detail, externals),
      getOverflow: (toolbar) => Sandboxing.getState(Coupling.getCoupled(toolbar, 'sandbox')),
      reposition: (toolbar) => reposition(toolbar, detail)
    }
  });
};

const SplitFloatingToolbar = Sketcher.composite({
  name: 'SplitFloatingToolbar',
  configFields: SplitFloatingToolbarSchema.schema(),
  partFields: SplitFloatingToolbarSchema.parts(),
  factory,
  apis: {
    setGroups(apis, toolbar, groups) {
      apis.setGroups(toolbar, groups);
    },
    refresh(apis, toolbar) {
      apis.refresh(toolbar);
    },
    reposition(apis, toolbar) {
      apis.reposition(toolbar);
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
}) as SplitFloatingToolbarSketcher;

export {
  SplitFloatingToolbar
};
