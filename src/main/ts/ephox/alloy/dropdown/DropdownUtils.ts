import { Fun, Future, Merger, Option, Result } from '@ephox/katamari';
import { Width } from '@ephox/sugar';

import * as ComponentStructure from '../alien/ComponentStructure';
import { Element } from '@ephox/sugar';
import * as Behaviour from '../api/behaviour/Behaviour';
import { Composing } from '../api/behaviour/Composing';
import { Coupling } from '../api/behaviour/Coupling';
import { Focusing } from '../api/behaviour/Focusing';
import { Positioning } from '../api/behaviour/Positioning';
import { Sandboxing } from '../api/behaviour/Sandboxing';
import { AlloyComponent } from '../api/component/ComponentApi';
import { TieredData, tieredMenu as TieredMenu } from '../api/ui/TieredMenu';
import * as AriaOwner from '../aria/AriaOwner';
import * as InternalSink from '../parts/InternalSink';
import { AnchorSpec } from '../positioning/mode/Anchoring';
import * as Tagger from '../registry/Tagger';
import * as Dismissal from '../sandbox/Dismissal';
import { CommonDropdownDetail } from '../ui/types/DropdownTypes';

const fetch = (detail: CommonDropdownDetail<TieredData>, component) => {
  const fetcher = detail.fetch();
  return fetcher(component);
};

const openF = (detail: CommonDropdownDetail<TieredData>, anchor: AnchorSpec, component, sandbox, externals) => {
  const futureData = fetch(detail, component);

  const lazySink = getSink(component, detail);

  // TODO: Make this potentially a single menu also
  return futureData.map((data) => {
    return TieredMenu.sketch(
      Merger.deepMerge(
        externals.menu(),
        {
          uid: Tagger.generate(''),
          data,

          onOpenMenu (tmenu, menu) {
            const sink = lazySink().getOrDie();
            Positioning.position(sink, anchor, menu);
            Sandboxing.decloak(sandbox);
          },

          onOpenSubmenu (tmenu, item, submenu) {
            const sink = lazySink().getOrDie();
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
        }
      )
    );
  });

};

// onOpenSync is because some operations need to be applied immediately, not wrapped in a future
// It can avoid things like flickering due to asynchronous bouncing
const open = (detail: CommonDropdownDetail<TieredData>, anchor: AnchorSpec, component: AlloyComponent, sandbox: AlloyComponent, externals, onOpenSync) => {
  const processed = openF(detail, anchor, component, sandbox, externals);
  return processed.map((data) => {
    Sandboxing.cloak(sandbox);
    Sandboxing.open(sandbox, data);
    onOpenSync(sandbox);
    return sandbox;
  });
};

const close = (detail: CommonDropdownDetail<TieredData>, anchor: AnchorSpec, component, sandbox, _externals, _onOpenSync) => {
  Sandboxing.close(sandbox);
  return Future.pure(sandbox);
};

const togglePopup = (detail: CommonDropdownDetail<TieredData>, anchor:AnchorSpec, hotspot: AlloyComponent, externals, onOpenSync) => {
  const sandbox = Coupling.getCoupled(hotspot, 'sandbox');
  const showing = Sandboxing.isOpen(sandbox);

  const action = showing ? close : open;
  return action(detail, anchor, hotspot, sandbox, externals, onOpenSync);
};

const matchWidth = (hotspot: AlloyComponent, container: AlloyComponent) => {
  const menu = Composing.getCurrent(container).getOr(container);
  const buttonWidth = Width.get(hotspot.element());
  Width.set(menu.element(), buttonWidth);
};

const getSink = (anyInSystem: AlloyComponent, detail: CommonDropdownDetail<any>) => {
  return anyInSystem.getSystem().getByUid(detail.uid() + '-' + InternalSink.suffix()).map((internalSink) => {
    return Fun.constant(
      Result.value(internalSink)
    );
  }).getOrThunk(() => {
    return detail.lazySink().fold(() => {
      return Fun.constant(
        Result.error(new Error(
          'No internal sink is specified, nor could an external sink be found'
        ))
      );
    }, Fun.identity);
  });
};

const makeSandbox = (detail: CommonDropdownDetail<TieredData>, anchor: AnchorSpec, anyInSystem: AlloyComponent, extras) => {
  const ariaOwner = AriaOwner.manager();

  const onOpen = (component, menu) => {
    ariaOwner.link(anyInSystem.element());
    if (detail.matchWidth()) { matchWidth(anyInSystem, menu); }
    detail.onOpen()(anchor, component, menu);
    if (extras !== undefined && extras.onOpen !== undefined) { extras.onOpen(component, menu); }
  };

  const onClose = (component, menu) => {
    ariaOwner.unlink(anyInSystem.element());
    if (extras !== undefined && extras.onClose !== undefined) { extras.onClose(component, menu); }
  };

  const lazySink = getSink(anyInSystem, detail);

  return {
    dom: {
      tag: 'div',
      attributes: {
        id: ariaOwner.id()
      }
    },
    behaviours: Behaviour.derive([
      Sandboxing.config({
        onOpen,
        onClose,
        isPartOf (container: AlloyComponent, data: AlloyComponent, queryElem: Element): boolean {
          return ComponentStructure.isPartOf(data, queryElem) || ComponentStructure.isPartOf(anyInSystem, queryElem);
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
    ]),
    events: { }
  };
};

export {
  makeSandbox,
  togglePopup,
  open,

  getSink
};