define(
  'ephox.alloy.dropdown.Beta',

  [
    'ephox.alloy.api.behaviour.Coupling',
    'ephox.alloy.api.behaviour.Highlighting',
    'ephox.alloy.api.behaviour.Keying',
    'ephox.alloy.api.behaviour.Positioning',
    'ephox.alloy.api.behaviour.Sandboxing',
    'ephox.alloy.dropdown.Gamma',
    'ephox.alloy.registry.Tagger',
    'ephox.alloy.ui.TieredMenuSpec',
    'ephox.compass.Obj',
    'ephox.peanut.Fun',
    'ephox.perhaps.Option',
    'ephox.sugar.api.Remove',
    'ephox.sugar.api.Width',
    'global!Error'
  ],

  function (Coupling, Highlighting, Keying, Positioning, Sandboxing, Gamma, Tagger, TieredMenuSpec, Obj, Fun, Option, Remove, Width, Error) {
    
    var fetch = function (detail, component) {
      var fetcher = detail.fetch();
      return fetcher(component).map(detail.view().preprocess());
    };

    var open = function (detail, anchor, component, sandbox) {
      var futureData = fetch(detail, component);

      var lazySink = Gamma.getSink(component, detail);

      var processed = futureData.map(function (data) {
        return TieredMenuSpec({
          uid: Tagger.generate(''),
          data: data,

          markers: Obj.map(detail.view().markers(), Fun.apply),
          members: Obj.map(detail.view().members(), Fun.apply),

// var showMenu = function (sandbox, tuple) {
        
//       };

//       var showSubmenu = function (sandbox, triggerItem, submenu) {
//         var sink = getSink();
//         Positioning.position(sink, {
//           anchor: 'submenu',
//           item: triggerItem,
//           bubble: Option.none()
//         }, submenu.container);
//       };
          onOpenMenu: function (sandbox, menu) {
            var sink = lazySink().getOrDie();
            Positioning.position(sink, anchor, menu);
          },

          onOpenSubmenu: function (sandbox, item, submenu) {


          },

          onExecute: function () {

          },
          onEscape: function () {
            Sandboxing.close(sandbox);
            return Option.some(true);
          }
        });
      });

      Sandboxing.open(sandbox, processed).get(function (tiers) {
        Highlighting.highlightFirst(tiers);
        Keying.focusIn(tiers);
      });
    };

    var preview = function (detail, component, sandbox) {
      var futureData = fetch(detail, component);
      Sandboxing.open(sandbox, futureData).get(function () { });
    };

    var close = function (detail, anchor, component, sandbox) {
      Sandboxing.close(sandbox);
      // INVESTIGATE: Not sure if this is needed. 
      Remove.remove(sandbox.element());
    };

    var togglePopup = function (detail, anchor, hotspot) {
      var sandbox = Coupling.getCoupled(hotspot, 'sandbox');
      var showing = Sandboxing.isOpen(sandbox);
      var action = showing ? close : open;
      action(detail, anchor, hotspot, sandbox);
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
      return detail.view().sandbox().spawn(lazyAnchor, detail, interactions);
    };

    
    var previewPopup = function (detail, hotspot) {
      var sandbox = Coupling.getCoupled(hotspot, 'sandbox');
      if (Sandboxing.isOpen(sandbox)) close(detail, hotspot, sandbox);
      preview(detail, hotspot, sandbox);
      return Option.some(true);
    };

    var enterPopup = function (detail, hotspot) {
      var sandbox = Coupling.getCoupled(hotspot, 'sandbox');
      if (Sandboxing.isOpen(sandbox)) {
        Keying.focusIn(sandbox);
      } else {
        open(detail, hotspot, sandbox);
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
      enterPopup: enterPopup
    };
  }
);