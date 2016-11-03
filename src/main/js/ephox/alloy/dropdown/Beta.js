define(
  'ephox.alloy.dropdown.Beta',

  [
    'ephox.alloy.dropdown.Gamma',
    'ephox.perhaps.Option',
    'ephox.sugar.api.Remove',
    'ephox.sugar.api.Width',
    'global!Error'
  ],

  function (Gamma, Option, Remove, Width, Error) {
    
    var fetch = function (detail, component) {
      var fetcher = detail.fetch();
      return fetcher(component).map(detail.view().preprocess());
    };

    var open = function (detail, component, sandbox) {
      var futureData = fetch(detail, component);
      // Resolve the future to open the dropdown
      sandbox.apis().openSandbox(futureData).get(function () { });
    };

    var preview = function (detail, component, sandbox) {
      var futureData = fetch(detail, component);
      sandbox.apis().showSandbox(futureData).get(function () { });
    };

    var close = function (detail, component, sandbox) {
      sandbox.apis().closeSandbox();
      // INVESTIGATE: Not sure if this is needed. 
      Remove.remove(sandbox.element());
    };

    var togglePopup = function (detail, hotspot) {
      var sandbox = hotspot.apis().getCoupled('sandbox');
      var showing = sandbox.apis().isShowing();
      var action = showing ? close : open;
      action(detail, hotspot, sandbox);
    };

    var matchWidth = function (hotspot, container) {
      var buttonWidth = Width.get(hotspot.element());
      Width.set(container.element(), buttonWidth);
    };

    var makeSandbox = function (detail, hotspot, extras) {
      var onOpen = function (component, menu) {
        if (detail.matchWidth()) matchWidth(hotspot, menu);
        detail.onOpen()(hotspot, component, menu);
        if (extras !== undefined && extras.onOpen !== undefined) extras.onOpen(component, menu);
      };

      var onClose = function (component, menu) {
        // FIX: Will need to do this for non split-dropdown
        // Toggling.deselect(hotspot);
        // FIX: Using to hack in turning off the arrow.
        if (extras !== undefined && extras.onClose !== undefined) extras.onClose(component, menu);
      };

      var sink = Gamma.getSink(hotspot, detail);

      var interactions = {
        onOpen: onOpen,
        onClose: onClose,
        onExecute: detail.onExecute(),
        sink: sink
      };

      return detail.view().sandbox().spawn(hotspot, detail, interactions);
    };

    
    var previewPopup = function (detail, hotspot) {
      var sandbox = hotspot.apis().getCoupled('sandbox');
      if (sandbox.apis().isShowing()) close(detail, hotspot, sandbox);
      preview(detail, hotspot, sandbox);
      return Option.some(true);
    };

    var enterPopup = function (detail, hotspot) {
      var sandbox = hotspot.apis().getCoupled('sandbox');
      if (sandbox.apis().isShowing()) {
        console.log('going to sandbox');
        sandbox.apis().gotoSandbox();
      } else {
        open(detail, hotspot, sandbox);
      }
      return Option.some(true);
    };

    var escapePopup = function (detail, hotspot) {
      var sandbox = hotspot.apis().getCoupled('sandbox');
      close(detail, hotspot, sandbox);
      return Option.some(true);
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