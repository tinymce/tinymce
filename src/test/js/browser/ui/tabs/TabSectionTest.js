asynctest(
  'TabSection Test',
 
  [
    'ephox.agar.api.ApproxStructure',
    'ephox.agar.api.Assertions',
    'ephox.agar.api.Step',
    'ephox.agar.assertions.ApproxStructures',
    'ephox.alloy.api.GuiFactory',
    'ephox.alloy.api.ui.TabSection',
    'ephox.alloy.test.GuiSetup'
  ],
 
  function (ApproxStructure, Assertions, Step, ApproxStructures, GuiFactory, TabSection, GuiSetup) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];

    GuiSetup.setup(function (store, doc, body) {
      return GuiFactory.build(
        TabSection.build(function (parts) {
          return {
            dom: {
              tag: 'div'
            },
            components: [
              parts.tabbar().placeholder(),
              parts.tabview().placeholder()
            ],
            parts: {
              tabbar: parts.tabbar().build({
                dom: {
                  tag: 'div'
                }
              }),
              tabview: parts.tabview().build({
                dom: {
                  tag: 'div'
                }
              })
            }
          };
        })
      );

    }, function (doc, body, gui, component, store) {
      return [
        Assertions.sAssertStructure('Checking initial tab section', ApproxStructure.build(function (s, str, arr) {
          return s.element('div', {
            children: [
              s.element('div', { }),
              s.element('div', { })
            ]
          });
        }), component.element()),
        Step.fail('done')
      ];
    }, function () { success(); }, failure);

  }
);