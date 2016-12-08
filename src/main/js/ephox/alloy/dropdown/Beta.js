define(
  'ephox.alloy.dropdown.Beta',

  [
    'ephox.alloy.alien.ComponentStructure',
    'ephox.alloy.api.behaviour.Coupling',
    'ephox.alloy.api.behaviour.Keying',
    'ephox.alloy.api.behaviour.Positioning',
    'ephox.alloy.api.behaviour.Sandboxing',
    'ephox.alloy.api.ui.TieredMenu',
    'ephox.alloy.dropdown.Gamma',
    'ephox.alloy.registry.Tagger',
    'ephox.alloy.sandbox.Dismissal',
    'ephox.highway.Merger',
    'ephox.knoch.future.Future',
    'ephox.peanut.Fun',
    'ephox.perhaps.Option',
    'ephox.sugar.api.Remove',
    'ephox.sugar.api.Width',
    'global!Error'
  ],

  function (ComponentStructure, Coupling, Keying, Positioning, Sandboxing, TieredMenu, Gamma, Tagger, Dismissal, Merger, Future, Fun, Option, Remove, Width, Error) {
    
    var fetch = function (detail, component) {
      var fetcher = detail.fetch();
      return fetcher(component);
    };

    var openF = function (detail, anchor, component, sandbox, externals) {
      var futureData = fetch(detail, component);

      var lazySink = Gamma.getSink(component, detail);

      return futureData.map(function (data) {
        return TieredMenu.build(function () {
          return Merger.deepMerge(
            externals.menu(),
            {
              uid: Tagger.generate(''),
              data: data,

              onOpenMenu: function (sandbox, menu) {
                var sink = lazySink().getOrDie();
                Positioning.position(sink, anchor, menu);
              },

              onOpenSubmenu: function (sandbox, item, submenu) {
                var sink = lazySink().getOrDie();
                Positioning.position(sink, {
                  anchor: 'submenu',
                  item: item,
                  bubble: Option.none()
                }, submenu);

              },
              onEscape: function () {
                Sandboxing.close(sandbox);
                return Option.some(true);
              }
            }
          );
        });
      });

    };

    var open = function (detail, anchor, component, sandbox, externals) {
      var processed = openF(detail, anchor, component, sandbox, externals);
      return Sandboxing.open(sandbox, processed).map(function () {
        return sandbox;
      });
      // Sandboxing.open(sandbox, processed).get(function (tiers) {
      //   Highlighting.highlightFirst(tiers);
      //   Keying.focusIn(tiers);
      // });
    };

    var preview = function (detail, component, sandbox) {
      var futureData = fetch(detail, component);
      Sandboxing.open(sandbox, futureData).get(function () { });
    };

    var close = function (detail, anchor, component, sandbox) {
      Sandboxing.close(sandbox);
      // INVESTIGATE: Not sure if this is needed. 
      Remove.remove(sandbox.element());
      return Future.pure(sandbox);
    };

    var togglePopup = function (detail, anchor, hotspot, externals) {
      var sandbox = Coupling.getCoupled(hotspot, 'sandbox');
      var showing = Sandboxing.isOpen(sandbox);

      var action = showing ? close : open;
      return action(detail, anchor, hotspot, sandbox, externals);
    };

    var matchWidth = function (hotspot, container) {
      var buttonWidth = Width.get(hotspot.element());
      Width.set(container.element(), buttonWidth);
    };

    var makeSandbox = function (detail, anchor, anyInSystem, extras) {
      var onOpen = function (component, menu) {
        // TODO: Reinstate matchWidth
        // if (detail.matchWidth()) matchWidth(hotspot, menu);
        detail.onOpen()(anchor, component, menu);
        if (extras !== undefined && extras.onOpen !== undefined) extras.onOpen(component, menu);
      };

      var onClose = function (component, menu) {
        // FIX: Will need to do this for non split-dropdown
        // Toggling.deselect(hotspot);
        // FIX: Using to hack in turning off the arrow.
        if (extras !== undefined && extras.onClose !== undefined) extras.onClose(component, menu);
      };

      var lazySink = Gamma.getSink(anyInSystem, detail);

      var interactions = {
        onOpen: onOpen,
        onClose: onClose,
        onExecute: detail.onExecute(),
        lazySink: lazySink
      };

      var lazyAnchor = Fun.constant(anchor);
    
      return {
        uiType: 'custom',
        dom: {
          tag: 'div'
        },
        behaviours: {
          sandboxing: {
            onOpen: onOpen,
            onClose: onClose,
            isPartOf: function (container, data, queryElem) {
              return ComponentStructure.isPartOf(data, queryElem) || ComponentStructure.isPartOf(anyInSystem, queryElem);
            },
            bucket: {
              mode: 'sink',
              lazySink: lazySink
            }
          },
          receiving: Dismissal.receiving({
            isExtraPart: Fun.constant(false)
          })
        },
        events: { }
      };
    };
    
    var previewPopup = function (detail, hotspot) {
      var sandbox = Coupling.getCoupled(hotspot, 'sandbox');
      if (Sandboxing.isOpen(sandbox)) close(detail, hotspot, sandbox);
      preview(detail, hotspot, sandbox);
      return Option.some(true);
    };

    var enterPopup = function (detail, anchor, hotspot) {
      var sandbox = Coupling.getCoupled(hotspot, 'sandbox');
      if (Sandboxing.isOpen(sandbox)) {
        Sandboxing.getState(sandbox).each(function (tiers) {
          Keying.focusIn(tiers);
        });        
      } else {
        open(detail, anchor, hotspot, sandbox);
      }
      return Option.some(true);
    };

    var escapePopup = function (detail, hotspot) {
      var sandbox = Coupling.getCoupled(hotspot, 'sandbox');
      if (Sandboxing.isOpen(sandbox)) {
        close(detail, hotspot, sandbox);
        return Option.some(true);
      } else {
        return Option.none();
      }
    };

    return {
      makeSandbox: makeSandbox,
      togglePopup: togglePopup,

      escapePopup: escapePopup,
      previewPopup: previewPopup,
      enterPopup: enterPopup,

      open: open
    };
  }
);