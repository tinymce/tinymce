import ComponentStructure from '../alien/ComponentStructure';
import Behaviour from '../api/behaviour/Behaviour';
import Composing from '../api/behaviour/Composing';
import Coupling from '../api/behaviour/Coupling';
import Focusing from '../api/behaviour/Focusing';
import Positioning from '../api/behaviour/Positioning';
import Sandboxing from '../api/behaviour/Sandboxing';
import TieredMenu from '../api/ui/TieredMenu';
import AriaOwner from '../aria/AriaOwner';
import InternalSink from '../parts/InternalSink';
import Tagger from '../registry/Tagger';
import Dismissal from '../sandbox/Dismissal';
import { Fun } from '@ephox/katamari';
import { Future } from '@ephox/katamari';
import { Merger } from '@ephox/katamari';
import { Option } from '@ephox/katamari';
import { Result } from '@ephox/katamari';
import { Remove } from '@ephox/sugar';
import { Width } from '@ephox/sugar';

var fetch = function (detail, component) {
  var fetcher = detail.fetch();
  return fetcher(component);
};

var openF = function (detail, anchor, component, sandbox, externals) {
  var futureData = fetch(detail, component);

  var lazySink = getSink(component, detail);

  // TODO: Make this potentially a single menu also
  return futureData.map(function (data) {
    return TieredMenu.sketch(
      Merger.deepMerge(
        externals.menu(),
        {
          uid: Tagger.generate(''),
          data: data,

          onOpenMenu: function (tmenu, menu) {
            var sink = lazySink().getOrDie();
            Positioning.position(sink, anchor, menu);
            Sandboxing.decloak(sandbox);
          },

          onOpenSubmenu: function (tmenu, item, submenu) {
            var sink = lazySink().getOrDie();
            Positioning.position(sink, {
              anchor: 'submenu',
              item: item,
              bubble: Option.none()
            }, submenu);
            Sandboxing.decloak(sandbox);

          },
          onEscape: function () {
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
var open = function (detail, anchor, component, sandbox, externals, onOpenSync) {
  var processed = openF(detail, anchor, component, sandbox, externals);
  return processed.map(function (data) {
    Sandboxing.cloak(sandbox);
    Sandboxing.open(sandbox, data);
    onOpenSync(sandbox);
    return sandbox;
  });
};

var close = function (detail, anchor, component, sandbox) {
  Sandboxing.close(sandbox);
  return Future.pure(sandbox);
};

var togglePopup = function (detail, anchor, hotspot, externals, onOpenSync) {
  var sandbox = Coupling.getCoupled(hotspot, 'sandbox');
  var showing = Sandboxing.isOpen(sandbox);

  var action = showing ? close : open;
  return action(detail, anchor, hotspot, sandbox, externals, onOpenSync);
};

var matchWidth = function (hotspot, container) {
  var menu = Composing.getCurrent(container).getOr(container);
  var buttonWidth = Width.get(hotspot.element());
  Width.set(menu.element(), buttonWidth);
};

var getSink = function (anyInSystem, detail) {
  return anyInSystem.getSystem().getByUid(detail.uid() + '-' + InternalSink.suffix()).map(function (internalSink) {
    return Fun.constant(
      Result.value(internalSink)
    );
  }).getOrThunk(function () {
    return detail.lazySink().fold(function () {
      return Fun.constant(
        Result.error(new Error(
          'No internal sink is specified, nor could an external sink be found'
        ))
      );
    }, Fun.identity);
  });
};

var makeSandbox = function (detail, anchor, anyInSystem, extras) {
  var ariaOwner = AriaOwner.manager();

  var onOpen = function (component, menu) {
    ariaOwner.link(anyInSystem.element());
    // TODO: Reinstate matchWidth
    if (detail.matchWidth()) matchWidth(anyInSystem, menu);
    detail.onOpen()(anchor, component, menu);
    if (extras !== undefined && extras.onOpen !== undefined) extras.onOpen(component, menu);
  };

  var onClose = function (component, menu) {
    ariaOwner.unlink(anyInSystem.element());
    if (extras !== undefined && extras.onClose !== undefined) extras.onClose(component, menu);
  };

  var lazySink = getSink(anyInSystem, detail);

  return {
    dom: {
      tag: 'div',
      attributes: {
        id: ariaOwner.id()
      }
    },
    behaviours: Behaviour.derive([
      Sandboxing.config({
        onOpen: onOpen,
        onClose: onClose,
        isPartOf: function (container, data, queryElem) {
          return ComponentStructure.isPartOf(data, queryElem) || ComponentStructure.isPartOf(anyInSystem, queryElem);
        },
        getAttachPoint: function () {
          return lazySink().getOrDie();
        }
      }),
      Composing.config({
        find: function (sandbox) {
          return Sandboxing.getState(sandbox).bind(function (menu) {
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

export default <any> {
  makeSandbox: makeSandbox,
  togglePopup: togglePopup,
  open: open,

  getSink: getSink
};