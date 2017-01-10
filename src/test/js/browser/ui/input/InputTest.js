asynctest(
  'InputTest',
 
  [
    'ephox.agar.api.ApproxStructure',
    'ephox.agar.api.Assertions',
    'ephox.agar.api.GeneralSteps',
    'ephox.agar.api.Logger',
    'ephox.agar.api.Step',
    'ephox.alloy.api.component.GuiFactory',
    'ephox.alloy.api.behaviour.Focusing',
    'ephox.alloy.api.behaviour.Representing',
    'ephox.alloy.api.ui.Input',
    'ephox.alloy.test.GuiSetup',
    'ephox.fred.PlatformDetection'
  ],
 
  function (ApproxStructure, Assertions, GeneralSteps, Logger, Step, GuiFactory, Focusing, Representing, Input, GuiSetup, PlatformDetection) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];

    var platform = PlatformDetection.detect();

    GuiSetup.setup(function (store, doc, body) {
      return GuiFactory.build(
        Input.build({
          dom: {
            attributes: {
              placeholder: 'placeholder-text'    
            }
          },          
          data: {
            value: 'initial-value',
            text: 'Initial Value'
          },
          uid: 'test-input-id'
        })
      );

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
              value: str.is('Initial Value')
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

      var defaultCursor = platform.browser.isChrome() || platform.browser.isSafari() ? 'Initial Value'.length : 0;

      var testFocus = Logger.t(
        'Testing input.focus selects text inside',
        GeneralSteps.sequence([
          sCheckInputSelection('before focus', { start: defaultCursor, end: defaultCursor }),
          Step.sync(function () {
            Focusing.focus(component);
          }),
          sCheckInputSelection('after focus', { start: 0, end: 'Initial Value'.length })

        ])
      );

      var testRepresenting = Logger.t(
        'Checking that representing is working',
        Step.sync(function () {
          var data = Representing.getValue(component);
          Assertions.assertEq('Checking getValue', { value: 'initial-value', text: 'Initial Value' }, data);
          Representing.setValue(component, { value: 'v', text: 'V' });
          var newData = Representing.getValue(component);
          Assertions.assertEq('Checking getValue after setValue', { value: 'v', text: 'V' }, newData);
          Assertions.assertStructure(
            'Checking new structure of input',
            ApproxStructure.build(function (s, str, arr) {
              return s.element('input', {
                attrs: {
                  type: str.is('input'),
                  'data-alloy-id': str.is('test-input-id'),
                  placeholder: str.is('placeholder-text')
                },
                value: str.is('V')
              });
            }),
            component.element()
          );
        })

      );

      return [
        testStructure,
        testFocus,
        testRepresenting
      ];
    }, success, failure);
 
 

  }
);