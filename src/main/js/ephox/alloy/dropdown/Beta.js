define(
  'ephox.alloy.dropdown.Beta',

  [
    'ephox.alloy.dropdown.Gamma',
    'ephox.sugar.api.Remove',
    'global!Error'
  ],

  function (Gamma, Remove, Error) {
    
    var open = function (detail, component, sandbox) {
      var fetcher = detail.fetch();
      var futureData = fetcher();
      // Resolve the future to open the dropdown
      sandbox.apis().openSandbox(futureData).get(function () { });
    };

    var close = function (detail, component, sandbox) {
      sandbox.apis().closeSandbox();
      // INVESTIGATE: Not sure if this is needed. 
      Remove.remove(sandbox.element());
    };

    var togglePopup = function (detail, hotspot) {
      var sandbox = hotspot.apis().getCoupled('sandbox');
      var action = hotspot.apis().isSelected() ? open : close;
      action(detail, hotspot, sandbox);
    };

    var makeSandbox = function (detail, hotspot) {
      var onOpen = function (component, menu) {
        detail.onOpen()(hotspot, component, menu);
      };

      var onClose = function (component, menu) {
        hotspot.apis().deselect();
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

    return {
      makeSandbox: makeSandbox,
      togglePopup: togglePopup
    };
  }
);