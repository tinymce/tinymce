asynctest(
  'HtmlSelectTest',

  [
    'ephox.agar.api.Logger',
    'ephox.agar.api.Pipeline',
    'ephox.agar.api.Step',
    'ephox.alloy.api.component.GuiFactory',
    'ephox.alloy.api.ui.HtmlSelect',
    'ephox.alloy.test.behaviour.RepresentPipes',
    'ephox.alloy.test.GuiSetup'
  ],

  function (Logger, Pipeline, Step, GuiFactory, HtmlSelect, RepresentPipes, GuiSetup) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];

    var sNoInitialValue = Step.async(function (next, die) {
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
      }, next, die);
    });

    var sHasInitialValue = Step.async(function (next, die) {
      GuiSetup.setup(function (store, doc, body) {
        return GuiFactory.build(
          HtmlSelect.sketch({
            dom: { }, // is always a select
            data: 'gamma',
            options: [
              { value: 'alpha', text: 'Alpha' },
              { value: 'beta', text: 'Beta' },
              { value: 'gamma', text: 'Gamma' }
            ]
          })
        );
      }, function (doc, body, gui, component, store) {
        return [
          RepresentPipes.sAssertValue('Checking initial value', 'gamma', component),
          RepresentPipes.sSetValue(component, 'beta'),
          RepresentPipes.sAssertValue('Checking value after valid set', 'beta', component),
          RepresentPipes.sSetValue(component, 'delta'),
          RepresentPipes.sAssertValue('Checking value after invalid set (should still be on beta)', 'beta', component),
          RepresentPipes.sSetValue(component, 'gamma'),
          RepresentPipes.sAssertValue('Checking value after valid set (should now be gamma)', 'gamma', component),
          RepresentPipes.sSetValue(component, 'alpha'),
          RepresentPipes.sAssertValue('Checking value after valid set (should now be alpha)', 'alpha', component)
        ];
      }, next, die);
    });

    Pipeline.async({}, [
      Logger.t('Scenario: no initial value', sNoInitialValue),
      Logger.t('Scenario: has initial value gamma', sHasInitialValue)
    ], function () { success(); }, failure);

  }
);