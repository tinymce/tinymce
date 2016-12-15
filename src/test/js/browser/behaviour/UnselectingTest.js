asynctest(
  'UnselectingTest',
 
  [
    'ephox.agar.api.ApproxStructure',
    'ephox.agar.api.Assertions',
    'ephox.alloy.api.GuiFactory',
    'ephox.alloy.api.behaviour.Unselecting',
    'ephox.alloy.test.GuiSetup',
    'ephox.boulder.api.Objects'
  ],
 
  function (ApproxStructure, Assertions, GuiFactory, Unselecting, GuiSetup, Objects) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];

    GuiSetup.setup(function (store, doc, body) {
      return GuiFactory.build({
        uiType: 'container',
        behaviours: Objects.wrapAll([
          Unselecting.config({ })
        ])
      });

    }, function (doc, body, gui, component, store) {
      return [
        // TODO: Add behaviour testing. Probably webdriver tests.
        Assertions.sAssertStructure(
          'Check initial unselecting values',
          ApproxStructure.build(function (s, str, arr) {
            return s.element('div', {
              styles: {
                /* Browser dependent 
                '-webkit-user-select': str.is('none'),
                'user-select': str.is('none'),
                '-ms-user-select': str.is('none'),
                '-moz-user-select': str.is('-moz-none')
                */
              },
              attrs: {
                unselectable: str.is('on')
              }
            });
          }),
          component.element()
        )
      ];
    }, function () { success(); }, failure);

  }
);