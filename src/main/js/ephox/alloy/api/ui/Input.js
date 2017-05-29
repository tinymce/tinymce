define(
  'ephox.alloy.api.ui.Input',

  [
    'ephox.alloy.api.ui.Sketcher',
    'ephox.alloy.ui.common.InputBase'
  ],

  function (Sketcher, InputBase) {
    var factory = function (detail, spec) {
      return {
        uid: detail.uid(),
        dom: InputBase.dom(detail),
        // No children.
        components: [ ],
        behaviours: InputBase.behaviours(detail),
        eventOrder: detail.eventOrder()
      };
    };

    return Sketcher.single({
      name: 'Input',
      configFields: InputBase.schema(),
      factory: factory
    });
  }
);