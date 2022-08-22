import { Arr, Fun, Future, Optional, Result } from '@ephox/katamari';
import { Css, Width } from '@ephox/sugar';

import * as ComponentStructure from '../alien/ComponentStructure';
import { Composing } from '../api/behaviour/Composing';
import { Coupling } from '../api/behaviour/Coupling';
import { Focusing } from '../api/behaviour/Focusing';
import { Positioning } from '../api/behaviour/Positioning';
import { Receiving } from '../api/behaviour/Receiving';
import { Representing } from '../api/behaviour/Representing';
import { Sandboxing } from '../api/behaviour/Sandboxing';
import { LazySink } from '../api/component/CommonTypes';
import { AlloyComponent } from '../api/component/ComponentApi';
import { SketchBehaviours } from '../api/component/SketchBehaviours';
import { AlloySpec, SketchSpec } from '../api/component/SpecTypes';
import { TieredData, tieredMenu as TieredMenu } from '../api/ui/TieredMenu';
import * as AriaControls from '../aria/AriaControls';
import * as InternalSink from '../parts/InternalSink';
import { HotspotAnchorSpec } from '../positioning/mode/Anchoring';
import * as Tagger from '../registry/Tagger';
import * as Dismissal from '../sandbox/Dismissal';
import * as Reposition from '../sandbox/Reposition';
import { CommonDropdownDetail } from '../ui/types/DropdownTypes';
import { HighlightOnOpen } from '../ui/types/TieredMenuTypes';

type OnOpenSyncFunc = (sandbox: AlloyComponent) => void;
type MapFetch = (tdata: Optional<TieredData>) => Optional<TieredData>;

export interface SandboxExtras {
  onClose?: (component: AlloyComponent, menu: AlloyComponent) => void;
  onOpen?: (component: AlloyComponent, menu: AlloyComponent) => void;
}

const getAnchor = (
  detail: CommonDropdownDetail<TieredData>,
  component: AlloyComponent
): HotspotAnchorSpec => {
  const hotspot = detail.getHotspot(component).getOr(component);
  const type = 'hotspot';
  const overrides = detail.getAnchorOverrides();
  return detail.layouts.fold(
    () => ({ type, hotspot, overrides }),
    (layouts) => ({ type, hotspot, overrides, layouts })
  );
};

const fetch = (
  detail: CommonDropdownDetail<TieredData>,
  mapFetch: MapFetch,
  component: AlloyComponent
): Future<Optional<TieredData>> => {
  const fetcher = detail.fetch;
  return fetcher(component).map(mapFetch);
};

const openF = (
  detail: CommonDropdownDetail<TieredData>,
  mapFetch: MapFetch,
  anchor: HotspotAnchorSpec,
  component: AlloyComponent,
  sandbox: AlloyComponent,
  externals: any,
  highlightOnOpen: HighlightOnOpen
): Future<Optional<SketchSpec>> => {
  const futureData: Future<Optional<TieredData>> = fetch(detail, mapFetch, component);

  const getLazySink = getSink(component, detail);

  // TODO: Make this potentially a single menu also
  return futureData.map((tdata) => tdata.bind((data) => Optional.from(TieredMenu.sketch({
    // Externals are configured by the "menu" part. It's called external because it isn't contained
    // within the DOM descendants of the dropdown. You can configure things like `fakeFocus` here.
    ...externals.menu(),

    uid: Tagger.generate(''),
    data,

    highlightOnOpen,

    onOpenMenu: (tmenu, menu) => {
      const sink = getLazySink().getOrDie();
      Positioning.position(sink, menu, { anchor });
      Sandboxing.decloak(sandbox);
    },

    onOpenSubmenu: (tmenu, item, submenu) => {
      const sink = getLazySink().getOrDie();
      Positioning.position(sink, submenu, {
        anchor: {
          type: 'submenu',
          item
        }
      });
      Sandboxing.decloak(sandbox);
    },

    onRepositionMenu: (tmenu, primaryMenu, submenuTriggers) => {
      const sink = getLazySink().getOrDie();
      Positioning.position(sink, primaryMenu, { anchor });
      Arr.each(submenuTriggers, (st) => {
        Positioning.position(sink, st.triggeredMenu, {
          anchor: { type: 'submenu', item: st.triggeringItem }
        });
      });
    },

    onEscape: () => {
      // Focus the triggering component after escaping the menu
      Focusing.focus(component);
      Sandboxing.close(sandbox);
      return Optional.some(true);
    }
  }))));
};

// onOpenSync is because some operations need to be applied immediately, not wrapped in a future
// It can avoid things like flickering due to asynchronous bouncing
const open = (
  detail: CommonDropdownDetail<TieredData>,
  mapFetch: MapFetch,
  hotspot: AlloyComponent,
  sandbox: AlloyComponent,
  externals: any,
  onOpenSync: OnOpenSyncFunc,
  highlightOnOpen: HighlightOnOpen
): Future<AlloyComponent> => {
  const anchor = getAnchor(detail, hotspot);
  const processed = openF(detail, mapFetch, anchor, hotspot, sandbox, externals, highlightOnOpen);
  return processed.map((tdata) => {
    // If we have data, display a menu. Else, close the menu if it was open
    tdata.fold(
      () => {
        if (Sandboxing.isOpen(sandbox)) {
          Sandboxing.close(sandbox);
        }
      },
      (data) => {
        Sandboxing.cloak(sandbox);
        Sandboxing.open(sandbox, data);
        onOpenSync(sandbox);
      }
    );
    return sandbox;
  });
};

const close = (
  detail: CommonDropdownDetail<TieredData>,
  mapFetch: MapFetch,
  component: AlloyComponent,
  sandbox: AlloyComponent,
  _externals: any,
  _onOpenSync: OnOpenSyncFunc,
  _highlightOnOpen: HighlightOnOpen
): Future<AlloyComponent> => {
  Sandboxing.close(sandbox);
  return Future.pure(sandbox);
};

const togglePopup = (
  detail: CommonDropdownDetail<TieredData>,
  mapFetch: MapFetch,
  hotspot: AlloyComponent,
  externals: any,
  onOpenSync: OnOpenSyncFunc,
  highlightOnOpen: HighlightOnOpen
): Future<AlloyComponent> => {
  const sandbox = Coupling.getCoupled(hotspot, 'sandbox');
  const showing = Sandboxing.isOpen(sandbox);

  const action = showing ? close : open;
  return action(detail, mapFetch, hotspot, sandbox, externals, onOpenSync, highlightOnOpen);
};

const matchWidth = (hotspot: AlloyComponent, container: AlloyComponent, useMinWidth: boolean): void => {
  const menu = Composing.getCurrent(container).getOr(container);
  const buttonWidth = Width.get(hotspot.element);
  if (useMinWidth) {
    Css.set(menu.element, 'min-width', buttonWidth + 'px');
  } else {
    Width.set(menu.element, buttonWidth);
  }
};

interface SinkDetail {
  uid: string;
  lazySink: Optional<LazySink>;
}

const getSink = (
  anyInSystem: AlloyComponent,
  sinkDetail: SinkDetail
): () => ReturnType<LazySink> =>
  anyInSystem
    .getSystem()
    .getByUid(sinkDetail.uid + '-' + InternalSink.suffix())
    .map((internalSink) => () => Result.value(internalSink))
    .getOrThunk(
      () => sinkDetail.lazySink.fold(
        () => () => Result.error(new Error(
          'No internal sink is specified, nor could an external sink be found'
        )),
        (lazySinkFn) => () => lazySinkFn(anyInSystem))
    );

const doRepositionMenus = (sandbox: AlloyComponent): void => {
  Sandboxing.getState(sandbox).each((tmenu) => {
    TieredMenu.repositionMenus(tmenu);
  });
};

const makeSandbox = (
  detail: CommonDropdownDetail<TieredData>,
  hotspot: AlloyComponent,
  extras?: SandboxExtras
): AlloySpec => {
  const ariaControls = AriaControls.manager();

  const onOpen = (component: AlloyComponent, menu: AlloyComponent) => {
    const anchor = getAnchor(detail, hotspot);
    ariaControls.link(hotspot.element);
    if (detail.matchWidth) {
      matchWidth(anchor.hotspot, menu, detail.useMinWidth);
    }
    detail.onOpen(anchor, component, menu);
    if (extras !== undefined && extras.onOpen !== undefined) {
      extras.onOpen(component, menu);
    }
  };

  const onClose = (component: AlloyComponent, menu: AlloyComponent) => {
    ariaControls.unlink(hotspot.element);
    if (extras !== undefined && extras.onClose !== undefined) {
      extras.onClose(component, menu);
    }
  };

  const lazySink = getSink(hotspot, detail);

  return {
    dom: {
      tag: 'div',
      classes: detail.sandboxClasses,
      // TODO: Add aria-selected attribute
      attributes: {
        id: ariaControls.id,
        role: 'listbox'
      }
    },
    behaviours: SketchBehaviours.augment(
      detail.sandboxBehaviours,
      [
        Representing.config({
          store: {
            mode: 'memory',
            initialValue: hotspot
          }
        }),
        Sandboxing.config({
          onOpen,
          onClose,
          isPartOf: (container, data, queryElem): boolean => {
            return ComponentStructure.isPartOf(data, queryElem) || ComponentStructure.isPartOf(hotspot, queryElem);
          },
          getAttachPoint: () => {
            return lazySink().getOrDie();
          }
        }),
        // The Composing of the dropdown here is the the active menu of the TieredMenu
        // inside the sandbox.
        Composing.config({
          find: (sandbox: AlloyComponent): Optional<AlloyComponent> => {
            return Sandboxing.getState(sandbox).bind((menu) => Composing.getCurrent(menu));
          }
        }),
        Receiving.config({
          channels: {
            ...Dismissal.receivingChannel({
              isExtraPart: Fun.never
            }),
            ...Reposition.receivingChannel({
              doReposition: doRepositionMenus
            })
          }
        })
      ]
    )
  };
};

const repositionMenus = (comp: AlloyComponent): void => {
  const sandbox = Coupling.getCoupled(comp, 'sandbox');
  doRepositionMenus(sandbox);
};

export {
  makeSandbox,
  togglePopup,
  open,
  repositionMenus,

  getSink
};
