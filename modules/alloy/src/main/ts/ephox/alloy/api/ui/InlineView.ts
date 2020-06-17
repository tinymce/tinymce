import { FieldSchema } from '@ephox/boulder';
import { Arr, Fun, Option } from '@ephox/katamari';
import { Element } from '@ephox/sugar';
import * as Boxes from '../../alien/Boxes';
import * as ComponentStructure from '../../alien/ComponentStructure';
import { AlloyComponent } from '../../api/component/ComponentApi';
import { AlloySpec, SketchSpec } from '../../api/component/SpecTypes';
import * as SystemEvents from '../../api/events/SystemEvents';
import * as Fields from '../../data/Fields';
import * as Layout from '../../positioning/layout/Layout';
import { AnchorSpec } from '../../positioning/mode/Anchoring';
import * as Dismissal from '../../sandbox/Dismissal';
import * as Reposition from '../../sandbox/Reposition';
import { InlineMenuSpec, InlineViewApis, InlineViewDetail, InlineViewSketcher, InlineViewSpec } from '../../ui/types/InlineViewTypes';
import { Positioning } from '../behaviour/Positioning';
import { Receiving } from '../behaviour/Receiving';
import { Representing } from '../behaviour/Representing';
import { Sandboxing } from '../behaviour/Sandboxing';
import { LazySink } from '../component/CommonTypes';
import * as SketchBehaviours from '../component/SketchBehaviours';
import * as Sketcher from './Sketcher';
import { tieredMenu as TieredMenu } from './TieredMenu';
import { SingleSketchFactory } from './UiSketcher';

interface InlineViewPositionState {
  mode: 'position';
  anchor: AnchorSpec;
  getBounds: () => Option<Boxes.Bounds>;
}

interface InlineViewMenuState {
  mode: 'menu';
  menu: InlineMenuSpec;
}

type InlineViewState = InlineViewMenuState | InlineViewPositionState;

const makeMenu = (detail: InlineViewDetail, menuSandbox: AlloyComponent, anchor: AnchorSpec, menuSpec: InlineMenuSpec, getBounds: () => Option<Boxes.Bounds>) => {
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
    highlightImmediately: menuSpec.menu.highlightImmediately,

    onEscape() {
      // Note for the future: this should possibly also call detail.onHide
      Sandboxing.close(menuSandbox);
      detail.onEscape.map((handler) => handler(menuSandbox));
      return Option.some<boolean>(true);
    },

    onExecute() {
      return Option.some<boolean>(true);
    },

    onOpenMenu(tmenu, menu) {
      Positioning.positionWithinBounds(lazySink().getOrDie(), anchor, menu, getBounds());
    },

    onOpenSubmenu(tmenu, item, submenu, triggeringPaths) {
      const sink = lazySink().getOrDie();
      Positioning.position(sink, {
        anchor: 'submenu',
        item,
        ...getSubmenuLayouts(triggeringPaths)
      }, submenu);
    },

    onRepositionMenu(tmenu, primaryMenu, submenuTriggers) {
      const sink = lazySink().getOrDie();
      Positioning.positionWithinBounds(sink, anchor, primaryMenu, getBounds());
      Arr.each(submenuTriggers, (st) => {
        const submenuLayouts = getSubmenuLayouts(st.triggeringPath);
        Positioning.position(sink, { anchor: 'submenu', item: st.triggeringItem, ...submenuLayouts }, st.triggeredMenu);
      });
    }
  });
};

const factory: SingleSketchFactory<InlineViewDetail, InlineViewSpec> = (detail: InlineViewDetail, spec): SketchSpec => {
  const isPartOfRelated = (sandbox: AlloyComponent, queryElem: Element) => {
    const related = detail.getRelated(sandbox);
    return related.exists((rel) => ComponentStructure.isPartOf(rel, queryElem));
  };

  const setContent = (sandbox: AlloyComponent, thing: AlloySpec) => {
    // Keep the same location, and just change the content.
    Sandboxing.setContent(sandbox, thing);
  };
  const showAt = (sandbox: AlloyComponent, anchor: AnchorSpec, thing: AlloySpec) => {
    showWithin(sandbox, anchor, thing, Option.none());
  };
  const showWithin = (sandbox: AlloyComponent, anchor: AnchorSpec, thing: AlloySpec, boxElement: Option<Element>) => {
    showWithinBounds(sandbox, anchor, thing, () => boxElement.map((elem) => Boxes.box(elem)));
  };
  const showWithinBounds = (sandbox: AlloyComponent, anchor: AnchorSpec, thing: AlloySpec, getBounds: () => Option<Boxes.Bounds>) => {
    const sink = detail.lazySink(sandbox).getOrDie();
    Sandboxing.openWhileCloaked(sandbox, thing, () => Positioning.positionWithinBounds(sink, anchor, sandbox, getBounds()));
    Representing.setValue(sandbox, Option.some({
      mode: 'position',
      anchor,
      getBounds
    }));
  };
  // TODO AP-191 write a test for showMenuAt
  const showMenuAt = (sandbox: AlloyComponent, anchor: AnchorSpec, menuSpec: InlineMenuSpec) => {
    showMenuWithinBounds(sandbox, anchor, menuSpec, () => Option.none());
  };
  const showMenuWithinBounds = (sandbox: AlloyComponent, anchor: AnchorSpec, menuSpec: InlineMenuSpec, getBounds: () => Option<Boxes.Bounds>) => {
    const menu = makeMenu(detail, sandbox, anchor, menuSpec, getBounds);
    Sandboxing.open(sandbox, menu);
    Representing.setValue(sandbox, Option.some({
      mode: 'menu',
      menu
    }));
  };
  const hide = (sandbox: AlloyComponent) => {
    if (Sandboxing.isOpen(sandbox)) {
      Representing.setValue(sandbox, Option.none());
      Sandboxing.close(sandbox);
    }
  };
  const getContent = (sandbox: AlloyComponent): Option<AlloyComponent> => Sandboxing.getState(sandbox);
  const reposition = (sandbox: AlloyComponent) => {
    if (Sandboxing.isOpen(sandbox)) {
      Representing.getValue(sandbox).each((state: InlineViewState) => {
        switch (state.mode) {
          case 'menu':
            Sandboxing.getState(sandbox).each((tmenu) => {
              TieredMenu.repositionMenus(tmenu);
            });
            break;
          case 'position':
            const sink = detail.lazySink(sandbox).getOrDie();
            Positioning.positionWithinBounds(sink, state.anchor, sandbox, state.getBounds());
            break;
        }
      });
    }
  };

  const apis = {
    setContent,
    showAt,
    showWithin,
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
          isPartOf(sandbox, data, queryElem) {
            return ComponentStructure.isPartOf(data, queryElem) || isPartOfRelated(sandbox, queryElem);
          },
          getAttachPoint(sandbox) {
            return detail.lazySink(sandbox).getOrDie();
          },
          onOpen(sandbox) {
            detail.onShow(sandbox);
          },
          onClose(sandbox) {
            detail.onHide(sandbox);
          }
        }),
        Representing.config({
          store: {
            mode: 'memory',
            initialValue: Option.none()
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
    FieldSchema.strict('lazySink'),
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
    FieldSchema.defaulted('getRelated', Option.none),
    FieldSchema.defaulted('isExtraPart', Fun.never),
    FieldSchema.defaulted('eventOrder', Option.none)
  ],
  factory,
  apis: {
    showAt: (apis, component, anchor, thing) => {
      apis.showAt(component, anchor, thing);
    },
    showWithin: (apis, component, anchor, thing, boxElement) => {
      apis.showWithin(component, anchor, thing, boxElement);
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
