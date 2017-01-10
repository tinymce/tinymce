asynctest(
  'InvalidatingTest',
 
  [
    'ephox.agar.api.ApproxStructure',
    'ephox.agar.api.Assertions',
    'ephox.agar.api.GeneralSteps',
    'ephox.agar.api.Guard',
    'ephox.agar.api.Logger',
    'ephox.agar.api.Step',
    'ephox.agar.api.UiControls',
    'ephox.alloy.api.component.GuiFactory',
    'ephox.alloy.api.behaviour.Behaviour',
    'ephox.alloy.api.behaviour.Invalidating',
    'ephox.alloy.api.ui.Container',
    'ephox.alloy.test.GuiSetup',
    'ephox.knoch.future.Future',
    'ephox.perhaps.Result',
    'ephox.sugar.api.Value'
  ],
 
  function (ApproxStructure, Assertions, GeneralSteps, Guard, Logger, Step, UiControls, GuiFactory, Behaviour, Invalidating, Container, GuiSetup, Future, Result, Value) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];

    GuiSetup.setup(function (store, doc, body) {
      return GuiFactory.build(
        Container.build({
          dom: {
            tag: 'input'
          },
          behaviours: Behaviour.derive([
            Invalidating.config({
              invalidClass: 'test-invalid',
              validator: {
                validate: function (input) {
                  var value = Value.get(input.element());
                  var res = value === 'good-value' ? Result.value('good-value') : Result.error('bad value: ' + value);
                  return Future.pure(res);
                },
                onEvent: 'custom.test.validate'
              }
            })
          ])
        })
      );
    }, function (doc, body, gui, component, store) {

      var sCheckValid = function (label) {
        return Logger.t(
          label,
          Step.control(

            Assertions.sAssertStructure(
              'Checking structure after marking valid',
              ApproxStructure.build(function (s, str, arr) {
                return s.element('input', {
                  classes: [
                    arr.not('test-invalid')
                  ]
                });
              }),
              component.element()
            ),
            Guard.tryUntil('valid', 100, 1000)
          )
        );
      };

      var sCheckInvalid = function (label) {
        return Logger.t(
          label,
          Step.control(
            Assertions.sAssertStructure(
              'Checking structure after marking invalid',
              ApproxStructure.build(function (s, str, arr) {
                return s.element('input', {
                  classes: [
                    arr.has('test-invalid')
                  ]
                });
              }),
              component.element()
            ),
            Guard.tryUntil('invalid', 100, 100)
          )
        );
      };

      var sValidate = GeneralSteps.sequence([
        Step.sync(function () {
          component.getSystem().triggerEvent('custom.test.validate', component.element(), { });
        }),
        // It is future based, so give it a bit of time. The rest of the assertions should all
        // repeat until as well to stop this being fragile. I just don't want it to pass incorrectly
        // because the validation hasn't finished yet.
        Step.wait(100)
      ]);

      return [
        sCheckValid('initial structure should be valid'),

        Step.sync(function () {
          Invalidating.markValid(component);
        }),

        sCheckValid('after 1xmarkValid, should be valid'),

        Step.sync(function () {
          Invalidating.markInvalid(component);
        }),

        sCheckInvalid('after markInvalid, should be invalid'),

        UiControls.sSetValueOn(gui.element(), 'input', 'good-value'),
        sValidate,
        sCheckValid('validation should have fixed it (eventually... because future based'),

        UiControls.sSetValueOn(gui.element(), 'input', 'bad-value'),
        sValidate,
        sCheckInvalid('validation should fail (eventually... because future based')
      ];
    }, function () { success(); }, failure);

  }
);