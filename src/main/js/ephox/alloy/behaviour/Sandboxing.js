define(
  'ephox.alloy.behaviour.Sandboxing',

  [
    'ephox.alloy.behaviour.Behaviour',
    'ephox.alloy.dom.DomModification',
    'ephox.alloy.sandbox.Manager',
    'ephox.boulder.api.FieldPresence',
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.ValueSchema',
    'ephox.peanut.Fun',
    'ephox.scullion.Cell',
    'ephox.sugar.api.Body',
    'ephox.sugar.api.Remove'
  ],

  function (Behaviour, DomModification, Manager, FieldPresence, FieldSchema, ValueSchema, Fun, Cell, Body, Remove) {
    var schema = FieldSchema.field(
      'sandboxing',
      'sandboxing',
      FieldPresence.asOption(),
      ValueSchema.objOf([
        FieldSchema.state('state', function () {
          return Cell({
            isClear: Fun.constant(true)
          });
        }),
        FieldSchema.defaulted('onOpen', Fun.noop),
        FieldSchema.defaulted('onClose', Fun.noop),
        FieldSchema.strict('sink'),
        FieldSchema.strict('manager')
      ])
    );

    var rebuildSandbox = function (sandbox, sInfo, data) {
      if (! sInfo.state().get().isClear()) Manager.clear(sandbox, sInfo);
      Remove.empty(sandbox.element());
      sInfo.sink().apis().addContainer(sandbox);
      sInfo.sink().getSystem().addToWorld(sandbox);
      var output = Manager.populate(sandbox, sInfo, data);
      sInfo.state().set(output);
    };

    var previewSandbox = function (sandbox, sInfo) {
      Manager.preview(sandbox, sInfo);
    };

    var gotoSandbox = function (sandbox, sInfo) {
      Manager.enter(sandbox, sInfo);
    };

    // Open sandbox transfers focus to the opened menu
    var openSandbox = function (sandbox, sInfo, futureData) {
      futureData.get(function (data) {
        rebuildSandbox(sandbox, sInfo, data);
        // Focus the sandbox.
        gotoSandbox(sandbox, sInfo);
        sInfo.onOpen()(sandbox, sInfo.state().get());
      });
    };

    // Show sandbox does not transfer focus to the opened menu
    var showSandbox = function (sandbox, sInfo, futureData) {
      futureData.get(function (data) {
        rebuildSandbox(sandbox, sInfo, data);
        // Preview the sandbox without focusing it
        previewSandbox(sandbox, sInfo);
        sInfo.onOpen()(sandbox, sInfo.state().get());
      });
    };

    var closeSandbox = function (sandbox, sInfo) {
      Manager.clear(sandbox, sInfo);
      Remove.empty(sandbox.element());
      sandbox.getSystem().removeFromWorld(sandbox);
      sInfo.sink().apis().removeContainer(sandbox);
      sInfo.onClose()(sandbox, sInfo.state().get());
    };

    var isShowing = function (sandbox, sInfo) {
      return Body.inBody(sandbox.element());
    };

    var isPartOf = function (sandbox, sInfo, queryElem) {
      return isShowing(sandbox, sInfo) && Manager.isPartOf(sandbox, sInfo, queryElem);
    };

    var getState = function (sandbox, sInfo) {
      return sInfo.state().get();
    };

    var exhibit = function (info, base) {
      return DomModification.nu({ });
    };

    var apis = function (info) {
      return {
        openSandbox: Behaviour.tryActionOpt('sandboxing', info, 'openSandbox', openSandbox),
        closeSandbox: Behaviour.tryActionOpt('sandboxing', info, 'closeSandbox', closeSandbox),
        isShowing: Behaviour.tryActionOpt('sandboxing', info, 'isShowing', isShowing),
        isPartOf: Behaviour.tryActionOpt('sandboxing', info, 'isPartOf', isPartOf),
        showSandbox: Behaviour.tryActionOpt('sandboxing', info, 'showSandbox', showSandbox),
        gotoSandbox: Behaviour.tryActionOpt('sandboxing', info, 'gotoSandbox', gotoSandbox),
        getState: Behaviour.tryActionOpt('sandboxing', info, 'getState', getState)
      };
    };

    return Behaviour.contract({
      name: Fun.constant('sandboxing'),
      exhibit: exhibit,
      handlers: Fun.constant({ }),
      apis: apis,
      schema: Fun.constant(schema)
    });
  }
);