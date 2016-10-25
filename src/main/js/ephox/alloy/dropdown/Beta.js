define(
  'ephox.alloy.dropdown.Beta',

  [
    'ephox.perhaps.Result',
    'ephox.sugar.api.Remove',
    'global!Error'
  ],

  function (Result, Remove, Error) {
    return function (detail) {
      var open = function (component, sandbox) {
        var fetcher = detail.fetch();
        var futureData = fetcher();
        // Resolve the future to open the dropdown
        sandbox.apis().openSandbox(futureData).get(function () { });
      };

      var close = function (component, sandbox) {
        sandbox.apis().closeSandbox();
        // INVESTIGATE: Not sure if this is needed. 
        Remove.remove(sandbox.element());
      };

      var togglePopup = function (hotspot) {
        var sandbox = hotspot.apis().getCoupled('sandbox');
        var action = hotspot.apis().isSelected() ? open : close;
        action(hotspot, sandbox);
      };

      var makeSandbox = function (hotspot) {
        var onOpen = function (component, menu) {
          detail.onOpen()(hotspot, component, menu);
        };

        var onClose = function (component, menu) {
          hotspot.apis().deselect();
        };

        var sink = hotspot.getSystem().getByUid(detail.uid() + '-internal-sink').orThunk(function () {
          return detail.sink().fold(function () {
            return Result.error(new Error(
              'No internal sink is specified, not an external sink'
            ));
          }, Result.value);
        }).getOrDie();

        var interactions = {
          onOpen: onOpen,
          onClose: onClose,
          onExecute: detail.onExecute(),
          sink: sink
        };

        return detail.view().sandbox().spawn(hotspot, detail, interactions);
      };

      var makeSink = function (depInfo, s) {
        return {
          uid: detail.uid() + '-internal-sink',
          uiType: 'custom',
          dom: depInfo.extra.dom,
          components: depInfo.extra.components,
          positioning: {
            useFixed: true
          }
        };
      };

      return {
        makeSandbox: makeSandbox,
        togglePopup: togglePopup,
        makeSink: makeSink
      };
    };
  }
);