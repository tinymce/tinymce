define(
  'ephox.alloy.dropdown.DropdownUtils',

  [
    'ephox.alloy.alien.ComponentStructure',
    'ephox.alloy.api.behaviour.Composing',
    'ephox.alloy.api.behaviour.Coupling',
    'ephox.alloy.api.behaviour.Focusing',
    'ephox.alloy.api.behaviour.Positioning',
    'ephox.alloy.api.behaviour.Sandboxing',
    'ephox.alloy.api.ui.TieredMenu',
    'ephox.alloy.aria.AriaOwner',
    'ephox.alloy.parts.InternalSink',
    'ephox.alloy.registry.Tagger',
    'ephox.alloy.sandbox.Dismissal',
    'ephox.katamari.api.Fun',
    'ephox.katamari.api.Future',
    'ephox.katamari.api.Merger',
    'ephox.katamari.api.Option',
    'ephox.katamari.api.Result',
    'ephox.sugar.api.dom.Remove',
    'ephox.sugar.api.view.Width',
    'global!Error'
  ],

  function (
    ComponentStructure, Composing, Coupling, Focusing, Positioning, Sandboxing, TieredMenu, AriaOwner, InternalSink, Tagger, Dismissal, Fun, Future, Merger,
    Option, Result, Remove, Width, Error
  ) {
    
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
                sandbox.getSystem().getByUid(detail.uid()).each(Focusing.focus);
                Sandboxing.close(sandbox);
                return Option.some(true);
              }
            }
          )
        );
      });

    };

    var open = function (detail, anchor, component, sandbox, externals) {
      var processed = openF(detail, anchor, component, sandbox, externals);
      return Sandboxing.open(sandbox, processed).map(function () {
        return sandbox;
      });
    };

    var close = function (detail, anchor, component, sandbox) {
      Sandboxing.close(sandbox);
      return Future.pure(sandbox);
    };

    var togglePopup = function (detail, anchor, hotspot, externals) {
      var sandbox = Coupling.getCoupled(hotspot, 'sandbox');
      var showing = Sandboxing.isOpen(sandbox);

      var action = showing ? close : open;
      return action(detail, anchor, hotspot, sandbox, externals);
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
          composing: {
            find: function (sandbox) {
              return Sandboxing.getState(sandbox).bind(function (menu) {
                return Composing.getCurrent(menu);
              });
            }
          },
          receiving: Dismissal.receiving({
            isExtraPart: Fun.constant(false)
          })
        },
        events: { }
      };
    };
    

    return {
      makeSandbox: makeSandbox,
      togglePopup: togglePopup,
      open: open
    };
  }
);