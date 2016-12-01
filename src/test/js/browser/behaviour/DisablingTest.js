asynctest(
  'DisablingTest',
 
  [
    'ephox.agar.api.ApproxStructure',
    'ephox.agar.api.Assertions',
    'ephox.agar.api.Chain',
    'ephox.agar.api.FocusTools',
    'ephox.agar.api.GeneralSteps',
    'ephox.agar.api.Keyboard',
    'ephox.agar.api.Keys',
    'ephox.agar.api.Logger',
    'ephox.agar.api.Mouse',
    'ephox.agar.api.Step',
    'ephox.alloy.api.GuiFactory',
    'ephox.alloy.api.Memento',
    'ephox.alloy.api.SystemEvents',
    'ephox.alloy.api.behaviour.Disabling',
    'ephox.alloy.construct.EventHandler',
    'ephox.alloy.test.GuiSetup',
    'ephox.boulder.api.Objects',
    'ephox.sugar.api.Focus'
  ],
 
  function (ApproxStructure, Assertions, Chain, FocusTools, GeneralSteps, Keyboard, Keys, Logger, Mouse, Step, GuiFactory, Memento, SystemEvents, Disabling, EventHandler, GuiSetup, Objects, Focus) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];

    var subject = Memento.record({
      uiType: 'button',
      dom: {
        tag: 'button',
        innerHtml: 'button'
      },
      behaviours: {
        disabling: {
          disabled: true
        }
      }
    });


    GuiSetup.setup(function (store, doc, body) {
      return GuiFactory.build({
        uiType: 'container',
        components: [
          subject.asSpec()
        ],
        events: Objects.wrap(
          SystemEvents.execute(),
          EventHandler.nu({
            run: store.adder('execute.reached')
          })
        )
      });
    }, function (doc, body, gui, component, store) {

      var sClickButton = Chain.asStep({ }, [
        Chain.mapper(function () {
          return subject.get(component).element();
        }),
        Mouse.cClick
      ]);

      var button = subject.get(component);
      return [
        Assertions.sAssertStructure(
          'Disabled should have a disabled attribute',
          ApproxStructure.build(function (s, str, arr) {
            return s.element('button', {
              attrs: {
                disabled: str.is('disabled')
              }
            });
          }),
          button.element()
        ),

        Logger.t(
          'Clicking on disabled button field should not fire event',
          GeneralSteps.sequence([
            Step.sync(function () {
              // TODO: Maybe replace with an alloy focus call
              Focus.focus(button.element());
            }),
            sClickButton,
            store.sAssertEq('Execute did not get past disabled button', [ ])
          ])
        ),

        
        Logger.t(
          'Re-enable button',
          Step.sync(function () {
            Disabling.enable(button);
          })
        ),

        Assertions.sAssertStructure(
          'After re-enabling, the disabled attribute should be removed',
          ApproxStructure.build(function (s, str, arr) {
            return s.element('button', {
              attrs: {
                disabled: str.none()
              }
            });
          }),
          button.element()
        ),

        Logger.t(
          'Clicking on enabled button field *should* fire event',
          GeneralSteps.sequence([
            Step.sync(function () {
              // TODO: Maybe replace with an alloy focus call
              Focus.focus(button.element());
            }),
            sClickButton,
            store.sAssertEq('Execute did not get past disabled button', [ 'execute.reached' ])
          ])
        )

      ];
    }, function () { success(); }, failure);

  }
);