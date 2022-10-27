import { FieldSchema } from '@ephox/boulder';
import { Arr, Fun, Optional } from '@ephox/katamari';
import { SugarElement } from '@ephox/sugar';

import * as Boxes from '../../alien/Boxes';
import * as ComponentStructure from '../../alien/ComponentStructure';
import { PlacementSpec } from '../../behaviour/positioning/PositioningTypes';
import * as Fields from '../../data/Fields';
import * as Layout from '../../positioning/layout/Layout';
import * as Dismissal from '../../sandbox/Dismissal';
import * as Reposition from '../../sandbox/Reposition';
import { InlineMenuSpec, InlineViewApis, InlineViewDetail, InlineViewSketcher, InlineViewSpec } from '../../ui/types/InlineViewTypes';
import { Positioning } from '../behaviour/Positioning';
import { Receiving } from '../behaviour/Receiving';
import { Representing } from '../behaviour/Representing';
import { Sandboxing } from '../behaviour/Sandboxing';
import { LazySink } from '../component/CommonTypes';
import { AlloyComponent } from '../component/ComponentApi';
import * as SketchBehaviours from '../component/SketchBehaviours';
import { AlloySpec, SketchSpec } from '../component/SpecTypes';
import * as SystemEvents from '../events/SystemEvents';
import * as Sketcher from './Sketcher';
import { tieredMenu as TieredMenu } from './TieredMenu';
import { SingleSketchFactory } from './UiSketcher';

interface InlineViewPositionState {
  mode: 'position';
  config: PlacementSpec;
  getBounds: () => Optional<Boxes.Bounds>;
}

interface InlineViewMenuState {
  mode: 'menu';
  menu: InlineMenuSpec;
}

type InlineViewState = InlineViewMenuState | InlineViewPositionState;

const makeMenu = (detail: InlineViewDetail, menuSandbox: AlloyComponent, placementSpec: PlacementSpec, menuSpec: InlineMenuSpec, getBounds: () => Optional<Boxes.Bounds>) => {
  const lazySink: () => ReturnType<LazySink> = () => detail.lazySink(menuSandbox);

  const layouts = menuSpec.type === 'horizontal' ? { layouts: {
    onLtr: () => Layout.belowOrAbove(),
    onRtl: () => Layout.belowOrAboveRtl()
  }} : { };

  const isFirstTierSubmenu = (triggeringPaths: string[]) => triggeringPaths.length === 2; // primary and first tier menu === 2 items
  const getSubmenuLayouts = (triggeringPaths: string[]) => isFirstTierSubmenu(triggeringPaths) ? layouts : { };

  return TieredMenu.sketch({
    dom: {
      tag: 'div'
    },

    data: menuSpec.data,
    markers: menuSpec.menu.markers,
    highlightOnOpen: menuSpec.menu.highlightOnOpen,
    fakeFocus: menuSpec.menu.fakeFocus,

    onEscape: () => {
      // Note for the future: this should possibly also call detail.onHide
      Sandboxing.close(menuSandbox);
      detail.onEscape.map((handler) => handler(menuSandbox));
      return Optional.some<boolean>(true);
    },

    onExecute: () => {
      return Optional.some<boolean>(true);
    },

    onOpenMenu: (tmenu, menu) => {
      Positioning.positionWithinBounds(lazySink().getOrDie(), menu, placementSpec, getBounds());
    },

    onOpenSubmenu: (tmenu, item, submenu, triggeringPaths) => {
      const sink = lazySink().getOrDie();
      Positioning.position(sink, submenu, {
        anchor: {
          type: 'submenu',
          item,
          ...getSubmenuLayouts(triggeringPaths)
        }
      });
    },

    onRepositionMenu: (tmenu, primaryMenu, submenuTriggers) => {
      const sink = lazySink().getOrDie();
      Positioning.positionWithinBounds(sink, primaryMenu, placementSpec, getBounds());
      Arr.each(submenuTriggers, (st) => {
        const submenuLayouts = getSubmenuLayouts(st.triggeringPath);
        Positioning.position(sink, st.triggeredMenu, {
          anchor: { type: 'submenu', item: st.triggeringItem, ...submenuLayouts }
        });
      });
    }
  });
};

const factory: SingleSketchFactory<InlineViewDetail, InlineViewSpec> = (detail: InlineViewDetail, spec): SketchSpec => {
  const isPartOfRelated = (sandbox: AlloyComponent, queryElem: SugarElement<Node>) => {
    const related = detail.getRelated(sandbox);
    return related.exists((rel) => ComponentStructure.isPartOf(rel, queryElem));
  };

  const setContent = (sandbox: AlloyComponent, thing: AlloySpec) => {
    // Keep the same location, and just change the content.
    Sandboxing.setContent(sandbox, thing);
  };

  const showAt = (sandbox: AlloyComponent, thing: AlloySpec, placementSpec: PlacementSpec) => {
    const getBounds = Optional.none;
    showWithinBounds(sandbox, thing, placementSpec, getBounds);
  };

  const showWithinBounds = (sandbox: AlloyComponent, thing: AlloySpec, placementSpec: PlacementSpec, getBounds: () => Optional<Boxes.Bounds>) => {
    const sink = detail.lazySink(sandbox).getOrDie();
    Sandboxing.openWhileCloaked(sandbox, thing, () => Positioning.positionWithinBounds(sink, sandbox, placementSpec, getBounds()));
    Representing.setValue(sandbox, Optional.some({
      mode: 'position',
      config: placementSpec,
      getBounds
    }));
  };

  // TODO AP-191 write a test for showMenuAt
  const showMenuAt = (sandbox: AlloyComponent, placementSpec: PlacementSpec, menuSpec: InlineMenuSpec) => {
    showMenuWithinBounds(sandbox, placementSpec, menuSpec, Optional.none);
  };

  const showMenuWithinBounds = (sandbox: AlloyComponent, placementSpec: PlacementSpec, menuSpec: InlineMenuSpec, getBounds: () => Optional<Boxes.Bounds>) => {
    const menu = makeMenu(detail, sandbox, placementSpec, menuSpec, getBounds);
    Sandboxing.open(sandbox, menu);
    Representing.setValue(sandbox, Optional.some({
      mode: 'menu',
      menu
    }));
  };

  const hide = (sandbox: AlloyComponent) => {
    if (Sandboxing.isOpen(sandbox)) {
      Representing.setValue(sandbox, Optional.none());
      Sandboxing.close(sandbox);
    }
  };

  const getContent = (sandbox: AlloyComponent): Optional<AlloyComponent> => Sandboxing.getState(sandbox);

  const reposition = (sandbox: AlloyComponent) => {
    if (Sandboxing.isOpen(sandbox)) {
      Representing.getValue(sandbox).each((state: InlineViewState) => {
        switch (state.mode) {
          case 'menu':
            Sandboxing.getState(sandbox).each(TieredMenu.repositionMenus);
            break;
          case 'position':
            const sink = detail.lazySink(sandbox).getOrDie();
            Positioning.positionWithinBounds(sink, sandbox, state.config, state.getBounds());
            break;
        }
      });
    }
  };

  const apis: InlineViewApis = {
    setContent,
    showAt,
    showWithinBounds,
    showMenuAt,
    showMenuWithinBounds,
    hide,
    getContent,
    reposition,
    isOpen: Sandboxing.isOpen
  };

  return {
    uid: detail.uid,
    dom: detail.dom,
    behaviours: SketchBehaviours.augment(
      detail.inlineBehaviours,
      [
        Sandboxing.config({
          isPartOf: (sandbox, data, queryElem) => {
            return ComponentStructure.isPartOf(data, queryElem) || isPartOfRelated(sandbox, queryElem);
          },
          getAttachPoint: (sandbox) => {
            return detail.lazySink(sandbox).getOrDie();
          },
          onOpen: (sandbox) => {
            detail.onShow(sandbox);
          },
          onClose: (sandbox) => {
            detail.onHide(sandbox);
          }
        }),
        Representing.config({
          store: {
            mode: 'memory',
            initialValue: Optional.none()
          }
        }),
        Receiving.config({
          channels: {
            ...Dismissal.receivingChannel({
              isExtraPart: spec.isExtraPart,
              ...detail.fireDismissalEventInstead.map((fe) => ({ fireEventInstead: { event: fe.event }} as any)).getOr({ })
            }),
            ...Reposition.receivingChannel({
              ...detail.fireRepositionEventInstead.map((fe) => ({ fireEventInstead: { event: fe.event }} as any)).getOr({ }),
              doReposition: reposition
            })
          }
        })
      ]
    ),
    eventOrder: detail.eventOrder,

    apis
  };
};

const InlineView: InlineViewSketcher = Sketcher.single<InlineViewSpec, InlineViewDetail, InlineViewApis>({
  name: 'InlineView',
  configFields: [
    FieldSchema.required('lazySink'),
    Fields.onHandler('onShow'),
    Fields.onHandler('onHide'),
    FieldSchema.optionFunction('onEscape'),
    SketchBehaviours.field('inlineBehaviours', [ Sandboxing, Representing, Receiving ]),
    FieldSchema.optionObjOf('fireDismissalEventInstead', [
      FieldSchema.defaulted('event', SystemEvents.dismissRequested())
    ]),
    FieldSchema.optionObjOf('fireRepositionEventInstead', [
      FieldSchema.defaulted('event', SystemEvents.repositionRequested())
    ]),
    FieldSchema.defaulted('getRelated', Optional.none),
    FieldSchema.defaulted('isExtraPart', Fun.never),
    FieldSchema.defaulted('eventOrder', Optional.none)
  ],
  factory,
  apis: {
    showAt: (apis, component, anchor, thing) => {
      apis.showAt(component, anchor, thing);
    },
    showWithinBounds: (apis, component, anchor, thing, bounds) => {
      apis.showWithinBounds(component, anchor, thing, bounds);
    },
    showMenuAt: (apis, component, anchor, menuSpec) => {
      apis.showMenuAt(component, anchor, menuSpec);
    },
    showMenuWithinBounds: (apis, component, anchor, menuSpec, bounds) => {
      apis.showMenuWithinBounds(component, anchor, menuSpec, bounds);
    },
    hide: (apis, component) => {
      apis.hide(component);
    },
    isOpen: (apis, component) => apis.isOpen(component),
    getContent: (apis, component) => apis.getContent(component),
    setContent: (apis, component, thing) => {
      apis.setContent(component, thing);
    },
    reposition: (apis, component) => {
      apis.reposition(component);
    }
  }
});

export { InlineView };
