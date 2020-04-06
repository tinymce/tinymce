import { Arr, Fun, Future, Option, Result } from '@ephox/katamari';
import { Css, Element, Width } from '@ephox/sugar';

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
import { SketchSpec } from '../api/component/SpecTypes';
import { TieredData, tieredMenu as TieredMenu } from '../api/ui/TieredMenu';
import * as AriaOwner from '../aria/AriaOwner';
import * as InternalSink from '../parts/InternalSink';
import { HotspotAnchorSpec } from '../positioning/mode/Anchoring';
import * as Tagger from '../registry/Tagger';
import * as Dismissal from '../sandbox/Dismissal';
import * as Reposition from '../sandbox/Reposition';
import { CommonDropdownDetail } from '../ui/types/DropdownTypes';

type OnOpenSyncFunc = (sandbox: AlloyComponent) => void;
type MapFetch = (tdata: Option<TieredData>) => Option<TieredData>;

export interface SandboxExtras {
  onClose?: (component: AlloyComponent, menu: AlloyComponent) => void;
  onOpen?: (component: AlloyComponent, menu: AlloyComponent) => void;
}

export enum HighlightOnOpen { HighlightFirst, HighlightNone }

const getAnchor = (
  detail: CommonDropdownDetail<TieredData>,
  component: AlloyComponent
): HotspotAnchorSpec => {
  const hotspot = detail.getHotspot(component).getOr(component);
  // type required on TS3.3, can remove once we upgrade to 3.4
  const anchor: 'hotspot' = 'hotspot';
  const overrides = detail.getAnchorOverrides();
  return detail.layouts.fold(
    () => ({ anchor, hotspot, overrides }),
    (layouts) => ({ anchor, hotspot, overrides, layouts })
  );
};


const fetch = (
  detail: CommonDropdownDetail<TieredData>,
  mapFetch: MapFetch,
  component: AlloyComponent
): Future<Option<TieredData>> => {
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
): Future<Option<SketchSpec>> => {
  const futureData: Future<Option<TieredData>> = fetch(detail, mapFetch, component);

  const getLazySink = getSink(component, detail);

  // TODO: Make this potentially a single menu also
  return futureData.map((tdata) => tdata.bind((data) => Option.from(TieredMenu.sketch({
    ...externals.menu(),

    uid: Tagger.generate(''),
    data,

    highlightImmediately: highlightOnOpen === HighlightOnOpen.HighlightFirst,

    onOpenMenu(tmenu, menu) {
      const sink = getLazySink().getOrDie();
      Positioning.position(sink, anchor, menu);
      Sandboxing.decloak(sandbox);
    },

    onOpenSubmenu(tmenu, item, submenu) {
      const sink = getLazySink().getOrDie();
      Positioning.position(sink, {
        anchor: 'submenu',
        item
      }, submenu);
      Sandboxing.decloak(sandbox);
    },

    onRepositionMenu(tmenu, primaryMenu, submenuTriggers) {
      const sink = getLazySink().getOrDie();
      Positioning.position(sink, anchor, primaryMenu);
      Arr.each(submenuTriggers, (st) => {
        Positioning.position(sink, { anchor: 'submenu', item: st.triggeringItem }, st.triggeredMenu);
      });
    },

    onEscape() {
      // Focus the triggering component after escaping the menu
      Focusing.focus(component);
      Sandboxing.close(sandbox);
      return Option.some(true);
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
) => {
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
) => {
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
) => {
  const sandbox = Coupling.getCoupled(hotspot, 'sandbox');
  const showing = Sandboxing.isOpen(sandbox);

  const action = showing ? close : open;
  return action(detail, mapFetch, hotspot, sandbox, externals, onOpenSync, highlightOnOpen);
};

const matchWidth = (hotspot: AlloyComponent, container: AlloyComponent, useMinWidth: boolean) => {
  const menu = Composing.getCurrent(container).getOr(container);
  const buttonWidth = Width.get(hotspot.element());
  if (useMinWidth) {
    Css.set(menu.element(), 'min-width', buttonWidth + 'px');
  } else {
    Width.set(menu.element(), buttonWidth);
  }
};

interface SinkDetail {
  uid: string;
  lazySink: Option<LazySink>;
}

const getSink = (
  anyInSystem: AlloyComponent,
  sinkDetail: SinkDetail
): () => ReturnType<LazySink> =>
  anyInSystem.
    getSystem().
    getByUid(sinkDetail.uid + '-' + InternalSink.suffix()).
    map((internalSink) => () => Result.value(internalSink)).
    getOrThunk(
      () => sinkDetail.lazySink.fold(
        () => () => Result.error(new Error(
          'No internal sink is specified, nor could an external sink be found'
        )),
        (lazySinkFn) => () => lazySinkFn(anyInSystem))
    );

const doRepositionMenus = (sandbox: AlloyComponent) => {
  Sandboxing.getState(sandbox).each((tmenu) => {
    TieredMenu.repositionMenus(tmenu);
  });
};

const makeSandbox = (
  detail: CommonDropdownDetail<TieredData>,
  hotspot: AlloyComponent,
  extras?: SandboxExtras
) => {
  const ariaOwner = AriaOwner.manager();

  const onOpen = (component: AlloyComponent, menu: AlloyComponent) => {
    const anchor = getAnchor(detail, hotspot);
    ariaOwner.link(hotspot.element());
    if (detail.matchWidth) {
      matchWidth(anchor.hotspot, menu, detail.useMinWidth);
    }
    detail.onOpen(anchor, component, menu);
    if (extras !== undefined && extras.onOpen !== undefined) {
      extras.onOpen(component, menu);
    }
  };

  const onClose = (component: AlloyComponent, menu: AlloyComponent) => {
    ariaOwner.unlink(hotspot.element());
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
        id: ariaOwner.id,
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
          isPartOf(container: AlloyComponent, data: AlloyComponent, queryElem: Element): boolean {
            return ComponentStructure.isPartOf(data, queryElem) || ComponentStructure.isPartOf(hotspot, queryElem);
          },
          getAttachPoint() {
            return lazySink().getOrDie();
          }
        }),
        Composing.config({
          find(sandbox: AlloyComponent): Option<AlloyComponent> {
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

const repositionMenus = (comp: AlloyComponent) => {
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
