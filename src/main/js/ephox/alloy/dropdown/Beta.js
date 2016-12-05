define(
  'ephox.alloy.dropdown.Beta',

  [
    'ephox.alloy.api.behaviour.Coupling',
    'ephox.alloy.api.behaviour.Keying',
    'ephox.alloy.api.behaviour.Sandboxing',
    'ephox.alloy.dropdown.Gamma',
    'ephox.peanut.Fun',
    'ephox.perhaps.Option',
    'ephox.sugar.api.Remove',
    'ephox.sugar.api.Width',
    'global!Error'
  ],

  function (Coupling, Keying, Sandboxing, Gamma, Fun, Option, Remove, Width, Error) {
    
    var fetch = function (detail, component) {
      var fetcher = detail.fetch();
      return fetcher(component).map(detail.view().preprocess());
    };

    var open = function (detail, component, sandbox) {
      var futureData = fetch(detail, component);
      // Resolve the future to open the dropdown
      Sandboxing.open(sandbox, futureData).get(function () {
        Keying.focusIn(sandbox);
      });
    };

    var preview = function (detail, component, sandbox) {
      var futureData = fetch(detail, component);
      Sandboxing.open(sandbox, futureData).get(function () { });
    };

    var close = function (detail, component, sandbox) {
      Sandboxing.close(sandbox);
      // INVESTIGATE: Not sure if this is needed. 
      Remove.remove(sandbox.element());
    };

    var togglePopup = function (detail, hotspot) {
      var sandbox = Coupling.getCoupled(hotspot, 'sandbox');
      var showing = Sandboxing.isOpen(sandbox);
      var action = showing ? close : open;
      action(detail, hotspot, sandbox);
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