asynctest(
  'InputSpecTest',
 
  [
    'ephox.agar.api.ApproxStructure',
    'ephox.agar.api.Assertions',
    'ephox.agar.api.GeneralSteps',
    'ephox.agar.api.Logger',
    'ephox.agar.api.Step',
    'ephox.alloy.api.GuiFactory',
    'ephox.alloy.test.GuiSetup'
  ],
 
  function (ApproxStructure, Assertions, GeneralSteps, Logger, Step, GuiFactory, GuiSetup) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];

    GuiSetup.setup(function (store, doc, body) {
      return GuiFactory.build({
        uiType: 'input',
        placeholder: 'placeholder-text',
        value: 'initial-value',
        uid: 'test-input-id'
      });

    }, function (doc, body, gui, component, store) {
      var testStructure = Step.sync(function () {
        Assertions.assertStructure(
          'Checking initial structure of input',
          ApproxStructure.build(function (s, str, arr) {
            return s.element('input', {
              attrs: {
                type: str.is('input'),
                'data-alloy-id': str.is('test-input-id'),
                placeholder: str.is('placeholder-text')
              },
              value: str.is('initial-value')
            });
          }),
          component.element()
        );
      });

      var sCheckInputSelection = function (label, expected) {
        return Step.sync(function () {
          Assertions.assertEq(
            label + '\nChecking selectionStart', 
            expected.start,
            component.element().dom().selectionStart
          );
          Assertions.assertEq(
            label + '\nChecking selectionEnd', 
            expected.end,
            component.element().dom().selectionEnd
          );
        });
      };

      var testFocus = Logger.t(
        'Testing input.focus selects text inside',
        GeneralSteps.sequence([
          sCheckInputSelection('before focus', { start: 'initial-value'.length, end: 'initial-value'.length }),
          Step.sync(function () {
            component.apis().focus();
          }),
          sCheckInputSelection('after focus', { start: 0, end: 'initial-value'.length })

        ])
      );
      return [
        testStructure,
        testFocus
      ];
    }, success, failure);
 
 

  }
);