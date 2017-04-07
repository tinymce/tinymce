asynctest(
  'HtmlSelectTest',
 
  [
    'ephox.agar.api.Assertions',
    'ephox.agar.api.Chain',
    'ephox.agar.api.Step',
    'ephox.alloy.api.behaviour.Representing',
    'ephox.alloy.api.component.GuiFactory',
    'ephox.alloy.api.ui.HtmlSelect',
    'ephox.alloy.test.behaviour.RepresentPipes',
    'ephox.alloy.test.GuiSetup',
    'ephox.katamari.api.Fun'
  ],
 
  function (Assertions, Chain, Step, Representing, GuiFactory, HtmlSelect, RepresentPipes, GuiSetup, Fun) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];

    GuiSetup.setup(function (store, doc, body) {
      return GuiFactory.build(
        HtmlSelect.sketch({
          dom: { }, // is always a select
          
          options: [
            { value: 'alpha', text: 'Alpha' },
            { value: 'beta', text: 'Beta' },
            { value: 'gamma', text: 'Gamma' }
          ]
        })
      );
    }, function (doc, body, gui, component, store) {
      return [
        RepresentPipes.sAssertValue('Checking initial value', 'alpha', component),
        RepresentPipes.sSetValue(component, 'beta'),
        RepresentPipes.sAssertValue('Checking value after valid set', 'beta', component),
        RepresentPipes.sSetValue(component, 'delta'),
        RepresentPipes.sAssertValue('Checking value after invalid set (should still be on beta)', 'beta', component),
        RepresentPipes.sSetValue(component, 'gamma'),
        RepresentPipes.sAssertValue('Checking value after valid set (should now be gamma)', 'gamma', component)
      ];
    }, function () { success(); }, failure);

  }
);