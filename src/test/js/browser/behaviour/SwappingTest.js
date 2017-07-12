asynctest(
  'SwappingTest',

  [
    'ephox.agar.api.ApproxStructure',
    'ephox.agar.api.Assertions',
    'ephox.agar.api.Step',
    'ephox.alloy.api.behaviour.Behaviour',
    'ephox.alloy.api.behaviour.Swapping',
    'ephox.alloy.api.component.GuiFactory',
    'ephox.alloy.api.ui.Container',
    'ephox.alloy.test.GuiSetup',
    'ephox.katamari.api.Arr',
    'ephox.katamari.api.Fun'
  ],

  function (
    ApproxStructure, Assertions, Step, Behaviour, Swapping, GuiFactory, Container, GuiSetup,
    Arr, Fun
  ) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];

    var ALPHA_CLS = Fun.constant('i-am-the-alpha');
    var OMEGA_CLS = Fun.constant('and-the-omega');

    GuiSetup.setup(function (store, doc, body) {
      return GuiFactory.build(
        Container.sketch({
          dom: {
            tag: 'div',
            styles: {
              background: 'steelblue',
              height: '200px',
              width: '200px'
            }
          },
          uid: 'wat-uid',
          containerBehaviours: Behaviour.derive([
            Swapping.config({
              alpha: ALPHA_CLS(),
              omega: OMEGA_CLS()
            })
          ])
        })
      );
    }, function (doc, body, gui, component, store) {
      /// string -> [string] -> [string] -> ()
      var assertClasses = function (label, has, not) {
        Assertions.assertStructure(
          'Asserting structure after: ' + label,
          ApproxStructure.build(function (s, str, arr) {
            return s.element('div', {
              classes: Arr.map(has, arr.has).concat(Arr.map(not, arr.not)),
              attrs: {
                'data-alloy-id': str.is('wat-uid')
              }
            })
          }),
          component.element()
        )
      };

      var testHasNoClass = function (label) {
        return Step.sync(function () {
          assertClasses(label, [], [ ALPHA_CLS(), OMEGA_CLS() ]);
        });
      };

      var testHasAlpha = function (label) {
        return Step.sync(function () {
          assertClasses(label, [ALPHA_CLS()], [OMEGA_CLS()]);
        });
      }

      var testHasOmega = function (label) {
        return Step.sync(function () {
          assertClasses(label, [OMEGA_CLS()], [ALPHA_CLS()]);
        });
      }

      var sAlpha = Step.sync(function () {
        Swapping.toAlpha(component);
      });

      var sOmega = Step.sync(function () {
        Swapping.toOmega(component);
      });

      var sClear = Step.sync(function () {
        Swapping.clear(component);
      });

      return [
        testHasNoClass('no initial class'),

        sAlpha,
        testHasAlpha('initial alpha class'),

        sOmega,
        testHasOmega('swap to omega class'),

        sAlpha,
        testHasAlpha('swap back to alpha class'),

        sClear,
        testHasNoClass('clear classes'),

        sOmega,
        testHasOmega('initial omega class'),

        sAlpha,
        testHasAlpha('swap to alpha class'),

        sOmega,
        testHasOmega('swap back to omega class'),

        sClear,
        testHasNoClass('clear classes')
      ];
    }, success, failure);
  }
);
