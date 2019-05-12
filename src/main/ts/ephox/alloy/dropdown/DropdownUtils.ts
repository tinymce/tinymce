import { Fun, Future, Option, Result } from '@ephox/katamari';
import { Width, Element, Css } from '@ephox/sugar';

import * as ComponentStructure from '../alien/ComponentStructure';
import { Composing } from '../api/behaviour/Composing';
import { Coupling } from '../api/behaviour/Coupling';
import { Focusing } from '../api/behaviour/Focusing';
import { Positioning } from '../api/behaviour/Positioning';
import { Sandboxing } from '../api/behaviour/Sandboxing';
import { AlloyComponent } from '../api/component/ComponentApi';
import { TieredData, tieredMenu as TieredMenu } from '../api/ui/TieredMenu';
import * as AriaOwner from '../aria/AriaOwner';
import * as InternalSink from '../parts/InternalSink';
import { HotspotAnchorSpec } from '../positioning/mode/Anchoring';
import * as Tagger from '../registry/Tagger';
import * as Dismissal from '../sandbox/Dismissal';
import { CommonDropdownDetail } from '../ui/types/DropdownTypes';
import { SketchBehaviours } from '../api/component/SketchBehaviours';
import { Representing } from '../api/behaviour/Representing';
import { LazySink } from '../api/component/CommonTypes';

export enum HighlightOnOpen { HighlightFirst, HighlightNone }

const getAnchor = (detail: CommonDropdownDetail<TieredData>, component: AlloyComponent): HotspotAnchorSpec => {
  const hotspot = detail.getHotspot(component).getOr(component);
  // type required on TS3.3, can remove once we upgrade to 3.4
  const anchor: 'hotspot' = 'hotspot';
  const overrides = detail.getAnchorOverrides();
  return detail.layouts.fold(() => {
    return { anchor, hotspot, overrides };
  }, (layouts) => {
    return { anchor, hotspot, overrides, layouts };
  });
};

const fetch = (detail: CommonDropdownDetail<TieredData>, mapFetch: (tdata: Option<TieredData>) => Option<TieredData>, component): Future<Option<TieredData>> => {
  const fetcher = detail.fetch;
  return fetcher(component).map(mapFetch);
};

const openF = (detail: CommonDropdownDetail<TieredData>, mapFetch: (tdata: Option<TieredData>) => Option<TieredData>, anchor: HotspotAnchorSpec, component, sandbox, externals, highlightOnOpen: HighlightOnOpen): Future<Option<any>> => {
  const futureData: Future<Option<TieredData>> = fetch(detail, mapFetch, component);

  const getLazySink = getSink(component, detail);

  // TODO: Make this potentially a single menu also
  return futureData.map((tdata) => {
    return tdata.bind((data) => {
      return Option.from(TieredMenu.sketch({
        ...externals.menu(),

        uid: Tagger.generate(''),
        data,

        highlightImmediately: highlightOnOpen === HighlightOnOpen.HighlightFirst,

        onOpenMenu (tmenu, menu) {
          const sink = getLazySink().getOrDie();
          Positioning.position(sink, anchor, menu);
          Sandboxing.decloak(sandbox);
        },

        onOpenSubmenu (tmenu, item, submenu) {
          const sink = getLazySink().getOrDie();
          Positioning.position(sink, {
            anchor: 'submenu',
            item
          }, submenu);
          Sandboxing.decloak(sandbox);

        },
        onEscape () {
          // Focus the triggering component after escaping the menu
          Focusing.focus(component);
          Sandboxing.close(sandbox);
          return Option.some(true);
        }
      }));
    });
  });
};

// onOpenSync is because some operations need to be applied immediately, not wrapped in a future
// It can avoid things like flickering due to asynchronous bouncing
const open = (detail: CommonDropdownDetail<TieredData>, mapFetch: (tdata: Option<TieredData>) => Option<TieredData>, hotspot: AlloyComponent, sandbox: AlloyComponent, externals, onOpenSync, highlightOnOpen: HighlightOnOpen) => {
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

const close = (detail: CommonDropdownDetail<TieredData>, mapFetch: (tdata: Option<TieredData>) => Option<TieredData>, component, sandbox, _externals, _onOpenSync, _highlightOnOpen: HighlightOnOpen) => {
  Sandboxing.close(sandbox);
  return Future.pure(sandbox);
};

const togglePopup = (detail: CommonDropdownDetail<TieredData>, mapFetch: (tdata: Option<TieredData>) => Option<TieredData>, hotspot: AlloyComponent, externals, onOpenSync, highlightOnOpen: HighlightOnOpen) => {
  const sandbox = Coupling.getCoupled(hotspot, 'sandbox');
  const showing = Sandboxing.isOpen(sandbox);

  const action = showing ? close : open;
  return action(detail, mapFetch, hotspot, sandbox, externals, onOpenSync, highlightOnOpen);
};

const matchWidth = (hotspot: AlloyComponent, container: AlloyComponent, useMinWidth) => {
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

const getSink = (anyInSystem: AlloyComponent, sinkDetail: SinkDetail): () => ReturnType<LazySink> => {
  return anyInSystem.getSystem().getByUid(sinkDetail.uid + '-' + InternalSink.suffix()).map((internalSink) => {
    return () => Result.value(internalSink);
  }).getOrThunk(() => {
    return sinkDetail.lazySink.fold(() => {
      return () => (
        Result.error(new Error(
          'No internal sink is specified, nor could an external sink be found'
        ))
      );
    },  (lazySinkFn) => {
      return () => lazySinkFn(anyInSystem);
    });
  });
};

const makeSandbox = (detail: CommonDropdownDetail<TieredData>, hotspot: AlloyComponent, extras) => {
  const ariaOwner = AriaOwner.manager();

  const onOpen = (component, menu) => {
    const anchor = getAnchor(detail, hotspot);
    ariaOwner.link(hotspot.element());
    if (detail.matchWidth) { matchWidth(anchor.hotspot, menu, detail.useMinWidth); }
    detail.onOpen(anchor, component, menu);
    if (extras !== undefined && extras.onOpen !== undefined) { extras.onOpen(component, menu); }
  };

  const onClose = (component, menu) => {
    ariaOwner.unlink(hotspot.element());
    if (extras !== undefined && extras.onClose !== undefined) { extras.onClose(component, menu); }
  };

  const lazySink = getSink(hotspot, detail);

  return {
    dom: {
      tag: 'div',
      classes: detail.sandboxClasses,
      // TODO: Add aria-selected attribute
      attributes: {
        id: ariaOwner.id(),
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
          isPartOf (container: AlloyComponent, data: AlloyComponent, queryElem: Element): boolean {
            return ComponentStructure.isPartOf(data, queryElem) || ComponentStructure.isPartOf(hotspot, queryElem);
          },
          getAttachPoint () {
            return lazySink().getOrDie();
          }
        }),
        Composing.config({
          find (sandbox: AlloyComponent): Option<AlloyComponent> {
            return Sandboxing.getState(sandbox).bind((menu) => {
              return Composing.getCurrent(menu);
            });
          }
        }),
        Dismissal.receivingConfig({
          isExtraPart: Fun.constant(false)
        })
      ]
    )
  };
};

export {
  makeSandbox,
  togglePopup,
  open,

  getSink
};