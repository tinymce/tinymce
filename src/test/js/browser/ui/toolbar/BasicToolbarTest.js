asynctest(
  'BasicToolbarTest',
 
  [
    'ephox.agar.api.ApproxStructure',
    'ephox.agar.api.Assertions',
    'ephox.agar.api.Step',
    'ephox.alloy.api.GuiFactory',
    'ephox.alloy.api.ui.Toolbar',
    'ephox.alloy.test.GuiSetup'
  ],
 
  function (ApproxStructure, Assertions, Step, GuiFactory, Toolbar, GuiSetup) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];

    GuiSetup.setup(function (store, doc, body) {
      return GuiFactory.build(
        Toolbar.build({
          dom: {
            tag: 'div'
          }
        })
      );

    }, function (doc, body, gui, component, store) {
      return [
        Assertions.sAssertStructure(
          'Checking initial structure of toolbar',
          ApproxStructure.build(function (s, str, arr) {
            return s.element('div', { });
          }),
          component.element()
        )
      ];
    }, function () { success(); }, failure);

  }
);